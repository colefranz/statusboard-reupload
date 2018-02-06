var Client = require('ssh2').Client,
		Q = require('q');

function executeCommandOnConnection(conn, command) {
	var deferred = Q.defer();
	conn.exec(command, function(error, stream) {
		var output = '';

		if (error) {
			deferred.reject(new Error(error));

			return deferred.promise;
		}
		stream.on('close', function() {
			deferred.resolve(output.toString());
		}).on('data', function(data) {
			output += data;
		})
		stream.on('exit', function() {
		});
	});

	return deferred.promise;
}


// for each thing that we need execute an ssh command on the server to
// get the information and parse it.
// This is currently done by creating a connection and passing the name
// of the connection and the bash command to the function above, which
// will return the output of the command.
module.exports = function(server) {
	var conn = new Client(),
			deferred = Q.defer();

	conn.on('ready', function() {
		executeCommandOnConnection(conn, 'grep release /etc/redhat-release')
		.then(function(output) {
			server.os = 'RHEL ' + output.match(/\d.\d/)[0];

			return executeCommandOnConnection(conn, 'lspci | grep VGA')
		})
		.then(function(output) {
			output = output.split('\n');
			// the type and number of GPUs in the system
			server.gpuType = output[0].match(/\[(.*)\]/)[0].replace(/\[(.*)\]/, '$1');

			return executeCommandOnConnection(conn, 'nvidia-installer -i')
		})
		.then(function(output) {
			var gpuDriver = output.match(/version:\s\d+.\d+.\d+/)[0].replace(/[^\d]+/, '');
			server.gpuDriver = gpuDriver;
			conn.end();
		})
		.catch(function(error) {
			deferred.reject(error);
		});

	})
	.on('close', function() {
		deferred.resolve(server);
	})
	.on('error', function(error) {
		deferred.reject(error);
	}).connect({
		host: server.name,
		port: 22,
		username: 'user',
		password: 'pass'
	});

	return deferred.promise;
};

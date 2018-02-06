// Gather dependencies
var Q = require('q'),
    parseInformationPages = require('./parseInformationPages'),
		parseRhelServer = require('./parseRhelServer'),
		parseWindowsServer = require('./parseWindowsServer'),
		exec = require('child_process').exec,
		os = require('os'),
		HTTPS = require('https');

function getBasicServerInformation(server) {
	// TODO
	// find server IP
	// find operating system
	// find port to use
	// find server URL http:// + server.name + : + port

	return server;
}

function findOS(server) {
	var deferred = Q.defer(),
			execPromise = Q.denodeify(exec);

	if (os.type().toLowerCase().indexOf('windows') !== -1) {

		execPromise('ping ' + server.name)
		.then(function(out, error, stderr) {
			var ttlMatches,
					ttl;

			if (stderr !== undefined || error !== undefined) {
				deferred.reject(error);
			}

			ttlMatches = out[0].match(/TTL=\d+/);
			ttl = parseInt(ttlMatches[0].replace( /^\D+/g, ''));

			// find IP address
			server.ip = out[0].match(/\d+.\d+.\d+.\d+/)[0];


			if (ttl > 100) {
				server.os = 'windows';
			} else {
				server.os = 'rhel';
			}

			server.status = 'good';
			deferred.resolve();
		},
		function(error) {
			console.log(server.name + ' error2');
			deferred.reject(error);
		});

		return deferred.promise;
	}
};

function findServerUrl(server) {
	var deferred = Q.defer(),
			sslPort = '443',
			serverUrl;

	if (server.os === 'rhel') {
		sslPort = '8443';
	}

	serverUrl = 'https://' + server.name + '.dev.calgaryscientific.com:' + sslPort;

	function handleError() {
		server.sslEnabled = false;
		deferred.resolve();
	}

	HTTPS.get(serverUrl, function(res) {
		server.url = serverUrl;
		server.sslEnabled = true;
		deferred.resolve();
	}).on('error', handleError)
	.setTimeout(2500, handleError);

	return deferred.promise;
}

function getAllServerInformation(server, callback) {
	// try and ping the server
	// determine the operating system

	// Give a server a URL regardless of its current state
	server.url = 'http://' + server.name + ':8080';

	findOS(server)
	.then(function() {
		return findServerUrl(server);
	})
	.then(function() {
		if (server.os === 'rhel') {
			return parseRhelServer(server);
		} else {
			return parseWindowsServer(server);
		}
	})
	.then(
		function() {
			return parseInformationPages(server);
		}
	)
	.then(
		function(serverData) {
			server.status = 'good';
			server.error = undefined;
			callback(serverData);
		}
	)
	.catch(function(error) {
		console.log(server.name + ' ' + error);
		server.status = 'bad'
		if (error.code !== undefined) {
			server.error = error.code
		} else {
			server.error = error;
		}
		callback(server);

		return;
	});

	// server = getBasicInformation(server);
	// server = findInformationFromAboutPages(server);
};

module.exports = {
	getAllServerInformation: getAllServerInformation
}
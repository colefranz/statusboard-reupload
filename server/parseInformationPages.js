// Gather dependencies
var HTTP = require('http'),
		Q = require('q'),
		parseString = require('xml2js').parseString;

module.exports = function (server) {
	var deferred = Q.defer(),
			loginInfo = '?username=user&password=pass',
			serverUrl = 'http://' + server.name + ':8080',
			infoUrl = serverUrl + '/pureweb/server/info.txt' + loginInfo,
			statusUrl = serverUrl + '/pureweb/server/status' + loginInfo,
			aboutUrl = serverUrl + '/pureweb/server/about' + loginInfo,
			repoUrl = serverUrl + '/pureweb/dicom/repositories' + loginInfo,
			clusterUrl = serverUrl + '/pureweb/config/plugins/cluster/properties' + loginInfo;

// Similar to parseRhelServer, we go through each publicly accessable URL to
// get some important information from it. For each URL we send off an HTTP
// request to the getDataFromURL function which will return the value of the
// http.get request.
	function getInfo(data) {
		var version,
				sourceRevision,
				sourceBranch,
				sourceDate,
				purewebVersion,
				hash;

		// Full workflow is
		// - Look for '<Field>: <data>'
		// - Remove everything before the ': '
		// - Remove a '\r' if there is one (windows servers return full xml
		//   so this is required)
		version = data.match(/Release: [^\n]+/);
		server.version = version[0].split(': ')[1].replace('\r', '');

		sourceRevision = data.match(/Source Revision: [^\n]+/);
		server.sourceRevision = sourceRevision[0].split(': ')[1].replace('\r', '');

		sourceBranch = data.match(/Source Branch:(.*)/);
		server.sourceBranch = sourceBranch[0].split(': ')[1].replace('\r', '');

		sourceDate = data.match(/Build Date: [^\n]+/);
		server.sourceDate = sourceDate[0].split(': ')[1].replace('\r', '');

		purewebVersion = data.match(/PureWeb Version: [^\n]+/);
		server.purewebVersion = purewebVersion[0].split(': ')[1].replace('\r', '');

		hash = data.match(/Source Hash: [^\n]+/);
		if (hash !== null) {
		server.hash =
			'https://github.com/calgaryscientific/resmd/commit/' +
			hash[0].split(': ')[1].replace('\r', '');
		}
	}

	function getStatus(data) {
		var load = data.match(/.*load\s(\d+).(\d+).*/)[0]
									 .replace(/.*load\s(\d+).(\d+).*/, '$1.$2')
									 .split('.');
		server.users = parseInt(load[0]);
		server.maxUsers = parseInt(load[1]);
	}

	function getAbout(data) {
		var plugin = data.match(/<plugins><entry><string>(\w*)<\/string>/);
		server.pluginName = plugin[0].replace(/<plugins><entry><string>(\w*)<\/string>/, '$1');
	}

	function getRepo(data) {
		var repos = [],
				deferred = Q.defer();

		parseString(data, function(err, result) {
			var i,
					list = result.RepositoryList.Repository;

			if (err) {
				deferred.reject(err);
			}

			for (i = 0; i < list.length; i++) {
				if (list[i].$.Name !== undefined) {
					repos.push(list[i].$.Name);
				}
			}

			server.repos = repos;

			deferred.resolve();
		});

		return deferred.promise;
	}

	function getCluster(data) {

	}

	function getDataFromURL(url) {
		var deferred = Q.defer();

		function handleError(error) {
			deferred.reject(error);
		}

		HTTP.get(url, function(res) {
			var body = '';
			res.on('data', function (data) {
				body += data.toString();
			});

			res.on('end', function() {
				deferred.resolve(body);
			});
		}).on('error', handleError).setTimeout(2500, handleError);

		return deferred.promise;
	}

	getDataFromURL(infoUrl)
	.then(function(data) {
		getInfo(data);
		return getDataFromURL(statusUrl);
	})
	.then(function(data) {
		getStatus(data);
		return getDataFromURL(aboutUrl);
	})
	.then(function(data) {
		getAbout(data);
		return getDataFromURL(repoUrl);
	})
	.then(function(data) {
		return getRepo(data);
	})
	.then(function() {
		return getDataFromURL(clusterUrl);
	})
	.then(function(data) {
		getCluster(data);

		deferred.resolve(server);
	})
	.catch(function(error) {
		console.log('Error getting information from info pages for ' + server.name);

		deferred.reject(error);
	})

	return deferred.promise;
};

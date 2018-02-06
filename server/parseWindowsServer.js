var wmi = require('node-wmi'),
		Q = require('q');

// totalQueries is a way of tracking how much we have done.
// Instead of linking all of the queries together such that
// they run synchronously, this seems like the best solution
// to run them asynchronously. I know there is a way with
// Q.all() but this is currently how it works.
module.exports = function(server) {
	var deferred = Q.defer(),
			count = 0,
			totalQueries = 3;

	/**************************
		IMPORTANT NOTE:
	* The WMI package is currently busted. It is CRUCIAL
	* that after running an NPM install that you go into
	* /node_modules/node-wmi/lib/Query.js and replace the
	* if/else body on line 207 with

	*   value = value.split('.')[0];
	*   value = value.slice(0, 8) + 'T' + value.slice(8);
	*   value = moment(value).toDate();
	*
	* If someone has a better way of handling this please do so.
	*
	**************************/

	// if we have completed all our queries it is time to exit
	function finishQuery() {
		count++;

		if (count === totalQueries) {
			deferred.resolve(server);
		}
	};

	// Get and parse the operating system from WMI
	wmi.Query({
		host: server.name,
		class: 'Win32_OperatingSystem',
		username: 'user',
		password: 'pass'
	}, function(error, bios) {
		if (error) {
			deferred.reject(error);

			return deferred;
		}
		server.os = 'Windows ' + bios[0].Name.match(/\d+/)[0];

		finishQuery();
	});

	// Get and parse the video card from WMI
	wmi.Query({
		host: server.name,
		class: 'Win32_VideoController',
		username: 'user',
		password: 'pass'
	}, function(error, bios) {
		if (error) {
			deferred.reject(error);

			return deferred;
		}
		server.gpuType = bios[0].Name;

		finishQuery();
	});

	// Get and parse the GPU driver from WMI
	wmi.Query({
		host: server.name,
		class: 'Win32_DisplayConfiguration',
		username: 'user',
		password: 'pass'
	}, function(error, bios) {
		if (error) {
			deferred.reject(error);

			return deferred;
		}
		server.gpuDriver = bios[0].DriverVersion;

		finishQuery();
	});

	return deferred.promise;
};

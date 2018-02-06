(function(angular) {
	'use strict';

	angular.module('statusboard', [])

	.controller('StatusBoardController', [
		'$scope',
		'$http',
		'$interval',
		'$document',
		'$timeout',
		'serverURL',
		function(
			$scope,
			$http,
			$interval,
			$document,
			$timeout,
			serverURL) {
			$scope.servers = [];
			$scope.modalState = {
				active: false
			};

			$scope.handleNewServerModal = function() {
				$scope.resetForm();
				$scope.modalState.active = true;
			};

			$scope.filterTracker = {};
			$scope.activeFilters = {};

			$scope.closeModal = function() {
				$timeout(function() {
					$scope.modalState.active = false;
				}, 0);
			};

			$document.on('keydown', function(event) {
				if(event.keyCode === 27) {
					$scope.closeModal();
				}
			});

			$scope.refreshServers = function() {
				$http.get(serverURL + ':8081/servers').then(
					function(response) {
						$scope.servers = response.data;
						$scope.$broadcast('serversRefreshed');
					},
					function(response) {
						console.log('Error fetching servers.');
					}
				);
			};

			// Currently interval refresh is disabled as filtering will be reset every time
			// that the servers are updated. There is a comment in serverFiltersDirective.js
			// that describes how to fix this (sort of)
			$scope.refreshServers();
			// $interval($scope.refreshServers, 10000);

			$scope.tooltips = {
				refreshServers: 'Refresh Servers',
				addServer: 'Add new server'
			};
		}
	])
	.value('serverURL', 'http://' + window.location.hostname);
})(angular);

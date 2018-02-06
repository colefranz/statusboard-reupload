(function(angular) {

	'use strict';

	angular.module('statusboard')
	.directive('server', ['$http', '$window', 'serverURL', function($http, $window, serverURL) {
		return {
			templateUrl: 'serverDirective/server.html',
			restrict: 'E',
			replace: true,
			link: function(scope, element) {
				scope.state = {
					active: false
				};

				/*
				  Currently, the server fields are kept up-to-date as they are edited.
				  Possibly TODO: Replace watches with a sytem where updates only happen
				  when 'enter' is pressed
				*/
				function updateField(newData) {
					$http.post(serverURL + ':8081/server/update?data=' + JSON.stringify(newData))
						.then(function(response) {},
						function(response) {
							console.log('Error updating server');
						}
					);
				}

				scope.$watch('server.team', function(team) {
					var newData = {
						name: scope.server.name,
						team: team
					};

					updateField(newData);
				});

				scope.$watch('server.location', function(location) {
					var newData = {
						name: scope.server.name,
						location: location
					};

					updateField(newData);
				});

				scope.$watch('server.comments', function(comments) {
					var newData = {
						name: scope.server.name,
						comments: comments
					};

					updateField(newData);
				});
				
				scope.toggleActive = function() {
					scope.state.active = !scope.state.active;
				};

				scope.confirmDeleteServer = function() {
					var deleteServer = confirm('You are about to delete a server. Press OK to confirm.');
					if (deleteServer === true) {
						scope.deleteServer();
					}
				}

				scope.deleteServer = function() {
					var serverData = JSON.stringify({name: scope.server.name});
					$http.post(serverURL + ':8081/server/delete?data=' + serverData)
						.then(function(response) {
							scope.refreshServers();
						},
						function(response) {
							console.log('Error deleting server');
						}
					);
				};

				scope.launchURL = function(url) {
					$window.open(url, '_blank');
				}

				scope.handleLaunchServerPage = function() {
					scope.launchURL(scope.server.url);
				};

				/*
				  TODO: Add in copyToClipboard functionality 
				*/

				scope.tooltips = {
					title: 'Go to server',
					deleteServer: 'Delete Server',
					serverRevision: 'Source Revision Number',
					expandToggle: 'View more information',
					collapseToggle: 'View less information',
					copyToClipboard: 'Copy server info to clipboard'
				};
			}
		}
	}]);
})(angular);

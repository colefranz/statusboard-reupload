(function(angular) {

	'use strict';

	angular.module('statusboard')
	.directive('newServer', ['$http', 'serverURL', function($http, serverURL) {
		return {
			templateUrl: 'newServerDirective/newServer.html',
			restrict: 'E',
			replace: true,
			link: function(scope, element) {
				scope.form = {
					name: undefined,
					team: undefined,
					location: undefined
				};

				/* 
				  handle submission of the form by sending it to the server
				*/
				scope.submitForm = function() {
					$http.post(serverURL + ':8081/server/new?data=' + JSON.stringify(scope.form))
					.then(function(response) {
						scope.closeModal();
						scope.refreshServers();
					},
					function(response) {
						console.log('error creating server');
					});
				};

				scope.resetForm = function() {
					var serverNameInput;

					scope.form.name = undefined;
					scope.form.team = undefined;
					scope.form.location = undefined;

					serverNameInput = element.find('input')[0];
        	        serverNameInput.focus();
        	        serverNameInput.select();
				};
			}
		}
	}]);
})(angular);

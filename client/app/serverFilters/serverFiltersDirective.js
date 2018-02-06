(function(angular) {

	'use strict';

	angular.module('statusboard')
	.directive('serverFilters', ['serverURL', function(serverURL) {
		return {
			templateUrl: 'serverFilters/serverFilters.html',
			restrict: 'E',
			replace: true,
			link: function(scope, element) {
				scope.filteringActive = false;

				scope.setFilteringActive = function(isActive) {
					scope.filteringActive = isActive;
				};

				// Turn off all filters for all filter groups
				scope.resetAllFiltering = function() {
					scope.setFilteringActive(false);

					_.forEach(scope.filterTracker, function(filterGroup) {
						filterGroup.active = false;

						_.forEach(filterGroup.tags, function(tracker) {
							tracker.value = false;
						});
					});
					
					scope.activeFilters = {};
				};

				// OS is always setup as "<OS TYPE> <OS VERSION>" so
				// simply split the type and only use it.
				function removeExcessFromName(tagToFilter, value) {
					if (tagToFilter === 'os') {
						return value.split(' ')[0];
					}

					return value;
				}

				// something in here needs to change if we want to do
				// the interval refresh again, filters seems to be
				// the only thing holding us back currently.
				// I suggest changing filterObjects from being
				// and object to being an array of objects in order to
				// make it easier to work with
				function filterUnique(tagToFilter) {
					var newFields = {
								name: tagToFilter,
								active: false,
								tags: {}
							},
							tag;

					_.forEach(scope.servers, function(server) {
						//	if the tag exists and isn't yet added (uniqueness)
						if (server[tagToFilter] !== '' &&
								server[tagToFilter] !== undefined &&
								newFields.tags[server[tagToFilter]] === undefined) {
							// remove excess, currently just to remove numbers from OS.
							tag = removeExcessFromName(tagToFilter, server[tagToFilter]);
							
							// if the tag already exists use the old one
							if (scope.filterTracker[tagToFilter] !== undefined &&
									scope.filterTracker[tagToFilter][tag] !== undefined) {
								newFields.tags[tag] =
									scope.filterTracker[tagToFilter][tag];
							} else {
								// otherwise add it
								newFields.tags[tag] = {
									name: tag,
									tag: tagToFilter,
									value: false
								};
							}
						}
					});

					return newFields;
				}

				// if the filter is not active, turn off any other filters that
				// may be on and then make the filter active.
				// otherwise turn off the filter for yourself.
				scope.toggleFilter = function(filter) {
					if (filter.value === false) {
						_.forEach(scope.filterTracker[filter.tag].tags, function(tracker) {
							tracker.value = false;
						});

						scope.activeFilters[filter.tag] = filter.name;
					} else {
						delete scope.activeFilters[filter.tag];
					}

					filter.value = !filter.value;
				};

				// if the filterGroup is not active, turn off any other filters that
				// may be on and then make the filterGroup active.
				// then, regardless, toggle yourself.
				scope.toggleFilterGroup = function(group) {
					if (group.active === false) {
						_.forEach(scope.filterTracker, function(filterGroup) {
							filterGroup.active = false;
						});
					}

					group.active = !group.active;
				};

				function updateFilters() {
					scope.filterTracker.os = filterUnique('os');
					scope.filterTracker.team = filterUnique('team');
					scope.filterTracker.version = filterUnique('version');
				};

				// update filters when servers are refreshed so we are sure
				// we have all the current filters.
				// In hindsight this is probably overkill for our purposes
				updateFilters();
				scope.$on('serversRefreshed', updateFilters);
			}
		}
	}]);
})(angular);

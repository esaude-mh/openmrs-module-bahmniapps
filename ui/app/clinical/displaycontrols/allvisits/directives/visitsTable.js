'use strict';

angular.module('bahmni.clinical')
    .directive('visitsTable', function () {
        var controller = function ($scope) {
            
            $scope.patientUuid = $scope.params.patientUuid;
            
            var defaultParams = {
                maximumNoOfVisits: $scope.visits ? $scope.visits.length : 0
            };
            $scope.params = angular.extend(defaultParams, $scope.params);
            
            $scope.hasVisits = function () {
                return $scope.visits && $scope.visits.length > 0;
            };

            $scope.isVisitActive = function (visit) {
                return visit.stopDatetime === null;
            }

            $scope.noVisitsMessage = "No Visits for this patient.";

        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                visits: "=",
                params: "="
            },
            templateUrl: "displaycontrols/allvisits/views/visitsTable.html"
        };
    });
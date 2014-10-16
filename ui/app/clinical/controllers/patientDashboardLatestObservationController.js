angular.module('bahmni.clinical')
    .controller('PatientDashboardLatestObservationController', ['$scope', '$stateParams', 'observationsService', '$q', 'spinner', '$rootScope', function ($scope, $stateParams, observationsService, $q, spinner, $rootScope) {

        var init = function () {
            $scope.visits = $rootScope.visits;
            $scope.activeVisit = $rootScope.activeVisit;
            createObservationSectionView();
        };

        var createObservationSectionView = function () {
            spinner.forPromise(observationsService.fetch($scope.patientUuid, $scope.section.conceptNames, "latest").then(function (observations) {
                var dashboardObservations = _.map(observations.data, function (bahmniObservation) {
                    return new Bahmni.Clinical.DashboardObservation(bahmniObservation);
                });
                $scope.observations = _.sortBy(dashboardObservations, 'sortWeight');
            }));
        };

        init();

    }]);
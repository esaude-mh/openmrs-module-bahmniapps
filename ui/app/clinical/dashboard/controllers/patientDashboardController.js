'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardController', ['$scope', 'clinicalAppConfigService', 'diseaseTemplateService', 'clinicalDashboardConfig', 'printer', '$state', 'spinner', 'visitSummary',
        function ($scope, clinicalAppConfigService, diseaseTemplateService, clinicalDashboardConfig, printer, $state, spinner, visitSummary) {

            $scope.activeVisit = $scope.visitHistory.activeVisit;
            $scope.activeVisitData = {};
            $scope.obsIgnoreList = clinicalAppConfigService.getObsIgnoreList();
            $scope.clinicalDashboardConfig = clinicalDashboardConfig;
            $scope.visitSummary = visitSummary;

            $scope.$on("event:switchDashboard", function (event, dashboard) {
                $scope.init(dashboard);
            });

            $scope.$on("event:printDashboard", function (event) {
                printer.printFromScope("dashboard/views/dashboardPrint.html", $scope);
            });

            $scope.init = function (dashboard) {
                clinicalDashboardConfig.switchTab(dashboard);
                return diseaseTemplateService.getLatestDiseaseTemplates($scope.patient.uuid, clinicalDashboardConfig.getDiseaseTemplateSections())
                    .then(function (diseaseTemplates) {
                        $scope.diseaseTemplates = diseaseTemplates;
                        $scope.currentDashboardTemplateUrl = $state.current.views.content.templateUrl;
                    });
            };

            spinner.forPromise($scope.init(clinicalDashboardConfig.currentTab));
        }]);

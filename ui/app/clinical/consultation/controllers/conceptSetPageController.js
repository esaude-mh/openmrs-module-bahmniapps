angular.module('bahmni.clinical')
    .controller('ConceptSetPageController', ['$scope', '$rootScope', '$stateParams', 'conceptSetService', 'clinicalAppConfigService', 'messagingService', 'configurations',
        function ($scope, $rootScope, $stateParams, conceptSetService, clinicalAppConfigService, messagingService, configurations) {
            $scope.consultation.selectedObsTemplate = $scope.consultation.selectedObsTemplate || [];
    $scope.scrollingEnabled = false;
    var extensions = clinicalAppConfigService.getAllConceptSetExtensions($stateParams.conceptSetGroupName);
    var configs = clinicalAppConfigService.getAllConceptsConfig();
	var visitType = configurations.encounterConfig().getVisitTypeByUuid($scope.consultation.visitTypeUuid);
            $scope.context = {visitType: visitType, patient: $scope.patient};
	var numberOfLevels = 2;
    var fields = ['uuid','name', 'names'];
    var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);

    if($scope.consultation.selectedObsTemplate.length == 0){
        conceptSetService.getConceptSetMembers({name:"All Observation Templates",v:"custom:"+customRepresentation}).success(function(response){
            var allTemplates = response.results[0].setMembers;
            var allConceptSections  = allTemplates.map(function(template){
                var conceptSetExtension = _.find(extensions,function(extension){
                    return extension.extensionParams.conceptName === template.name.name;
                }) || {};
                var conceptSetConfig = configs[template.name.name] || {};
                return new Bahmni.ConceptSet.ConceptSetSection(conceptSetExtension, $rootScope.currentUser, conceptSetConfig, $scope.consultation.observations, template);
            });
            $scope.consultation.selectedObsTemplate= allConceptSections.filter(function(conceptSet){
                if(conceptSet.isAvailable($scope.context)){
                    return true;
                }
            });
        });
    }

    $scope.toggleTemplate = function(template){
        $scope.scrollingEnabled = true;

        if(!template.canToggle()){
	        messagingService.showMessage("error","Templates having data cannot be unselected. Please Clear the data and try again");
        } else {
            template.toggle();
            if(template.isAdded){
                messagingService.showMessage("info",template.conceptName+" Added successfully");
            } else if(!template.isAdded){
                messagingService.showMessage("info",template.conceptName+" Removed successfully");
            }
        }
    };

    $scope.getNormalized = function (conceptName) {
        return conceptName.replace(/['\.\s\(\)\/,\\]+/g, "_");
    };

}]);
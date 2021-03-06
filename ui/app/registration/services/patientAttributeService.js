'use strict';

angular.module('bahmni.registration')
    .factory('patientAttributeService', ['$http', function ($http) {

    var urlMap;

    var init = function(){
        urlMap = {
            "personName" : "/ws/rest/v1/bahmnicore/unique/personname",
            "personAttribute" : "/ws/rest/v1/bahmnicore/unique/personattribute"
        }
    };
    init();

    var search = function(fieldName, query, type){
        var url = Bahmni.Registration.Constants.openmrsUrl + urlMap[type];
        var queryWithoutTrailingSpaces = query.trimLeft();

        return $http.get(url, {
            method: "GET",
            params: {q: queryWithoutTrailingSpaces, key: fieldName },
            withCredentials: true
        });
    };

    return{
        search : search
    };
}]);

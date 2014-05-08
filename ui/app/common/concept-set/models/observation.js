Bahmni.ConceptSet.Observation = function (observation, savedObs, conceptUIConfig) {
    angular.extend(this, observation);
    this.isObservation = true;
    this.conceptUIConfig = conceptUIConfig;

    if (savedObs) {
        this.uuid = savedObs.uuid;
        this.value = savedObs.value;
        this.observationDateTime = savedObs.observationDateTime;
        this.provider = savedObs.provider;
    }
};

Bahmni.ConceptSet.Observation.prototype = {
    
    displayValue: function () {
        if (this.possibleAnswers.length > 0) {
            for (var i = 0; i < this.possibleAnswers.length; i++) {
                if (this.possibleAnswers[i].uuid === this.value) {
                    return this.possibleAnswers[i].display;
                }
            }
        }
        else {
            return this.value;
        }
    },

    isGroup: function () {
        if (this.groupMembers)
            return this.groupMembers.length > 0;
        return false;
    },

    isNumeric: function () {
        return this.getDataTypeName() === "Numeric";
    },

    isText: function () {
        return this.getDataTypeName() === "Text";
    },

    isCoded: function () {
        return this.getDataTypeName() === "Coded";
    },

    getDataTypeName: function () {
        return this.concept.dataType;
    },
    
    isDateDataType: function () {
        return 'Date'.indexOf(this.getDataTypeName()) != -1;
    },

    getHighAbsolute: function () {
        return this.concept.hiAbsolute;
    },

    getLowAbsolute: function () {
        return this.concept.lowAbsolute;
    },

    getConceptUIConfig: function () {
        return this.conceptUIConfig[this.concept.name] || [];
    },

    isHtml5InputDataType: function () {
        return ['Date', 'Numeric'].indexOf(this.getDataTypeName()) != -1;
    },

    getControlType: function () {
        if (this.getConceptUIConfig().freeTextAutocomplete) return "freeTextAutocomplete";
        if (this.isHtml5InputDataType()) return "html5InputDataType";
        if (this.isText()) return "text";
        if (this.isCoded()) return this._getCodedControlType();
        return "unknown";
    },

    _getCodedControlType: function () {
        var conceptUIConfig = this.getConceptUIConfig();
        if (conceptUIConfig.multiselect) return "multiselect";
        if (conceptUIConfig.autocomplete) return "autocomplete";
        return "dropdown";
    },

    onValueChanged: function () {
        this.observationDateTime = new Date();
    },

    getInputType: function () {
        return this.getDataTypeName();
    },

    atLeastOneValueSet: function () {
        if (this.isGroup()) {
            return this.groupMembers.some(function (childNode) {
                return childNode.atLeastOneValueSet();
            })
        } else {
            return this.hasValue();
        }
    },

    hasValue: function () {
        var value = this.value;
        if (value === '' || value === null || value === undefined) return false;
        if (value instanceof Array) return value.length > 0;
        return true;
    },

    isValidDate: function () {
        if (!this.hasValue()) return true;
        var date = new Date(this.value);
        return date.getUTCFullYear() && date.getUTCFullYear().toString().length <= 4;
    },

    isValid: function (checkRequiredFields) {
        if (this.isGroup()) return this._hasValidChildren(checkRequiredFields);
        if (checkRequiredFields && this.isRequired() && !this.hasValue()) return false;
        if (this._isDateDataType()) return this.isValidDate();
        if (this.hasValue()) return false;
        return true;
    },

    _isDateDataType: function () {
        return 'Date'.indexOf(this.getDataTypeName()) != -1;
    },

    isRequired: function () {
        return this.getConceptUIConfig().required || false;
    },

    _hasValidChildren: function (checkRequiredFields) {
        return this.groupMembers.every(function (member) {
            return member.isValid(checkRequiredFields)
        });
    }

};
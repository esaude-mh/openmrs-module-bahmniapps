'use strict';

describe('patientMapper', function () {

    var mapper, openmrsPatient, ageModule, patientConfiguration, date = new Date();

    beforeEach(function () {
        module('bahmni.registration');
        
        patientConfiguration = new Bahmni.Registration.PatientConfig([
            {"uuid": "d3d93ab0-e796-11e2-852f-0800271c1b75", "sortWeight": 2.0, "name": "caste", "description": "Caste", "format": "java.lang.String", "answers": []},
            {"uuid": "d3e6dc74-e796-11e2-852f-0800271c1b75", "sortWeight": 2.0, "name": "class", "description": "Class", "format": "org.openmrs.Concept",
                "answers": [
                    {"description": "OBC", "uuid": "4da8141e-65d6-452e-9cfe-ce813bd11d52"}
                ]}
        ]);

        inject(['openmrsPatientMapper', '$rootScope', 'age', function (openmrsPatientMapper, $rootScope, age) {
            mapper = openmrsPatientMapper;
            $rootScope.patientConfiguration = patientConfiguration;
            ageModule = age;
        }]);

        openmrsPatient = {
            "uuid": "1a202b45-ffa3-42a1-9177-c718e6119cfd",
            "auditInfo": {
                dateCreated: moment(date).format()
            },
            "identifiers": [
                {
                    "identifier": "GAN200003"
                }
            ],
            "person": {
                "gender": "F",
                "age": 0,
                "birthdate": moment(date).format(),
                "birthdateEstimated": false,
                "preferredName": {
                    "uuid": "72573d85-7793-49c1-8c29-7647c0a6a425",
                    "givenName": "first",
                    "middleName": "middle",
                    "familyName": "family"
                },

                "preferredAddress": {
                    "display": "house1243",
                    "uuid": "7746b284-82d5-4251-a7ec-6685b0ced206",
                    "preferred": true,
                    "address1": "house1243",
                    "address2": null,
                    "cityVillage": "village22",
                    "stateProvince": "state",
                    "countyDistrict": "dist",
                    "address3": "tehsilkk"
                },
                "attributes": [
                    {
                        "uuid": "2a71ee67-3446-4f66-8267-82446bda21a7",
                        "value": "some-class",
                        "attributeType": {
                            "uuid": "d3d93ab0-e796-11e2-852f-0800271c1b75"
                        }
                    } ,
                    {
                        "uuid": "3da8141e-65d6-452e-9cfe-ce813bd11d52",
                        "value":  {
                            uuid : "4da8141e-65d6-452e-9cfe-ce813bd11d52"
                        },
                        "attributeType": {
                            "uuid": "d3e6dc74-e796-11e2-852f-0800271c1b75"
                        }
                    }
                ],
                "auditInfo": {
                    dateCreated: moment(date).format()
                }
            }
        }
    });


    it('should map values from the openmrs Patient to our patient object', function () {
        var age = {years: 2, months: 3, days: 25};
        spyOn(ageModule, 'fromBirthDate').and.returnValue(age);

        var patient = mapper.map(openmrsPatient);

        expect(patient.givenName).toBe(openmrsPatient.person.preferredName.givenName);
        expect(patient.familyName).toBe(openmrsPatient.person.preferredName.familyName);
        expect(patient.gender).toBe(openmrsPatient.person.gender);
        expect(patient.age).toBe(age);
        expect(patient.identifier).toBe(openmrsPatient.identifiers[0].identifier);
        expect(patient.address.address1).toBe(openmrsPatient.person.preferredAddress.address1);
        expect(patient.address.address2).toBe(openmrsPatient.person.preferredAddress.address2);
        expect(patient.address.address3).toBe(openmrsPatient.person.preferredAddress.address3);
        expect(patient.address.cityVillage).toBe(openmrsPatient.person.preferredAddress.cityVillage);
        expect(patient.address.countyDistrict).toBe(openmrsPatient.person.preferredAddress.countyDistrict);
        expect(patient.address.stateProvince).toBe(openmrsPatient.person.preferredAddress.stateProvince);
        var urlParts = patient.image.split('?');
        expect(urlParts.length).toBe(2);
        expect(urlParts[0]).toBe("/patient_images/" + openmrsPatient.uuid + ".jpeg");
    });

    it('should map attributes from openmrsPatient to our patient object', function () {
        var patient = mapper.map(openmrsPatient);
        expect(patient.class).toBe("4da8141e-65d6-452e-9cfe-ce813bd11d52");
    });

    it('should map birth date in dd-mm-yyyy format', function () {
        var date1 = new Date();
        date1.setHours(0,0,0,0);
        openmrsPatient.person.birthdate = moment(date1).format();
        var patient = mapper.map(openmrsPatient);
        expect(patient.birthdate).toBe(moment(date1).format("DD-MM-YYYY"));
    });

    it("should not fail when birthdate is null", function () {
        openmrsPatient.person.birthdate = null;
        var patient = mapper.map(openmrsPatient);
        expect(patient.birthdate).toBe("");
    });

    it('should map registration date', function () {
        var date1 = new Date();
        openmrsPatient.person.personDateCreated = moment(date1).format();
        var patient = mapper.map(openmrsPatient);
        expect(patient.registrationDate).toEqual(new Date(moment(date).format()));
    });

    it("should populate birthdate and age if birthdate is not estimated", function () {
        var dob = date;
        dob.setFullYear(dob.getFullYear()-2);
        dob.setMonth(dob.getMonth()-3);
        dob.setDate(dob.getDate()-25);
        openmrsPatient.person.birthdate = moment(dob).format();
        openmrsPatient.person.birthdateEstimated = false;
        var age = {years: 2, months: 3, days: 25};
        spyOn(ageModule, 'fromBirthDate').and.returnValue(age);

        var patient = mapper.map(openmrsPatient);

        expect(patient.birthdate).toBe(moment(dob).format("DD-MM-YYYY"));
        expect(patient.age).toBe(age);
    });

    it("should populate age and empty birthdate if birthdate is estimated", function () {
        var dob = date;
        dob.setFullYear(dob.getFullYear()-2);
        dob.setMonth(dob.getMonth()-3);
        dob.setDate(dob.getDate()-25);
        openmrsPatient.person.birthdate = moment(dob).format();
        openmrsPatient.person.birthdateEstimated = true;
        var age = {years: 2, months: 3, days: 25};
        spyOn(ageModule, 'fromBirthDate').and.returnValue(age);

        var patient = mapper.map(openmrsPatient);

        expect(patient.birthdate).toBeFalsy();
        expect(patient.age).toBe(age);
    });

    it("should not fail if preferred address is null", function () {
        openmrsPatient.person.preferredAddress = null;
        mapper.map(openmrsPatient);
    });

    it("should not fail if an attribute does not exist", function () {
        openmrsPatient.person.attributes.push({
            "uuid": "2a71ee67-3446-4f66-8267-82446bda21a8",
            "value": "someRandomValue",
            "attributeType": {
                "uuid": "nonExistingUuid"
            }
        });
        mapper.map(openmrsPatient);
    });
});

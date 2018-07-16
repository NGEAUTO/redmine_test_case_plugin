/** @namespace window.ru.belyiz.services.SpecificationService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(SpecificationService);

    /**
     * @constructor
     */
    function SpecificationService() {
        this.type = 'specification';
    }

	/**
	* Retrieving an Entity from the database using the DatabaseService
	*/
    SpecificationService.prototype.getEntity = function (id, callback, errorCallback) {
		/**
		* Checking if the Entity wanted is a Requirement or the Specification
		*/
		if (id == 'specification_2_spec')	services.DatabaseService.getSpecification(callback,errorCallback);
		else services.DatabaseService.getRequirement(id, callback, errorCallback);
    };

	/**
	* storing an Entity in the database using the DatabaseService
	*/
    SpecificationService.prototype.saveEntity = function (data, callback, errorCallback) {
        services.DatabaseService.saveSpecification(data, callback, errorCallback);
    };

    SpecificationService.prototype.removeEntity = function (data, callback, errorCallback) {
        services.DatabaseService.removeRequirement(this.type, data, (doc) => {
			data.id=doc.id;
			data.rev = doc.rev;
            const msg = (data.requirements && data.requirements.name) ? `Requirement «${data.requirements.name}» Deleted.` : 'Requirement deleted.';
            services.UndoService.show(msg, doc.id, data.rev);
            typeof (callback) === 'function' && callback();
        }, errorCallback);
    };

    SpecificationService.prototype.all = function (ids, callback, errorCallback) {
        services.DatabaseService.allDocs(this.type, callback, errorCallback);
    };

    SpecificationService.prototype.some = function (ids, callback, errorCallback) {
        services.DatabaseService.someDocs(this.type, ids, callback, errorCallback);
    };
	
	/**
	* Removing a requirement from the Specification document
	*/
	SpecificationService.prototype.removeRequirement = function (specificationId, requirement, callback, errorCallback) {
        services.DatabaseService.getEntity(this.type, specificationId, (specification) => {
            specification.requirements = utils.ArraysUtils.removeAllMatches(specification.requirements, requirement);
            this.saveEntity(specification, callback, errorCallback);
        });
    };

	utils.Package.declare('ru.belyiz.services.SpecificationService', new SpecificationService().initialize());
})(window, window.ru.belyiz.patterns.AbstractEntityService, window.ru.belyiz.services, window.ru.belyiz.utils);
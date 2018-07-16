/** @namespace window.ru.belyiz.services.TestPlanService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(TestPlanService);

    /**
     * @constructor
     */
    function TestPlanService() {
        this.type = 'plan';
    }

	/**
	* Retrieving an Entity from the database using the DatabaseService
	*/
    TestPlanService.prototype.getEntity = function (id, callback, errorCallback) {
		services.DatabaseService.getTestPlan(id, callback, errorCallback);
    };

	/**
	* Storing an Entity in the database using the DatabaseService
	*/
    TestPlanService.prototype.saveEntity = function (data, callback, errorCallback) {
        services.DatabaseService.saveTestPlan(data, callback, errorCallback);
    };
	
    TestPlanService.prototype.removeEntity = function (data, callback, errorCallback) {
			services.DatabaseService.removeTestPlan(this.type, data, () => {
				const msg = (data.headerValues && data.headerValues.name) ? `Application Matrix «${data.headerValues.name}» Deleted.` : 'Group deleted.';
				services.UndoService.show(msg, services.DatabaseService.buildRelId(this.type, data.id), data.rev);
				typeof (callback) === 'function' && callback();
			}, errorCallback);
    };

    TestPlanService.prototype.all = function (callback, errorCallback) {
        services.DatabaseService.getAllTestPlans(callback, errorCallback);
    };

    TestPlanService.prototype.some = function (ids, callback, errorCallback) {
        services.DatabaseService.someDocs(this.type, ids, callback, errorCallback);
    };
	
	utils.Package.declare('ru.belyiz.services.TestPlanService', new TestPlanService().initialize());
})(window, window.ru.belyiz.patterns.AbstractEntityService, window.ru.belyiz.services, window.ru.belyiz.utils);
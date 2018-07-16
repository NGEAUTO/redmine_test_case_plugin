/** @namespace window.ru.belyiz.services.SumupService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(SumupService);

    /**
     * @constructor
     */
    function SumupService() {
		this.mainDocsType = 'testCasesExe',
        this.type = 'sumup';
		this.projectName = 'project_x',
		this.appMatrixDocId = 'appMatrix_'+this.projectName;
    }

	/**
	* Retrieving an Entity from the database using the DatabaseService
	*/
    SumupService.prototype.getEntity = function (id, callback, errorCallback) {
		services.TestCasesExeService.getEntity(id , callback, errorCallback);
    };

	/**
	* Storing an Entity in the database using the DatabaseService
	*/
    SumupService.prototype.saveEntity = function (data, callback, errorCallback) {
        services.DatabaseService.saveAppMatrix(this.appMatrixDocId, data, callback, errorCallback);
    };
	
    SumupService.prototype.removeEntity = function (data, callback, errorCallback) {
			services.DatabaseService.removeEntity(this.type, data, () => {
				const msg = (data.headerValues && data.headerValues.name) ? `Application Matrix «${data.headerValues.name}» Deleted.` : 'Group deleted.';
				services.UndoService.show(msg, services.DatabaseService.buildRelId(this.type, data.id), data.rev);
				typeof (callback) === 'function' && callback();
			}, errorCallback);
    };

    SumupService.prototype.all = function (callback, errorCallback) {
        services.TestCasesExeService.all('', callback, errorCallback);
    };

    SumupService.prototype.some = function (ids, callback, errorCallback) {
        services.DatabaseService.someDocs(this.type, ids, callback, errorCallback);
    };
	
	utils.Package.declare('ru.belyiz.services.SumupService', new SumupService().initialize());
})(window, window.ru.belyiz.patterns.AbstractEntityService, window.ru.belyiz.services, window.ru.belyiz.utils);
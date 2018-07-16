/** @namespace window.ru.belyiz.services.AppMatrixService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(AppMatrixService);

    /**
     * @constructor
     */
    function AppMatrixService() {
        this.type = 'appMatrix';
		this.projectName = 'project_x',
		this.appMatrixDocId = 'appMatrix_'+this.projectName;
    }

	/**
	* Retrieving an Entity from the database using the DatabaseService
	*/
    AppMatrixService.prototype.getEntity = function (callback, errorCallback) {
		services.DatabaseService.getAppMatrix(this.appMatrixDocId , callback, errorCallback);
    };

	/**
	* Storing an Entity in the database using the DatabaseService
	*/
    AppMatrixService.prototype.saveEntity = function (data, callback, errorCallback) {
        services.DatabaseService.saveAppMatrix(this.appMatrixDocId, data, callback, errorCallback);
    };
	
    AppMatrixService.prototype.removeEntity = function (data, callback, errorCallback) {
			services.DatabaseService.removeEntity(this.type, data, () => {
				const msg = (data.headerValues && data.headerValues.name) ? `Application Matrix «${data.headerValues.name}» Deleted.` : 'Group deleted.';
				services.UndoService.show(msg, services.DatabaseService.buildRelId(this.type, data.id), data.rev);
				typeof (callback) === 'function' && callback();
			}, errorCallback);
    };

    AppMatrixService.prototype.all = function (ids, callback, errorCallback) {
        this.getEntity(callback, errorCallback);
    };

    AppMatrixService.prototype.some = function (ids, callback, errorCallback) {
        services.DatabaseService.someDocs(this.type, ids, callback, errorCallback);
    };
	
	utils.Package.declare('ru.belyiz.services.AppMatrixService', new AppMatrixService().initialize());
})(window, window.ru.belyiz.patterns.AbstractEntityService, window.ru.belyiz.services, window.ru.belyiz.utils);
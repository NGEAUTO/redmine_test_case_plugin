/** @namespace window.ru.belyiz.services.TestSetupService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(TestSetupService);

    /**
     * @constructor
     */
    function TestSetupService() {
        this.type = 'testSetup';
    }

    TestSetupService.prototype.getEntity = function (id, callback, errorCallback) {
		services.DatabaseService.getEntity(this.type, id, callback, errorCallback);
	};
	
	TestSetupService.prototype.getAttachment = function (id, attachmentId, callback, errorCallback) {
		return services.DatabaseService.getAttachment(attachmentId, callback, errorCallback);
	};

    TestSetupService.prototype.saveEntity = function (data, callback, errorCallback) {
        services.DatabaseService.saveTestSetup(this.type, data, callback, errorCallback);
    };

    TestSetupService.prototype.removeEntity = function (data, callback, errorCallback) {
        services.DatabaseService.removeEntity(this.type, data, () => {
            const msg = (data.headerValues && data.headerValues.name) ? `Test Setup «${data.header.rows.name}» Deleted.` : 'Test Setup deleted.';
            services.UndoService.show(msg, services.DatabaseService.buildRelId(this.type, data.id), data.rev);
            typeof (callback) === 'function' && callback();
        }, errorCallback);
    };

    TestSetupService.prototype.all = function (ids, callback, errorCallback) {
        services.DatabaseService.allDocs(this.type, callback, errorCallback);
    };

    TestSetupService.prototype.some = function (ids, callback, errorCallback) {
        services.DatabaseService.someDocs(this.type, ids, callback, errorCallback);
    };

    utils.Package.declare('ru.belyiz.services.TestSetupService', new TestSetupService().initialize());
})(window, window.ru.belyiz.patterns.AbstractEntityService, window.ru.belyiz.services, window.ru.belyiz.utils);
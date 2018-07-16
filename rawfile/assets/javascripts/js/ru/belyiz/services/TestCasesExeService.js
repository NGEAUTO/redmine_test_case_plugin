/** @namespace window.ru.belyiz.services.TestCasesExeService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(TestCasesExeService);

    /**
     * @constructor
     */
    function TestCasesExeService() {
        this.type = 'testCasesExe';
    }

    TestCasesExeService.prototype.getEntity = function (id, callback, errorCallback) {
        services.DatabaseService.getEntity(this.type, id, callback, errorCallback);
    };

    TestCasesExeService.prototype.saveEntity = function (data, callback, errorCallback) {
        services.DatabaseService.saveEntity(this.type, data, callback, errorCallback);
    };

    TestCasesExeService.prototype.removeEntity = function (data, callback, errorCallback) {
        services.DatabaseService.removeEntity(this.type, data, () => {
            const msg = (data.headerValues && data.headerValues.name) ? `Test case «${data.headerValues.name}» Deleted.` : 'The test case has been deleted.';
            services.UndoService.show(msg, services.DatabaseService.buildRelId(this.type, data.id), data.rev);
            typeof (callback) === 'function' && callback();
        }, errorCallback);
    };

    TestCasesExeService.prototype.all = function (ids, callback, errorCallback) {
        services.DatabaseService.allDocs(this.type, callback, errorCallback);
    };

    TestCasesExeService.prototype.some = function (ids, callback, errorCallback) {
        services.DatabaseService.someDocs(this.type, ids, callback, errorCallback);
    };

    TestCasesExeService.prototype.findGroups = function (testCaseId, callback, errorCallback) {
        services.DatabaseService.find(
            {
                selector: {
                    'data.testCases': {
                        '$elemMatch': {'$eq': testCaseId}
                    }
                }
            },
            result => {
                let ids = $.map(result.docs, doc => {
                    return services.DatabaseService.parseId(doc._id);
                });
                (ids.length && services.GroupsService.some(ids, callback, errorCallback)) || callback([]);
            },
            errorCallback
        );
    };

    utils.Package.declare('ru.belyiz.services.TestCasesExeService', new TestCasesExeService().initialize());
})(window, window.ru.belyiz.patterns.AbstractEntityService, window.ru.belyiz.services, window.ru.belyiz.utils);
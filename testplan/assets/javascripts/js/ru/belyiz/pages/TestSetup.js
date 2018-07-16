/** @namespace window.ru.belyiz.pages.TestSetup */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.TestSetup', TestSetup);
    Pattern.extend(TestSetup);


    /**
     * @constructor
     */
    function TestSetup() {
        this.pageSettings = {
            pageCode: 'TestSetup',
            createBtnText: 'Create TestSetup',
            saveBtnText: 'Save changes',
            removeBtnText: 'Delete TestSetup',
            entityInfoWidget: widgets.TestSetupInfo,
            entitiesListWidget: widgets.ItemsList,
            entitiesListWidgetSetup: {emptyListMsg: 'No saved Setups'},
            entitiesListPrepareDataFunction: this._prepareTestSetupForList,
            entityService: services.TestSetupService,
            downloadFileName: 'TestSetup',
            activeEntityId: '',
			imagesDocId : "images_2_img",
			representedParams : ['Name','Description'],
        };
    }

    TestSetup.prototype._createWidgets = function () {
        Pattern.clazz.prototype._createWidgets.call(this);
    };

    TestSetup.prototype._bindEvents = function () {
        Pattern.clazz.prototype._bindEvents.call(this);
        global.nodes.body.on('click', '[data-page-code="TestSetup"] .js-download-file', this._events.onDownloadButtonClick.bind(this));
    };

    TestSetup.prototype._bindWidgetsEvents = function () {
        Pattern.clazz.prototype._bindWidgetsEvents.call(this);
        this.entityInfoWidget.on('changed', this._events.onTestSetupDataChanged, this);
    };

    TestSetup.prototype._unbindWidgetsEvents = function () {
        Pattern.clazz.prototype._unbindWidgetsEvents.call(this);
        this.entityInfoWidget.off('changed', this._events.onTestSetupDataChanged, this);
    };

    TestSetup.prototype._events = $.extend({
 
       onTestSetupDataChanged: function () {
            this.entitiesListWidget.reDraw(this.entityInfoWidget.getData());
        },

        onDownloadButtonClick: function (e) {
            const $target = $(e.currentTarget);
            utils.TableToFileConverter.convert(this.$resultTable, this.pageSettings.downloadFileName, $target.data('fileType'));
        },

    }, Pattern.clazz.prototype._events);

    TestSetup.prototype._prepareTestSetupForList = function (docs) {
        let setups = [];
        for (let doc of docs) {
            let setup = {id: doc.id, rev: doc.rev};
            for (let rowParams of doc.settings.testSetup.header.rows)
                setup[rowParams.name] = doc[rowParams.code];
            setups.push(setup);
        }
        return setups;
    };

})(window, window.ru.belyiz.patterns.AbstractEntityInfoPage, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);
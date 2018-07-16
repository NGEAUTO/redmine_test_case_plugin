/** @namespace window.ru.belyiz.pages.TestCaseExe */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.TestCaseExe', TestCaseExe);
    Pattern.extend(TestCaseExe);

    /**
     * @constructor
     */
    function TestCaseExe() {
        this.pageSettings = {
            pageCode: 'TestCaseExe',
            createBtnText: 'Create new Test Case',
            saveBtnText: 'Save Changes',
            removeBtnText: 'Remove Test Case',
            entityInfoWidget: widgets.TestCaseExeInfo,
            entitiesListWidget: widgets.ItemsList,
            entitiesListWidgetSetup: {emptyListMsg: 'No Saved Test Cases'},
            entitiesListPrepareDataFunction: this._prepareTestCasesForList,
            entityService: services.TestCasesExeService,
            downloadFileName: 'testCase',
			relatedDocsType: ['testCases','appMatrix'],
            activeEntityId: '',
			representedParams : ['Name','Requirement'],
			chosenTestCaseId : '',
        };
    }

    TestCaseExe.prototype._createWidgets = function () {
        Pattern.clazz.prototype._createWidgets.call(this);
        this.testCaseResultTableWidget = new widgets.TestCaseResultTable({container: this.$resultTable}).initialize();
    };

    TestCaseExe.prototype._bindEvents = function () {
        Pattern.clazz.prototype._bindEvents.call(this);
        global.nodes.body.on('keyup', '[data-page-code="TestCaseExe"] textarea', this._events.onTextAreaKeyup.bind(this));
        global.nodes.body.on('click', '[data-page-code="TestCaseExe"] .js-download-file', this._events.onDownloadButtonClick.bind(this));
    };

    TestCaseExe.prototype._bindWidgetsEvents = function () {
        Pattern.clazz.prototype._bindWidgetsEvents.call(this);
        this.entityInfoWidget.on('changed', this._events.onTestCaseDataChanged, this);
    };

    TestCaseExe.prototype._unbindWidgetsEvents = function () {
        Pattern.clazz.prototype._unbindWidgetsEvents.call(this);
        this.entityInfoWidget.off('changed', this._events.onTestCaseDataChanged, this);
    };

    TestCaseExe.prototype._events = $.extend({
        onTestCaseDataChanged: function () {
            //this.testCaseResultTableWidget.reDraw([this.entityInfoWidget.getData()]);
        },

        onDownloadButtonClick: function (e) {
            const $target = $(e.currentTarget);
            utils.TableToFileConverter.convert(this.$resultTable, this.pageSettings.downloadFileName, $target.data('fileType'));
        },

        onTextAreaKeyup: function (e) {
            utils.InputsUtils.resizeTextArea(e.currentTarget);
        },

    }, Pattern.clazz.prototype._events);

    TestCaseExe.prototype._prepareTestCasesForList = function (docs) {
        let testCases = [];
        for (let doc of docs) {
            let testCase = {id: doc.id, rev: doc.rev};
            for (let rowParams of doc.settings.tests.header.rows) {
                testCase[rowParams.name] = doc.headerValues[rowParams.code];
            }
            testCases.push(testCase);
        }
        return testCases;
    };

})(window, window.ru.belyiz.patterns.AbstractEntityInfoPage, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);
/** @namespace window.ru.belyiz.pages.TestPlan */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.TestPlan', TestPlan);
    Pattern.extend(TestPlan);


    /**
     * @constructor
     */
    function TestPlan() {
        this.pageSettings = {
            pageCode: 'TestPlan',
            saveBtnText: 'Save changes',
            removeBtnText: 'Delete Test Plan',
            entityInfoWidget: widgets.TestPlanInfo,
            entitiesListWidget: widgets.ItemsList,
            entitiesListWidgetSetup: {emptyListMsg: 'No applicable Requirements chosen'},
            entitiesListPrepareDataFunction: this._prepareTestPlanForList,
            entityService: services.TestPlanService,
            downloadFileName: 'TestPlan',
            activeEntityId: '',
			mainDocId : services.TestPlanService.TestPlanDocId,
			representedParams : ['Name','Description']
        };
    }

    TestPlan.prototype._createWidgets = function () {
        Pattern.clazz.prototype._createWidgets.call(this);
		
		
    };

    TestPlan.prototype._bindEvents = function () {
        Pattern.clazz.prototype._bindEvents.call(this);
        global.nodes.body.on('click', '[data-page-code="TestPlan"] .js-download-file', this._events.onDownloadButtonClick.bind(this));
    };

    TestPlan.prototype._bindWidgetsEvents = function () {
        Pattern.clazz.prototype._bindWidgetsEvents.call(this);
        this.entityInfoWidget.on('changed', this._events.onTestPlanDataChanged, this);
    };

    TestPlan.prototype._unbindWidgetsEvents = function () {
        Pattern.clazz.prototype._unbindWidgetsEvents.call(this);
        this.entityInfoWidget.off('changed', this._events.onTestPlanDataChanged, this);
    };

    TestPlan.prototype._events = $.extend({
		
        onTestPlanDataChanged: function () {
                services.TestPlanService.getEntity(data => {
                   this.entitiesListWidget.reDraw(data.requirements, this.pageSettings.mainDocId, this.pageSettings.representedParams);
				});
        },

        onDownloadButtonClick: function (e) {
            const $target = $(e.currentTarget);
            utils.TableToFileConverter.convert(this.$resultTable, this.pageSettings.downloadFileName, $target.data('fileType'));
        },

    }, Pattern.clazz.prototype._events);

	/**
	*	Creating the structure necessary to receive the requirements
	*/
	TestPlan.prototype._prepareTestPlanForList = function (doc) {
        let requirementsGroup = [];
		let requirement ={requirement: '', note: '', applicable: ''};
		if (doc.requirements != null){
			for(var i=0;i<doc.requirements.length;i++){	
				requirement = doc.requirements[i];
				requirementsGroup.push(requirement);
			}
		}
        return requirementsGroup;
    };

})(window, window.ru.belyiz.patterns.AbstractEntityInfoPage, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);
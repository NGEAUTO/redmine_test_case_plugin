/** @namespace window.ru.belyiz.pages.Sumup */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.Sumup', Sumup);
    Pattern.extend(Sumup);


    /**
     * @constructor
     */
    function Sumup() {
        this.pageSettings = {
            pageCode: 'Sumup',
            saveBtnText: 'Save changes',
            removeBtnText: 'Delete Application Matrix',
            entityInfoWidget: widgets.SumupInfo,
            entitiesListWidget: widgets.ItemsList,
            entitiesListWidgetSetup: {emptyListMsg: 'No applicable Requirements chosen'},
            entitiesListPrepareDataFunction: this._prepareSumupForList,
            entityService: services.SumupService,
            downloadFileName: 'Sumup',
            activeEntityId: '',
			mainDocsType : services.SumupService.mainDocsType,
			representedParams : ['requirement','description','name','result'],
			chosenTestCaseId : '',
        };
    }

    Sumup.prototype._createWidgets = function () {
        Pattern.clazz.prototype._createWidgets.call(this);
		
		
    };

    Sumup.prototype._bindEvents = function () {
        Pattern.clazz.prototype._bindEvents.call(this);
        global.nodes.body.on('click', '[data-page-code="Sumup"] .js-download-file', this._events.onDownloadButtonClick.bind(this));
		global.nodes.body.on('click', '[data-page-code="Sumup"] #details-button', this._events.onDetailsClick.bind(this));
    };

    Sumup.prototype._bindWidgetsEvents = function () {
        Pattern.clazz.prototype._bindWidgetsEvents.call(this);
        this.entityInfoWidget.on('changed', this._events.onSumupDataChanged, this);
    };

    Sumup.prototype._unbindWidgetsEvents = function () {
        Pattern.clazz.prototype._unbindWidgetsEvents.call(this);
        this.entityInfoWidget.off('changed', this._events.onSumupDataChanged, this);
    };

    Sumup.prototype._events = $.extend({
		
		onDetailsClick: function (e) {
			/**
			*	Action to take when clicking on "See Details" button
			*	Storing the Id of the chosen Test Case using the localStorage object : 'testCaseId'
			*	Display details : Changes page to TestCaseExe and showing the info of the clicked Test Case
			*/
				localStorage.setItem("testCaseId",Number(e.currentTarget.attributes['data-id'].value));
				window.location.href = "index.html#TestCaseExe";
        },
		
        onSumupDataChanged: function () {
                services.SumupService.getEntity(data => {
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
	Sumup.prototype._prepareSumupForList = function (doc) {
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
/** @namespace window.ru.belyiz.pages.AppMatrix */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.AppMatrix', AppMatrix);
    Pattern.extend(AppMatrix);


    /**
     * @constructor
     */
    function AppMatrix() {
        this.pageSettings = {
            pageCode: 'AppMatrix',
            saveBtnText: 'Save changes',
            removeBtnText: 'Delete Application Matrix',
            entityInfoWidget: widgets.AppMatrixInfo,
            entitiesListWidget: widgets.ItemsList,
            entitiesListWidgetSetup: {emptyListMsg: 'No applicable Requirements chosen'},
            entitiesListPrepareDataFunction: this._prepareAppMatrixForList,
            entityService: services.AppMatrixService,
            downloadFileName: 'AppMatrix',
            activeEntityId: '',
			mainDocId : services.AppMatrixService.appMatrixDocId,
			representedParams : ['requirement']
        };
    }

    AppMatrix.prototype._createWidgets = function () {
        Pattern.clazz.prototype._createWidgets.call(this);
		
		
    };

    AppMatrix.prototype._bindEvents = function () {
        Pattern.clazz.prototype._bindEvents.call(this);
        global.nodes.body.on('click', '[data-page-code="AppMatrix"] .js-download-file', this._events.onDownloadButtonClick.bind(this));
    };

    AppMatrix.prototype._bindWidgetsEvents = function () {
        Pattern.clazz.prototype._bindWidgetsEvents.call(this);
        this.entityInfoWidget.on('changed', this._events.onAppMatrixDataChanged, this);
    };

    AppMatrix.prototype._unbindWidgetsEvents = function () {
        Pattern.clazz.prototype._unbindWidgetsEvents.call(this);
        this.entityInfoWidget.off('changed', this._events.onAppMatrixDataChanged, this);
    };

    AppMatrix.prototype._events = $.extend({
		
        onAppMatrixDataChanged: function () {
                services.AppMatrixService.getEntity(data => {
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
	AppMatrix.prototype._prepareAppMatrixForList = function (doc) {
        //console.log("here")
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
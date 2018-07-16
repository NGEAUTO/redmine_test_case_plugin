/** @namespace window.ru.belyiz.pages.Specification */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.Specification', Specification);
    Pattern.extend(Specification);


    /**
     * @constructor
     */
    function Specification() {
        this.pageSettings = {
            pageCode: 'Specification',
            createBtnText: 'Create new Requirement',
            saveBtnText: 'Save changes',
            removeBtnText: 'Delete Requirement',
            entityInfoWidget: widgets.SpecificationInfo,
            entitiesListWidget: widgets.ItemsList,
            entitiesListWidgetSetup: {emptyListMsg: 'No saved Requirements'},
            entitiesListPrepareDataFunction: this._prepareSpecificationForList,
            entityService: services.SpecificationService,
            downloadFileName: 'Specification',
			documentId : 'specification_2_spec',
            activeEntityId: '',
			representedParams : ['name','description'],
        };
    }

    Specification.prototype._createWidgets = function () {
        Pattern.clazz.prototype._createWidgets.call(this);
    };

    Specification.prototype._bindEvents = function () {
        Pattern.clazz.prototype._bindEvents.call(this);

        global.nodes.body.on('click', '[data-page-code="Specification"] .js-download-file', this._events.onDownloadButtonClick.bind(this));
    };

    Specification.prototype._bindWidgetsEvents = function () {
        Pattern.clazz.prototype._bindWidgetsEvents.call(this);
        this.entityInfoWidget.on('changed', this._events.onSpecificationDataChanged, this);
    };

    Specification.prototype._unbindWidgetsEvents = function () {
        Pattern.clazz.prototype._unbindWidgetsEvents.call(this);
        this.entityInfoWidget.off('changed', this._events.onSpecificationDataChanged, this);
    };

    Specification.prototype._events = $.extend({
		
        onSpecificationDataChanged: function () {
                services.SpecificationService.getEntity(this.pageSettings.documentId, data => {
                   this.entitiesListWidget.reDraw(data.data.requirements);
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
	Specification.prototype._prepareSpecificationForList = function (docs) {
        let requirementsGroup = [];
		if (services.DatabaseService.localDB != null) {
			var json = defaultSettings;
				for (let doc of docs) {
					let requirement = {Name : "" , Description : ""};
					for(var i=0;i<doc.requirements.length;i++){
						for (let rowParams of json.specification.header.rows) {
							requirement[rowParams.name] = doc.requirements[rowParams.code];
						}
						requirementsGroup.push(requirement);
					}
				}
			
		}else{
			for (let doc of docs) {
				let requirement = {Name : "" , Description : ""};
				for(var i=0;i<doc.requirements.length;i++){
					for (let rowParams of doc.settings.specification.header.rows)
						requirement[rowParams.name] = doc.requirements[rowParams.code];
					requirementsGroup.push(requirement);
				}
			}
		}
        return requirementsGroup;
    };

})(window, window.ru.belyiz.patterns.AbstractEntityInfoPage, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);
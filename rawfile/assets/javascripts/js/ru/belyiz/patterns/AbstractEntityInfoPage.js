/** @namespace window.ru.belyiz.patterns.AbstractEntityInfoPage */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    AbstractEntityInfoPage.prototype = Object.create(Pattern.proto);

    utils.Package.declare('ru.belyiz.patterns.AbstractEntityInfoPage', {
        extend: function (newPage) {
            newPage.prototype = Object.create(AbstractEntityInfoPage.prototype);
        },

        clazz: AbstractEntityInfoPage,
        proto: AbstractEntityInfoPage.prototype
    });

    Pattern.extend(AbstractEntityInfoPage);

    /**
     * @constructor
     *
     * Abstract parent class for standard markup pages: Entity information on the right and column with Vpiskom all entities on the left.
     *
     * The child class must be a variable:
     * this.pageSettings = {
     *     pageCode: Page ID,
     *     createBtnText: Text on the Create new entity button,
     *     saveBtnText: Text on Save Changes button,
     *     removeBtnText: Text on the Delete entity button,
     *     entityInfoWidget: Link to widget, heir from AbstractEntityInfo Widget,
     *     entitiesListWidget: Link to Widget, Heir from ReDrawableWidget,
     *     entitiesListWidgetSetup: Options widget with Entity list
     *     entitiesListPrepareDataFunction: The transform document function from the database to the data to display the list of items
     *     entityService: A reference to the service for working with an entity in a database,
     *     downloadFileName: Download name,
     *     activeEntityId: Entity ID, that will be selected by default when the page loads
     * }
     */
    function AbstractEntityInfoPage() {
    }

    AbstractEntityInfoPage.prototype._cacheElements = function () {
        this.$content = $('#content_js');
        //console.log(this.$content)
        //this.$content = $('#content');
        this.$resultTable = $('#resultTable');
		if (this.pageSettings.pageCode != 'AppMatrix') this.$itemsListContainer = $('#itemsVerticalListContainer');
		else this.$itemsListContainer = $('');
		this.$manageItemBtnsContainer = $('.js-manage-item-buttons');
        this.$removeItemBtn = this.$manageItemBtnsContainer.find('.js-remove-button');
        this.$saveItemBtn = $('.js-save-button');
    };

    AbstractEntityInfoPage.prototype._createWidgets = function () {
        if (!(this.pageSettings.entityService instanceof global.ru.belyiz.patterns.AbstractEntityService.clazz))
            throw ('Option entityService must be of type AbstractEntityService');
        this.entityInfoWidget = new this.pageSettings.entityInfoWidget({
            container: this.$content,
            entityService: this.pageSettings.entityService
        }).initialize();
        if (!(this.entityInfoWidget instanceof global.ru.belyiz.patterns.AbstractEntityInfoWidget.clazz))
            throw ('Option entityInfoWidget must be of type AbstractEntityInfoWidget');
        this.entitiesListWidget = new this.pageSettings.entitiesListWidget($.extend({}, this.pageSettings.entitiesListWidgetSetup, {
            container: this.$itemsListContainer
        })).initialize();
        if (!(this.entitiesListWidget instanceof global.ru.belyiz.patterns.ReDrawableWidget.clazz))
            throw ('Option entityInfoWidget must be of type AbstractEntityInfoWidget');
    };

    AbstractEntityInfoPage.prototype._bindEvents = function () {
		var Create = utils.HtmlGenerator.generatePageCodeButton(this.pageSettings.pageCode,'create');
		var Save = utils.HtmlGenerator.generatePageCodeButton(this.pageSettings.pageCode,'save');
		var Remove = utils.HtmlGenerator.generatePageCodeButton(this.pageSettings.pageCode,'remove');
		global.nodes.body.on('click', Create, this._events.onCreateButtonClick.bind(this));
        global.nodes.body.on('click', Save, this._events.onSaveButtonClick.bind(this));
        global.nodes.body.on('click', Remove, this._events.onRemoveButtonClick.bind(this));
        this._bindWidgetsEvents();
    };

    AbstractEntityInfoPage.prototype._bindWidgetsEvents = function () {
        this._unbindWidgetsEvents();
        this.entitiesListWidget.on('selected', this._events.onItemSelected, this);
        services.DatabaseService.on('dbChanged', this._events.onDatabaseChanged, this);
        services.DatabaseService.on('dbSynchronized', this._events.onDatabaseSynchronized, this);
        services.UndoService.on('undo', this._events.onActionUndo, this);
    };

    AbstractEntityInfoPage.prototype._unbindWidgetsEvents = function () {
        this.entitiesListWidget.off('selected', this._events.onItemSelected);
        services.DatabaseService.off('dbChanged', this._events.onDatabaseChanged);
        services.DatabaseService.off('dbSynchronized', this._events.onDatabaseSynchronized);
        services.UndoService.off('undo', this._events.onActionUndo);
    };

    AbstractEntityInfoPage.prototype._ready = function () {
		$('.js-create-button span').text(this.pageSettings.createBtnText || 'Create');
        $('.js-save-button span').text(this.pageSettings.saveBtnText || 'Save changes');
        $('.js-remove-button span').text(this.pageSettings.removeBtnText || 'Delete');
        this.$content.html('');
        this.$itemsListContainer.html('');
         this.$resultTable.html('');
        if (services.DatabaseService.isInitialized()) {
            this.showEntitiesList();
            this.showEntityInfo();
		}
    };

    AbstractEntityInfoPage.prototype.enable = function () {
        this._bindWidgetsEvents();
        this.$manageItemBtnsContainer.show();
        this._ready();
    };

    AbstractEntityInfoPage.prototype.disable = function () {
        this._unbindWidgetsEvents();
    };

    AbstractEntityInfoPage.prototype._events = {

        onCreateButtonClick: function () {
            console.log(this)
            this.showEntityInfo();
			this.showEntitiesList();
            this.entitiesListWidget.resetSelection();
        },

        onRemoveButtonClick: function () {
            this.pageSettings.entityService.removeEntity(
                this.entityInfoWidget.getData(),
                () => {
                    this.showEntityInfo();
                    this.showEntitiesList();
                }
            );
        },

        onSaveButtonClick: function () {
            const data = this.entityInfoWidget.getData();
            var that=this;
             this.pageSettings.entityService.getEntity(this.pageSettings.activeEntityId,(entity)=> {
                that.pageSettings.entityService.saveEntity(data, (response) => {
                //console.log(response)
                if (that.pageSettings.pageCode=='TestCaseExe'){
                    console.log("pagecode : "+that.pageSettings.pageCode)
                        //console.log(entity,response);
                        services.IssuesService.getTestCaseChanges(entity,response,function(changes){
                            console.log("got the changes")
                            console.log(changes)
                            if (changes != ""){
                                services.IssuesService.getCurrentUser(function(user){
                                    console.log("got the user")
                                    services.IssuesService.generateComment(changes,user);
                                });
                            }
                            else 
                                console.log("no changes detected !")
                        });
                        
                    }
                    that.showEntityInfo(response.id);
                that.showEntitiesList(response.id);
                });
				
            },
            (error)=> {
                console.log(error)
            });
        },

        onDatabaseChanged: function () {
            this.showEntityInfo();
			this.showEntitiesList();
        },

        onDatabaseSynchronized: function () {
            this.showEntitiesList(this.pageSettings.activeEntityId);
            if (this.pageSettings.activeEntityId) {
                this.pageSettings.entityService.getEntity(
                    this.pageSettings.activeEntityId,
                    entity => this.entityInfoWidget.showDifference(entity),
                    err => {
                        if (err.status === 404) {
                            this.pageSettings.activeEntityId = '';
                            this.entityInfoWidget.removedOnServer();
                            this.$removeItemBtn.hide();
                        } else {
                            services.DatabaseService.processError.call(this.pageSettings.entityService, err)
                        }
                    }
                );
            }
        },

        onItemSelected: function (data) {
            global.nodes.body.trigger('closeVerticalMenu');
            this.showEntityInfo(data.id);
			this.showEntitiesList();
        },

        /**
         * When the user cancels the action
         * @param data Object with ID and entity type
         */
        onActionUndo: function (data) {
            if (data.type === this.pageSettings.entityService.type) {
                this.showEntityInfo(data.id);
                this.showEntitiesList(data.id);
            }
        }
    };
	
    AbstractEntityInfoPage.prototype.showEntityInfo = function (id=this.pageSettings.chosenTestCaseId) {
		if(this.pageSettings.pageCode == 'TestCaseExe'){
			var chosenTestCaseId = localStorage.getItem("testCaseId") ;
			if (chosenTestCaseId != null) {id = Number(chosenTestCaseId);localStorage.removeItem("testCaseId");}
			}
        function onSuccess(settings, values) {
			/**
			* Checking if the document has attachments 
			*/
			var that = this;
			if (values != undefined && values.attachmentId != undefined){
				this.pageSettings.entityService.getAttachment(this.pageSettings.imagesDocId, values.attachmentId, function (binary){
					values.binary = binary;
					that.entityInfoWidget.reDraw(settings, values);
				});
			}
			else{
				/**
				* Checking if other Documents are needed to represent the current Entity
				*/
				if (this.pageSettings.relatedDocsType != undefined)
					services.DatabaseService.getTestCaseExeRelatedDocs(this.pageSettings.relatedDocsType, function (docs){
						that.entityInfoWidget.reDraw(settings, values, docs);
					});
				else if (this.pageSettings.relatedDocType != undefined)
					services.DatabaseService.getSpecification( function (doc){
						if (that.pageSettings.relatedDocType != 'specification'){
							services.DatabaseService.allDocs(that.pageSettings.relatedDocType, function(docs){
								var relatedDocs = {
									testSetup : docs,
									specificationDoc : doc
								}
								that.entityInfoWidget.reDraw(settings, values, relatedDocs);
							});
						}
						else{
							var relatedDocs = {
								specificationDoc : doc
							}
							that.entityInfoWidget.reDraw(settings, values, relatedDocs);
						}
					});
				else if (this.pageSettings.mainDocId != undefined) 
								 this.pageSettings.entityService.getEntity( function(doc) {
									var mainDoc = {
										requirementsDoc : doc
									}
									that.entityInfoWidget.reDraw(settings,values, mainDoc);	 
								});
				else if (this.pageSettings.mainDocsType != undefined) 
								 this.pageSettings.entityService.all( function(docs) {
									that.entityInfoWidget.reDraw(settings,values, docs);	 
								});
				else that.entityInfoWidget.reDraw(settings,values);
			}
        }
        this.pageSettings.activeEntityId = id || '';
        if (id) {
			//console.log(id);
            this.pageSettings.entityService.getEntity(id, entity =>{
				if (entity._id == 'specification_2_spec') {
					if (services.DatabaseService.localDB != null)
						onSuccess.call(this, defaultSettings, entity);
					else onSuccess.call(this, entity.data.settings, entity);	
				}else onSuccess.call(this, entity.settings, entity);
			}, err =>{console.log(err)});
            this.$removeItemBtn.show();
        } else {
			services.DatabaseService.getSettings(settings => onSuccess.call(this, settings));
            this.$removeItemBtn.hide();
        }
        this.$manageItemBtnsContainer.show();
    };

    AbstractEntityInfoPage.prototype.showEntitiesList = function (activeId) {
        this.pageSettings.entityService.all([], docs => {
            const entities = this.pageSettings.entitiesListPrepareDataFunction(docs);
			if (docs.length == 1 && docs[0].requirements)
				this.entitiesListWidget.reDraw(docs[0].requirements, activeId, this.pageSettings.representedParams);
			else
				this.entitiesListWidget.reDraw(entities, activeId, this.pageSettings.representedParams);
        });
    };

})(window, window.ru.belyiz.patterns.Page, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);
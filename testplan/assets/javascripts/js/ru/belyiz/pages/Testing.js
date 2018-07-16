/** @namespace window.ru.belyiz.pages.Testing */

(function (global, Pattern, utils, widgets, services) {
    'use strict';
    utils.Package.declare('ru.belyiz.pages.Testing', Testing);
    Pattern.extend(Testing);

    /**
     * @constructor
     */
    function Testing(setup) {
        setup = setup || {};
        //todo Gets the ID of the entity and its type
        this.defaultEntityType = setup.defaultEntityType || 'tests';
        this.currentEntityType = this.defaultEntityType;
        this._msgTestCasesListEmpty = 'No Briefcase test saved';
        this._msgGroupsListEmpty = 'No saved groups';
		this.representedParams = ['Name','Code'];
    }

    Testing.prototype._cacheElements = function () {
        this.$content = $('#content_js');
        //this.$content = $('#content');
        this.$resultTable = $('#resultTable');
        this.$itemsListContainer = $('#itemsVerticalListContainer');
        this._cacheSidebarElements();
    };

    /**
     * To reset the sidebar HTML to the base and caching elements
     * @private
     */
    Testing.prototype._cacheSidebarElements = function () {
        this.setSidebarBasicHTML();
        this.$sidebarPanes = this.$itemsListContainer.find('.js-testing-sidebar-pane');
        this.$testsContainer = this.$sidebarPanes.filter('[data-entity-type="tests"]');
        //this.$grouspContainer = this.$sidebarPanes.filter('[data-entity-type="groups"]');
    };

    Testing.prototype._createWidgets = function () {
        //console.log(his.$content);
        this.testingStepsWidget = new widgets.TestingSteps({
            container: this.$content,
            entityService: services.TestCasesExeService
        }).initialize();
        this.testingResultTableWidget = new widgets.TestingResultTable({container: this.$resultTable}).initialize();
        this._createEntitiesListsWidgets();
    };

    /**
     * Create widgets for the list of entities in sidebar
     * @private
     */
    Testing.prototype._createEntitiesListsWidgets = function () {
        this.testsListWidget = new widgets.ItemsList({
            emptyListMsg: this._msgTestCasesListEmpty,
            container: this.$testsContainer
        }).initialize();
        this.groupsListWidget = new widgets.ItemsList({
            emptyListMsg: this._msgGroupsListEmpty,
            container: this.$grouspContainer
        }).initialize();
    };

    Testing.prototype._bindWidgetsEvents = function () {
        this._unbindWidgetsEvents();
        this.testingStepsWidget.on('changed', this._events.onTestingResultChanged, this);
        services.DatabaseService.on('dbChanged', this._events.onDatabaseChanged, this);
        this.testsListWidget && this.testsListWidget.on('selected', this._events.onItemSelected, this);
        this.groupsListWidget && this.groupsListWidget.on('selected', this._events.onItemSelected, this);
    };

    Testing.prototype._unbindWidgetsEvents = function () {
        this.testingStepsWidget.off('changed', this._events.onTestingResultChanged);
        services.DatabaseService.off('dbChanged', this._events.onDatabaseChanged);
        this.testsListWidget && this.testsListWidget.off('selected', this._events.onItemSelected);
        this.groupsListWidget && this.groupsListWidget.off('selected', this._events.onItemSelected);
    };

    Testing.prototype._bindEvents = function () {
        this._bindWidgetsEvents();
		var Save = utils.HtmlGenerator.generatePageCodeButton('Testing','save');
		global.nodes.body.on('click', Save, this._events.onSaveButtonClick.bind(this));
        global.nodes.body.on('keyup', '[data-page-code="Testing"] textarea', this._events.onTextAreaKeyup.bind(this));
        global.nodes.body.on('click', '[data-page-code="Testing"] .js-download-file', this._events.onDownloadButtonClick.bind(this));
        global.nodes.body.on('show.bs.tab', '.js-testing-sidebar-tab', this._events.onSidebarTabChanged.bind(this));
    };

    Testing.prototype._events = {
        // When the test result data has changed
        onTestingResultChanged: function () {
            this.testingResultTableWidget.reDraw(this.testingStepsWidget.getData());
        },

        // When Nazhadi to the test report download button
        onDownloadButtonClick: function (e) {
            const $target = $(e.currentTarget);
            utils.TableToFileConverter.convert(this.$resultTable, 'testingResult', $target.data('fileType'));
        },

        onTextAreaKeyup: function (e) {
            utils.InputsUtils.resizeTextArea(e.currentTarget);
        },

        // When Nazhadi to the test Report save button
        onSaveButtonClick : function(e){
			
			var data = this.testingStepsWidget.getData();
			for (var i=0;i<data.testCases.length;i++){
				var testCaseExeDoc = '';
				services.DatabaseService.executeTestCase(data.testCases[i].id,data.testCases[i].logfile, data.testCases[i].file_object,data.testingResult[data.testCases[i].id].steps);
			}
			/**
			*	Get Data : Array of Test Cases + Array of Results
			*	Update Test Case Execution Doucments (new attributes : logfile + screenshots for steps) 
			*		call Test Case Execution Service : saveEntity
			*		Store Attachements (logfile + (NumberOfSteps X Screenshots))
			*/
		},
		
        // When the database was changed
        onDatabaseChanged: function () {
            this.showEntitiesList();
            this.showEntityInfo();
        },

        // When an item in the Entity list is selected
        onItemSelected: function (data) {
            global.nodes.body.trigger('closeVerticalMenu');
			var that=this;
            if (data.id) {
                this._getEntityService().getEntity(data.id, entity => {
					that.showEntityInfo.call(this, entity);
				});
            } else {
                this.showEntityInfo();
            }
        },

        // When the type of entities used has changed
        onSidebarTabChanged: function (e) {
            const $target = $(e.currentTarget);
            this.currentEntityType = /*$target.data('entityType') ||*/ this.defaultEntityType;
            this.showEntitiesList();
            this.showEntityInfo();
        }
    };

    Testing.prototype._prepareTestCasesForList = function (docs) {
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

    Testing.prototype.enable = function () {
        this.$content.html('');
        this.$resultTable.html('');
        ($('.js-manage-item-buttons').children())[1].hidden=true;
        this.currentEntityType = this.defaultEntityType;
        this._cacheSidebarElements();
        this._createEntitiesListsWidgets();
        this._bindWidgetsEvents();

        if (services.DatabaseService.isInitialized()) {
            this.showEntitiesList();
            this.showEntityInfo();
        }
    };

    Testing.prototype.disable = function () {
        delete this.testsListWidget;
        delete this.groupsListWidget;
        this._unbindWidgetsEvents();
    };

    /**
     * Sets the initial state of the side panel HTML
     */
    Testing.prototype.setSidebarBasicHTML = function () {
		var sideBar = utils.HtmlGenerator.generateSideBar(this.defaultEntityType);
        this.$itemsListContainer.html(sideBar);
    };

    /**
     * Shows the entity data to begin testing
     * @param entity Entity Data
     */
    Testing.prototype.showEntityInfo = function (entity) {
		var logfile=''
		var attachmentValue='';
		var that=this;
		if (entity!=undefined){
			if (entity.logfileId!=undefined || (entity.blocksValues!=undefined&&entity.blocksValues.results!=undefined)){
				if(entity.logfileId != undefined){
					services.DatabaseService.getAttachment(entity.logfileId, function (attachment){
						var attachmentsValue = {
							logfile : attachment,
							//stepAttachment : []
						}
						logfile = attachment;
						//var i=0;
						//var steps =[];
						/*while(entity.blocksValues.results[''+i]!=undefined){
							
							services.DatabaseService.getAttachment(entity.blocksValues.results[''+i].attachmentId, function (attach){
								steps.push(attach);
								attachmentsValue.stepAttachment=steps;
								that.testingStepsWidget.reDraw(entity,attachmentsValue);
							});
							i++;
						}*/
						//that.testingStepsWidget.reDraw(entity,attachmentsValue);
					});
				}
				var x=0;
				while (entity.blocksValues.results[''+x]!=undefined) x++;
				if (entity.blocksValues.results!=undefined){
					var attachmentsValue = {
							stepAttachment : []
						}
						
						var steps =[];
						
							var result=entity.blocksValues.results;
								services.DatabaseService.getAttachments(x,result, function (attachs){
									attachmentsValue.stepAttachment=attachs;
									if (logfile !='') that.testingStepsWidget.reDraw(entity,{logfile:logfile,stepAttachment:attachs});
									else that.testingStepsWidget.reDraw(entity,{stepAttachment:attachs});
								});
				}
			}else 
				that.testingStepsWidget.reDraw(entity,attachmentValue);
		}else
			this.testingStepsWidget.reDraw(entity,attachmentValue);
    };

    /**
     * Shows data for the list of entities in sidebar
     * @param activeId ID of the selected entity
     */
    Testing.prototype.showEntitiesList = function (activeId = -1) {
        this._getEntityService().all([], docs => {
            const entities = this.prepareItemsForList(docs, this.currentEntityType);
            this._getEntitiesListWidget().reDraw(entities, activeId, this.representedParams);
        });
    };

    Testing.prototype._getEntityService = function () {
        if (this.currentEntityType === 'tests') {
            return services.TestCasesExeService;
        } else if (this.currentEntityType === 'groups') {
            return services.GroupsService;
        }
        return null;
    };

    Testing.prototype._getEntitiesListWidget = function () {
        if (this.currentEntityType === 'tests') {
            return this.testsListWidget;
        } else if (this.currentEntityType === 'groups') {
            return this.groupsListWidget;
        }
        return null;
    };

    Testing.prototype.prepareItemsForList = function (docs = []) {
        let testCases = [];
        for (let doc of docs) {
            let testCase = {id: doc.id, rev: doc.rev};
            for (let rowParams of doc.settings[this.currentEntityType].header.rows) {
                testCase[rowParams.name] = doc.headerValues[rowParams.code];
            }
            testCases.push(testCase);
        }
        return testCases;
    };

})(window, window.ru.belyiz.patterns.Page, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services);
/** @namespace window.ru.belyiz.pages.Common */

(function (global, utils, widgets, services, pages) {
    'use strict';

    /**
     * @constructor
     */
    function Main() {
        services.IssuesService.generateTestPlanIssues();
        this.initPages = {};
        this.defaultPage = 'Specification';
        this.msgSettingsSaved = 'Settings saved';

        /**
        *   var to hold the current project id
        */
        this.project_id = '';
        this.dbPrefix = services.DatabaseService.dbPrefix;
        
    }


    /**
    *   function => create/connect to testplan :
    *       get project id from url
    *       check databases for existing testplan
    *       connect to existing testplan
    *           or
    *       create new testplan (Database )
    */
    Main.prototype.connectProjectToTestPlan = function () {
        this.checkTestPlan();
        
        
    };

    Main.prototype.checkTestPlan = function () {
        //console.log("checking..")
        var that=this;
        this.project_id = utils.InputsUtils.getUrlParameter('project_id');
        console.log(this.project_id);
        services.DatabaseService.getAllTestPlans(function (allTestPlans) {
            /**
            *   TestPlan Database already exists    ==> Connect to the Database
            */
            if (allTestPlans.indexOf('test_plan_'+that.project_id)>=0){
                //console.log('TestPlan relative to '+that.project_id +' : ' + allTestPlans[allTestPlans.indexOf('test_plan_'+that.project_id)])
                //console.log('Position in allTestPlans : ' +allTestPlans.indexOf('test_plan_'+that.project_id))
                services.DatabaseService.currentDbName = 'test_plan_'+that.project_id;
                services.DatabaseService._init();
                //console.log(services.DatabaseService.currentDbName)
            }
            /**
            *   TestPlan Database is not created yet    ==> Create the Database
            *                                           ==> Connect to the Database
            */
            else {
                console.log('No corresponding Database ('+allTestPlans.indexOf('test_plan_'+that.project_id)+')');
                console.log('Creating a new Database for the project : '+that.project_id);
                /**
                *   Generating Data related to the new TestPlan Database
                */
                var creationDate = utils.InputsUtils.getToday();
                let testPlanData = {
                    name : that.project_id,
                    description :'TestPlan Database created for the project : '+that.project_id,
                    cdate : creationDate
                };
                console.log(testPlanData)
                services.TestPlanService.saveEntity(testPlanData, function(){
                    services.DatabaseService.currentDbName = 'test_plan_'+that.project_id;
                    services.DatabaseService._init();
                });
            }
        });
    };

    Main.prototype.initialize = function () {
        this.connectProjectToTestPlan();
        this._cacheElements();
        this._createWidgets();
        this._bindEvents();
        this._ready();
    };


    Main.prototype._cacheElements = function () {
        this.$pagesContainer = $('.js-page-container');
        //console.log(this.$pagesContainer);
        this.$localDbBadge = $('.js-local-db-badge');
        //console.log(this.$localDbBadge);
        this.$currentDbNameBadge = $('.js-current-db');
        //console.log( this.$currentDbNameBadge);
        this.$pagesLinks = $('.js-nav-link');
        //console.log(this.$pagesLinks);
    };

    Main.prototype._createWidgets = function () {
        this.settingsModalWidget = new widgets.SettingsModal().initialize();
        this.verticalMenu = new widgets.VerticalMenu({menuId: 'itemsVerticalListMenu'}).initialize();
    };

    Main.prototype._bindEvents = function () {
		/**
		*	binding the Event of clicking on "Sumup" button to a handler
		*/
		global.nodes.body.on('click','.js-sumup-button', this._events.onSumupClick.bind(this));
		/**
		*	binding the Event of clicking on "Back to Test Case Creator" button to a handler
		*/
		global.nodes.body.on('click', '.js-index-button', this._events.onBackToTestClick.bind(this));
		//global.nodes.body.on('click', '.js-sumup-button', this._events.onBackToSumupClick.bind(this));
        global.nodes.body.on('click', '.js-settings-button', this._events.onEditSettingsClick.bind(this));
        global.nodes.body.on('click', '.js-change-db-button', this._events.onChangeDbClick.bind(this));
        global.nodes.body.on('click', '.js-nav-link', this._events.onPageLinkClick.bind(this));
        global.nodes.body.on('closeVerticalMenu', () => this.verticalMenu.hide());
        this.settingsModalWidget.on('save', this._events.onSettingsSaved, this);
        services.DatabaseService.on('dbChanged', this._events.onDatabaseChanged, this);
    };

    Main.prototype._ready = function () {
        this._showPage();
    };

    Main.prototype._events = {

        onEditSettingsClick: function () {
            services.DatabaseService.getSettings(settings => {
                this.settingsModalWidget.show(settings);
            });
        },
		

		/**
		*	This Event will change the current Page to the RawFile Page
		*/
		onSumupClick: function () {
            window.location.href = "rawFile.html#Sumup";
        },

		
		/**
		*	This Event will change the current Page to the Index Page (Main Test Case Creator Page)
		*/
		onBackToTestClick: function () {
            window.location.href = "index.html#AppMatrix";
        },

		
        onChangeDbClick: function () {
            services.DatabaseService.showDbChoosingDialog();
        },

		
        onSettingsSaved: function (newSettings) {
            services.DatabaseService.saveSettings(newSettings, (entity) => services.Notification.success(this.msgSettingsSaved));
        },

		
        onDatabaseChanged: function (data) {
            this.$localDbBadge.toggle(!!data.local);
            this.$currentDbNameBadge.text(data.local ? 'Local' : data.name);
            //console.log(data,this.$currentDbNameBadge.text());
        },
		
        
        onPageLinkClick: function (e) {
            const $target = $(e.currentTarget);
            const hash = $target.attr('href').replace('#', '');
            this._showPage(hash);
			
        }
    };

    Main.prototype._showPage = function (pageCode) {
        pageCode = pageCode || this._getCurrentUrlHash();
        //if (this.$pagesLinks.filter('a.nav-link.active').attr('href') != undefined){
        const actualPageCode = this.$pagesLinks.filter('a.nav-link.active').attr('href').substring(1);
        if (actualPageCode && this.initPages[actualPageCode])
            this.initPages[actualPageCode].disable();
        this.$pagesLinks.removeClass('active');
        this.$pagesLinks.filter(`[href="#${pageCode}"]`).addClass('active');
        
        if (!this.initPages[pageCode])
            this.initPages[pageCode] = new pages[pageCode]().initialize();
        /**
        *   jquery : function attr(name,value)
        */
        this.$pagesContainer.attr('data-page-code', pageCode);
        /**
        *   jquery : function show()
        */
        this.$pagesContainer.show();
        /**
        *   AbstractEntityInfoPage.js : function enable()
        */
        this.initPages[pageCode].enable();
    //}
    };



    Main.prototype._getCurrentUrlHash = function () {

        const hash = global.location.hash.replace('#', '');

        return (hash && hash in pages) ? hash : this.defaultPage;
    };


    new Main().initialize();
})(window, window.ru.belyiz.utils, window.ru.belyiz.widgets, window.ru.belyiz.services, window.ru.belyiz.pages);
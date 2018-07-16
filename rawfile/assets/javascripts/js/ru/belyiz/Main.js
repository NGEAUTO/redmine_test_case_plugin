/** @namespace window.ru.belyiz.pages.Common */

(function (global, utils, widgets, services, pages) {
    'use strict';

    /**
     * @constructor
     */
    function Main() {
        services.IssuesService.generateRawfileIssues();
        //services.IssuesService.checkForChanges();
        this.initPages = {};
        this.defaultPage = 'AppMatrix';
        this.msgSettingsSaved = 'Settings saved';

        /**
        *   var to hold the current project id
        */
        this.project_id = '';
        this.dbUsed = '';
        
    }


    /**
    *   Initialize the Test Plan used (Database) of the Rawfile project
    */
    Main.prototype.initTestPlan = function () {
        this.checkTestPlan(function (testplan) {
            //console.log('initTestPlan callback function : ',testplan)
            if (testplan == '') {
                //console.log("showing databases")
                /**
                *   the project is not linked to a testplan (just created)
                *   => the user will choose a testplan (database)
                */
                //console.log('no testplan linked to this project')
                services.DatabaseService.showDbChoosingDialog();
                /** Choosing a Test Plan to link to the current Rawfile Project
                *   => action : the event 'apply', when triggered, will access the test_plan_links_db database
                *               and update the links document with the new link (Rawfile & Testplan).
                */ 
            }
            else {
                /**
                *   the project is already linked to a testplan
                *   => use the linked testplan
                */
                //console.log('testplan already linked : '+testplan)
                //console.log('connecting to :',testplan)
                services.DatabaseService.currentDbName = testplan;
                services.DatabaseService._init();
                //console.log('connected to : '+services.DatabaseService.currentDbName)
                
            }
        });
    };

    /**
    *   Checking if the selected Rawfile project is already linked to a Test Plan
    */
    Main.prototype.checkTestPlan = function (callback) {
        this.project_id = utils.InputsUtils.getUrlParameter('project_id');
        services.DatabaseService.getLinkedTestPlan(this.project_id, function(testplan){
            //console.log(testplan)
            callback(testplan);
        });
    };

    Main.prototype.initialize = function () {
        this.initTestPlan();
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
        //this.settingsModalWidget.show();
        this.verticalMenu = new widgets.VerticalMenu({menuId: 'itemsVerticalListMenu'}).initialize();
    };

    Main.prototype._bindEvents = function () {

        /**
        *
        */
        global.nodes.body.on('click','.js-issues-button', this._events.onGenerateIssuesClick.bind(this));
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
            //this.defaultPage = 'Sumup';
            window.location.href = "rawfile/new#Sumup";
        },

        /**
        *   This Event will change the current Page to the RawFile Page
        */
        onGenerateIssuesClick: function () {
            services.IssuesService.generateAllIssues();
        },

		
		/**
		*	This Event will change the current Page to the Index Page (Main Test Case Creator Page)
		*/
		onBackToTestClick: function () {
            //this.defaultPage = 'AppMatrix';
            window.location.href = "";
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
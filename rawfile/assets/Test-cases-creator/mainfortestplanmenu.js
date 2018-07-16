function Main() {

        this.initPages = {};
        this.defaultPage = 'AppMatrix';
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
        var that=this;
        this.project_id = utils.InputsUtils.getUrlParameter('project_id');
        //console.log(this.project_id);
        services.DatabaseService.getAllTestPlans(function (allTestPlans) {
            if (allTestPlans.indexOf('test_plan_'+that.project_id)>=0){
                console.log('TestPlan relative to '+that.project_id +' : ' + allTestPlans[allTestPlans.indexOf('test_plan_'+that.project_id)])
                console.log('Position in allTestPlans : ' +allTestPlans.indexOf('test_plan_'+that.project_id))
            }
            else console.log(allTestPlans.indexOf('test_plan_'+that.project_id))
        });
    };

    Main.prototype.initialize = function () {
        this.connectProjectToTestPlan();
        this._cacheElements();
        this._createWidgets();
        this._bindEvents();
        this._ready();
    };

 /** @namespace window.ru.belyiz.services.IssuesService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(IssuesService);

    /**
     * Service to provide functions dealing with Redmine Issues
     * @constructor
     */
    function IssuesService() {
        //console.log('hello from issues service')
        this.remoteDbUrl = 'http://158.69.206.223:5984';
        this.redmineUrl = 'http://158.69.206.223:5221';
        this.issuesSubjects=['Test Case Update','Another Rawfile Issue'];
        this.issuesDocuments=[testCaseUpdateIssue,anotherIssue];
        this.issuesRetrieved=0;
        this.issuesData=[];
    }

    IssuesService.prototype.generateRawfileIssues = function () {
        var that=this;
        this.getAllProjectIssues(function (issuesNames){
            //console.log(issuesNames)
            for (var i=0;i<that.issuesSubjects.length;i++){
                if (issuesNames.indexOf(that.issuesSubjects[i]) < 0){
                    that.createIssue(
                           
                                {
                                    "issue" : that.issuesDocuments[i],
                                    "project_id": utils.InputsUtils.getUrlParameter('project_id')
                                }
                            
                    );
                }
            }
        });
    };
    
     /**
    *   Generating Issues from TestCases
    */
    IssuesService.prototype.generateAllIssues = function () {
        var that=this;
        this.getAllProjectIssues(function (issuesNames){
            //console.log('issues : ',issuesNames);
            that.getProjectTestCases(function (TestCases,testCasesNames){
                //console.log('testcases : ',testCasesNames);
                for (var i=0;i<testCasesNames.length;i++){
                    console.log(testCasesNames[i],issuesNames);
                    if (issuesNames.indexOf(testCasesNames[i]) < 0){
                        console.log('new issue created for : '+testCasesNames[i])
                        that.createIssue(testCasesNames[i]);
                    }
                    else
                        console.log(testCasesNames[i]+' already has an issue')
                }
                //that.createIssue()
            });
        });
    };


    IssuesService.prototype.getProjectTestCases = function (callback) {
        services.TestCasesService.all('',function(docs){
            //console.log('TestCases : ',docs)
            var testCasesNames = [];
            for (var i=0;i<docs.length;i++)
                testCasesNames[i]=docs[i].headerValues.name;
            callback(docs,testCasesNames);
        });
    }
    /**
    *   Creating a new Issue
    */
    IssuesService.prototype.createIssue = function (data) {
        var that=this;
        //console.log(this.getTrackerId(data));
        this.getTrackerId(data,function(issue){
            $.ajax({
            url: that.redmineUrl + "/issues.json",
            beforeSend: function (xhr) { 
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("walid.nasri@nge-automotive.com"+":"+"WNasri21022018"))},
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify(issue),
            contentType: 'application/json',
            success: (data) => {
                console.log('success : ',data)
            },
            error: (xhr) => {

               console.log('error : ',xhr)
            }
        });
        });
        
    };

    /**
    *   Building the issue (json string form) depending on the parameters
    */
    IssuesService.prototype.buildIssue = function (subject,tracker) {
        return(
            JSON.stringify(
                {
                    "issue": {
                        "tracker": "Validation",
                        "subject": subject,
                        "status": "New",
                        "priority_id": 2
                    },
                    "project_id": utils.InputsUtils.getUrlParameter('project_id')
                }
            )
        );
    };
    

    /**
    *   Retrieving all the created issues (open)
    */
    IssuesService.prototype.getAllIssues = function (offset='0',limit='25') {
        $.ajax({
            url: this.redmineUrl + "/issues.json?offset="+offset+"&limit="+limit,
            beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("walid.nasri@nge-automotive.com"+":"+"WNasri21022018"))},
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json',
            success: (data) => {
                console.log('success : ',data)
                this.issuesRetrieved += limit;
                this.issuesData = this.issuesData.concat(data.issues); 
                if (data.total_count > this.issuesRetrieved)
                    this.getAllIssues(this.issuesRetrieved,'25');
                else
                    console.log('all issues : ',this.issuesData);
            },
            error: (xhr) => {
               console.log('error : ',xhr)
            }
        });
    };

    

    IssuesService.prototype.getCurrentUser = function (callback) {
        $.ajax({
            url: this.redmineUrl + "/users/current.json",
            beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("walid.nasri@nge-automotive.com"+":"+"WNasri21022018"))},
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json',
            success: (data) => {
                console.log("Current user : "+data.user.firstname+" "+data.user.lastname)
                callback(data.user);
            },
            error: (xhr) => {
               console.log('error : ',xhr)
            }
        });
    };
    

    /**
    *   Retrieving all the created issues under the current project
    */
    IssuesService.prototype.getAllProjectIssues = function (callback,offset='0',limit='25') {
        console.log(this.redmineUrl + "/issues.json?"
                                 +"offset="+offset+"&limit="+limit+"&project_id="+utils.InputsUtils.getUrlParameter('project_id'));
         $.ajax({
            url: this.redmineUrl + "/issues.json?"
                                 +"offset="+offset+"&limit="+limit+"&project_id="+utils.InputsUtils.getUrlParameter('project_id'),
            beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("walid.nasri@nge-automotive.com"+":"+"WNasri21022018"))},
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json',
            success: (data) => {
                //console.log('success : ',data)
                this.issuesRetrieved +=  parseInt(limit);
                //console.log(this.issuesRetrieved)
                this.issuesData = this.issuesData.concat(data.issues); 
                if (data.total_count > this.issuesRetrieved)
                    this.getAllProjectIssues(callback,this.issuesRetrieved,'25');
                else{
                    //console.log('all issues : ',this.issuesData);
                    var issuesNames =[];
                    for (var i=0;i<this.issuesData.length;i++)
                        issuesNames[i]=this.issuesData[i].subject;
                    callback(issuesNames,this.issuesData);
                }
            },
            error: (xhr) => {
               console.log('error : ',xhr)
            }
        });
    };

    /**
    *   Retrieving all the created issues under the current project using a filter depending on the parameters
    */
    IssuesService.prototype.getFilteredProjectIssues = function (filter="",value="") {
        console.log(filter,value)
        var filterUrl = "";
        if (filter !="" && value !="")
            filterUrl = "&"+filter+"="+value;
        $.ajax({
            url: this.redmineUrl + "/issues.json"+"?project_id="+utils.InputsUtils.getUrlParameter('project_id')+filterUrl,
            beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("walid.nasri@nge-automotive.com"+":"+"WNasri21022018"))},
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json',
            success: (data) => {
                console.log('success : ',data)
            },
            error: (xhr) => {
               console.log('error : ',xhr)
            }
        });
    };

    IssuesService.prototype.buildChangesComment = function (comment) {
        return(
            JSON.stringify(
                {
                  "issue": {
                    "notes": comment
                  },
                  "project_id": utils.InputsUtils.getUrlParameter('project_id')
                }
            )
        );
    }

    IssuesService.prototype.getIssueID = function (subject,callback) {
        this.getAllProjectIssues(function (issuesNames,issuesData){
            //console.log(issuesNames.indexOf(subject))
            if (issuesNames.indexOf(subject)>=0){
                //console.log(issuesData[issuesNames.indexOf(subject)].id)
                callback(issuesData[issuesNames.indexOf(subject)].id);
            }
            else
                console.log("no issue is created for : "+subject)
        });   
    };
    IssuesService.prototype.checkForChanges = function (subject,comment){
        this.getCurrentTestPlan(utils.InputsUtils.getUrlParameter('project_id'),function(db){
            db.changes({
                since: 0,
                include_docs: true
            }).then(function (changes) {
                console.log("changes",changes)
            }).catch(function (err) {
                console.log(err)
            });
        });
        
            /*
        var that=this;
        this.getIssueID(subject,function (id){
            that.addComment(comment,id);
        });
        */
    };
    

    IssuesService.prototype.getTrackerId = function (issues,callback) {
        //callback(issues)
        //console.log(issues)
        $.ajax({
            url: this.redmineUrl + "/trackers.json",
            beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("walid.nasri@nge-automotive.com"+":"+"WNasri21022018"))},
            dataType: 'json',
            type: 'GET',
            contentType: 'application/json',
            success: (data) => {
                //console.log(data)
               for (var i=0;i<data.trackers.length;i++){
                //console.log(data.trackers[i])
                if (data.trackers[i].name=="Validation"){
                    console.log(data.trackers[i].id,issues.issue.subject,issues.issue.status,issues.issue.priority_id,issues.project_id)
                    callback ({
                            "issue" : {
                                "tracker_id" : data.trackers[i].id,
                                "subject": issues.issue.subject,
                                "status": issues.issue.status,
                                "priority_id": issues.issue.priority_id
                            },
                            "project_id" :  issues.project_id
                        });
                    };
                }
                  
            },
            error: (xhr) => {
               console.log('error : ',xhr)
            }
        });
    };

    IssuesService.prototype.getCurrentTestPlan = function (project_id,callback) {
        var db = new PouchDB(this.remoteDbUrl+'/test_plan_'+project_id);
        if (typeof callback === 'function'){
            console.log("calling back")
            callback(db);
        }
        else 
            return db;
    };




    IssuesService.prototype.addComment = function (comment,user,id) {
        console.log("writing the comment")
            $.ajax({
                url: this.redmineUrl + "/issues/"+id+".json",
                beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Basic " + btoa("walid.nasri@nge-automotive.com"+":"+"WNasri21022018"))},
                dataType: 'json',
                type: 'PUT',
                data: this.buildChangesComment(comment + "*USER* : "+user.firstname +" "+user.lastname+
                                                         "\n *Date* : "+utils.InputsUtils.getToday()),
                contentType: 'application/json',
                success: (data) => {
                    console.log('comment added !')
                },
                error: (xhr) => {
                   //console.log('error : ',xhr)
                }
            });
    };
    IssuesService.prototype.generateComment = function (changes,user){
        console.log("generating the comment :"+changes)
        var that=this;
        this.getIssueID('Test Case Update',function (id){
            that.addComment(changes,user,id);
        });
    };
    IssuesService.prototype.getTestCaseChanges = function (oldDoc,newDoc,callback) {
        //console.log(oldDoc.blocksValues);
        var changes = "";
        //console.log(oldDoc == newDoc)
       // oldDoc.headerValues.comment = oldDoc.headerValues.comment;
        //console.log(oldDoc == oldDoc)
        if (oldDoc.headerValues != newDoc.headerValues){
            for (var headerValue in oldDoc.headerValues){
                //console.log(headerValue+" :",oldDoc.headerValues[headerValue])
                if (oldDoc.headerValues[headerValue] != newDoc.headerValues[headerValue]){
                    changes+="*"+headerValue+"* has been changed from : *"+oldDoc.headerValues[headerValue]+"* to : *"+newDoc.headerValues[headerValue]+"* \n";
                }
            }
            //console.log(changes)
            callback("*TestCase* : *"+newDoc.headerValues.name+"* updated : \n"+changes)
        }
    };
    utils.Package.declare('ru.belyiz.services.IssuesService', new IssuesService().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.services, window.ru.belyiz.utils);
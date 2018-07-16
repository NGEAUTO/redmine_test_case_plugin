/** @namespace window.ru.belyiz.services.DatabaseService */
(function (global, Pattern, widgets, services, utils) {
    'use strict';
    Pattern.extend(DatabaseService);
    /**
     * @constructor
     */
    function DatabaseService() {
		this.services = services.TestCasesService;
        this.localSystemDB = null;
        this.localSystemDbName = 'tccSystemDB';
        this.remoteDbSettingsId = '_local/remoteDbSettings';
        this.remoteDbSettingsRev = '';
        this.localDBName = 'testCasesLocal';
        this.localDB = null;
        this.remoteDB = null;
		this.dbPrefix = 'test_plan_'
        this.settingsDocId = 'params';
		this.specificationDocId = "specification_2_spec";
		this.imagesDocId = "images_2_img";
        this.currentDbName = "";
        this.testPlanLinksDb = "links_testplan_project_db";
        this.linksDocumentID = "links";
        this.schema = [
            {singular: 'settings', plural: 'settings'},
            {singular: 'testCases', plural: 'testCases'},
            {singular: 'groups', plural: 'groups', relations: {testCases: {hasMany: 'testCases'}}},
			{singular: 'specification', plural: 'specification'},
			{singular: 'testSetup', plural: 'testSetup'},
			{singular: 'images', plural: 'images'},
			{singular: 'appMatrix', plural: 'appMatrix'},
			{singular: 'testCasesExe', plural: 'testCasesExe'}			
        ];
        this.index = {
            index: {
                fields: ['data.testCasesExe']
            }
        };

        this.urlStarter = 'http://';
        this.remoteDbIp = '158.69.206.223:5984';

        this.login='hamdinge';
        this.password='ngeTOmahawk1992';
        this.remoteDbAuth = this.login+':'+this.password+'@';

        this.remoteDbUrl = this.urlStarter + this.remoteDbIp;
        this.remoteDbUrlAuth = this.urlStarter + this.remoteDbAuth + this.remoteDbIp;
        
        
       
        this.initialized = false;
        this._msgOptimisticLock = 'Someone changed the original data while you were editing. You need to update and save your changes later.';
        this._msgUnparsedError = 'An error occurred while working with the database. Details: <br>';
        this._msgNonDatabaseError = 'There has been errors. Details: <br>';
        this._msgCloseWithoutSelectMsg = 'You cannot just take the window and close it without choosing anything!';
        this._msgRemoteConnectFailed = 'It is not possible to connect to a remote database. The application will use the local version.';
        this._eventHandlers = {};
        this._eventNames = {
            dbChanged: 'dbChanged',
            dbSynchronized: 'dbSynchronized',
        };
    }

    DatabaseService.prototype._init = function () {
    	this.getAllTestPlans();
        this._initDbChoosingDialog();
        this._initDatabases();
    };

    DatabaseService.prototype._initDatabases = function () {
        this.localSystemDB = new PouchDB(this.localSystemDbName);
        //console.log(this.localSystemDB)
        //console.log(this.localSystemDB)
        this.localSystemDB.get(this.remoteDbSettingsId)
            .then((doc) => {
                //console.log(doc)
                this.remoteDbSettingsRev = doc._rev;
                if (doc.name) {
                    //used to identify DB in edit page
                    //console.log(this.currentDbName)
                    if(this.currentDbName != "")
                       doc.name = this.currentDbName;
                    this.localDB = new PouchDB(doc.name, {revs_limit: 10});
                    this.localDB.setSchema(this.schema);
                    this.localDB
                        .createIndex(this.index)
                        .then()
                        .catch(this.processError);

                    const finishInitialization = function () {
                        this.initialized = true;
                        this.trigger(this._eventNames.dbChanged, {local: !!doc.local, name: doc.name});
                    }.bind(this);
                    if (doc.local) {
                        this.getSettings(finishInitialization);
                    } else {
                        this._initSync(doc.name);
                        finishInitialization();
                    }
                } else {
                    this.showDbChoosingDialog();
                }
            })
            .catch((err) => {
                console.log(err)
                if (err.status === 404) {
                    this.showDbChoosingDialog();
                } else {
                    this.processError.call(this, err);
                }
            });
    };

    DatabaseService.prototype._initSync = function (remoteDbName) {
        console.debug(utils.HtmlGenerator.generateDbConnection(this.remoteDbUrlAuth,remoteDbName));
        this.remoteDB = new PouchDB(this.remoteDbUrlAuth + '/' + remoteDbName, {revs_limit: 10});
        this.localDB
            .sync(this.remoteDB, {
                live: true,
                retry: true
            })
            .on('change', () => {
                console.debug('Database changes synchronized.');
                this.trigger(this._eventNames.dbSynchronized);
            })
            .on('paused', () => console.debug('Database sync paused.'))
            .on('active', () => console.debug('Database sync resumed.'))
            .on('error', (err) => console.error('Database sync error. ' + err));
    };

    /**
     * Initializes the database selection dialog
     */
    DatabaseService.prototype._initDbChoosingDialog = function () {
    	//console.log("_initDbChoosingDialog")
        this.dbChoosingModal = new widgets.Modal({
            title: 'This project needs a Test Plan , choose one',
            cancelBtnText: 'Create New Te',
        }).initialize();

        //console.log(global.nodes.body)
        let selectedDbName = '';
        global.nodes.body.on('click', '.js-db-name-item', function (e) {
        	//this.dbChoosingModal.hide();
        	//console.log(global.nodes.body)
        	//console.log(e)
            const $target = $(e.currentTarget);
            selectedDbName = $target.text();
            $('.js-db-name-item').removeClass('active');
            $target.addClass('active');
        }.bind(this));
        //console.log(selectedDbName)
        //this.dbChoosingModal.hide();
        this.dbChoosingModal.on('apply', () => {
            //this.getTestPlan('couchdb');
        	//console.log(selectedDbName)
            if (selectedDbName) {
                this.updateLinksDocument(selectedDbName);
                this.localSystemDB
                    .put({_id: this.remoteDbSettingsId, _rev: this.remoteDbSettingsRev, name: selectedDbName, local: false})
                    .then(() => {
                        this._initDatabases();
                        this.dbChoosingModal.hide();
                    })
                    .catch(this.processError.bind(this));
            } else {
                services.Notification.error(this._msgCloseWithoutSelectMsg)
            }
        });
        this.dbChoosingModal.on('cancel', this.setUsingLocalDB, this);
    };


    DatabaseService.prototype.updateLinksDocument = function (testplan){
        var project_id = utils.InputsUtils.getUrlParameter('project_id')
        var db = new PouchDB(this.remoteDbUrlAuth+'/'+this.testPlanLinksDb);
        db.upsert(this.linksDocumentID, function (doc) {
            var newLink = {
                test_plan : testplan,
                project_id : project_id
            }
            doc.links.push(newLink);
            return doc;
            }).then(function () {
                //console.log('links document was succesfully updated ')
                //console.log('Project : '+project_id)
                //console.log('testplan : '+testplan)
            }).catch(function (err) {
                //console.log(err);
            });
    };
    /**
     * To switch to a local database
     */
    DatabaseService.prototype.setUsingLocalDB = function () {
        this.localSystemDB
            .put({_id: this.remoteDbSettingsId, _rev: this.remoteDbSettingsRev, name: this.localDBName, local: true})
            .then(this._initDatabases.bind(this))
            .catch(this.processError.bind(this));
    };

    /**
     * Shows a modal window with a list of databases on a remote server, with the ability to switch to one or local database
     */
    DatabaseService.prototype.showDbChoosingDialog = function () {
    	//this.getAllTestPlans();
    	console.log("hhhhhh")
        $.ajax({
            url: this.remoteDbUrl + '/_all_dbs',
			beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("hamdinge"+":"+"ngeTOmahawk1992"))},
            dataType: 'json',
            type: 'GET',
            cache: false,
            contentType: 'application/json',
            success: (data) => {
                const $dbsList = $('<div class="list-group"></div>');
                for (let dbName of data) {
                    if (!dbName.startsWith('_')) {
						//console.log(dbName)
						if (dbName.indexOf(this.dbPrefix) == 0 || dbName == 'test_plan_couchdb'){
							var dbListItem = utils.HtmlGenerator.generateDbListItem(dbName);
							$dbsList.append(dbListItem);
						}
                    }
                }
                this.dbChoosingModal.setContentHtml($dbsList[0].outerHTML);
                this.dbChoosingModal.show();
            },
            error: (xhr) => {
                services.Notification.warning(this._msgRemoteConnectFailed);
                this.setUsingLocalDB();
            }
        });

    };

    /**
     * Handling errors that occur while working with a database or Kollbjekah
     * @param err Error information
     */
    DatabaseService.prototype.processError = function (err) {
        if (!err.status) {
            services.Notification.error(this._msgNonDatabaseError + err);
        } else if (err.status === 409) {
            services.Notification.error(this._msgOptimisticLock);
        } else {
            services.Notification.error(this._msgUnparsedError + JSON.stringify(err));
        }
        //console.debug(err);
    };
	
	/**
	*	Creating the Images Document
	*/
	DatabaseService.prototype.createImagesDoc = function(db){
		db.put({	_id : this.imagesDocId})
		.then (function (doc) {
		}).catch( function(err){
			console.log(err);
		});
	};
	
	/**
	*	Creating the Application Matrix Document
	*/
	DatabaseService.prototype.createAppMatrixDoc = function(db){
		db.put({	_id : services.AppMatrixService.appMatrixDocId,
							requirements : []
						})
		.then (function (doc) {
		}).catch( function(err){
			console.log(err);
		});
	}
	
	/**
	*	Creating the Specification Document
	*/
	DatabaseService.prototype.createSpecificationDoc = function(settingsDoc,db){
		db.put({	_id : this.specificationDocId,
							data : {requirements : []},
							settings : settingsDoc})
		.then (function (doc) {
		}).catch( function(err){
			console.log(err);
		});
	};
	
	/**
	*	Creating the necessary Documents if they dont exist
	*/
	DatabaseService.prototype.createDocuments = function (name=''){
		var db = this.localDB;
		if (name != '')
			db = new PouchDB(this.remoteDbUrlAuth+'/'+name)
		var settingsDoc = ''
		settingsDoc = defaultSettings ;
		
		var that=this;
		db.get (this.imagesDocId)
		.then (function (doc) {
		}).catch( function(err){{
			that.createImagesDoc(db);
		}
		});
		db.get (this.specificationDocId)
		.then (function (doc) {
		}).catch( function(err){
			that.createSpecificationDoc(settingsDoc,db);
		});
		db.get (services.AppMatrixService.appMatrixDocId)
		.then (function (doc) {
		}).catch( function(err){
			that.createAppMatrixDoc(db);
		});

	}

    /**
     * Retrieved from the project Setup database, if none-Download the default values from the file
     * @param callback the function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */
    DatabaseService.prototype.getSettings = function (callback, errorCallback) {
		var that=this;
		if (this.remoteDB == null)	this.createDocuments();
        this.getEntity(
            'settings', this.settingsDocId,
            doc => {
					if (doc) {
						typeof callback === 'function' && callback(doc);
					} else {
						this.saveSettings(defaultSettings, callback, errorCallback);
					}
				
				},
				err => {
					if (err.status === 404) {this.saveSettings(defaultSettings, callback, errorCallback);
					} else {
						(typeof errorCallback === 'function' && errorCallback(err)) || this.processError(err);
					}
				}
        );
    };


	/**
    *   Retrieving the database linked to rawfile project
    */
    DatabaseService.prototype.getLinkedTestPlan = function (project_id, callback, errorCallback) {
        var that=this;
        $.ajax({
            url: this.remoteDbUrl + '/'+this.testPlanLinksDb+'/'+this.linksDocumentID,
            beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("hamdinge"+":"+"ngeTOmahawk1992"))},
            dataType: 'json',
            type: 'GET',
            cache: false,
            contentType: 'application/json',
            success: (data) => {
                //console.log("success")
                //console.log("links db found, links doc : ",data.links.length);
                //console.log(data.links[0].project_id,'****',data.links[0]['project_id'],'****',data.links)
                var testplan='';
                for (var i=0;i<data.links.length;i++){
                    //console.log(i,i,i,i)
                    if (data.links[i].project_id != undefined && data.links[i].project_id==project_id){
                        //console.log('link found for project :',data.links[i].project_id,project_id)
                        //if (typeof callback === 'function' && callback)
                            callback(data.links[i].test_plan);
                            testplan=data.links[i].test_plan;
                    }
                    //console.log('hello from the heart of the loop');
                }
                
                if (data.links.length == 0 || (i==data.links.length && testplan=='')){
                    //console.log("no link found in the links doc, value returned : **"+testplan+"**")
                    callback(testplan);
                }
            },
            error: (xhr) => {
                //console.log("error => ")
                this.createTestPlanLinksDb(function(){
                    that.getLinkedTestPlan(project_id,callback,errorCallback);
                });
                //console.log("error no links db      :",xhr);
            }
        });
    };

    /**
    *   Creating the Database used to link Rawfile Projects to a TestPlan
    */
    DatabaseService.prototype.createTestPlanLinksDb = function (callback, errorCallback) {
        var that=this;
        $.ajax({
            url: this.remoteDbUrl + '/'+this.testPlanLinksDb,
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Basic " + btoa("hamdinge"+":"+"ngeTOmahawk1992"))
            },
            dataType: 'application/json',
            type: 'PUT',
            cache: false,
            contentType: 'application/json',
            success: (data) => {
                that.createLinksDocument(function(){
                    callback();
                })
                //console.log("success creating links db :",data);
            },
            error: (xhr) => {
                if (xhr.status == 201)
                    that.createLinksDocument(function(){
                        callback();
                    })
                //console.log("error creating links db :",xhr);
            }
        });  
        
    };


    /**
    *   Creating the Document to hild the links between TestPlan & RawfileProject
    */
    DatabaseService.prototype.createLinksDocument = function (callback){
        var db = new PouchDB(this.remoteDbUrlAuth+'/'+this.testPlanLinksDb);
        db.put({    _id : this.linksDocumentID,
                    links : []
                }).then(function(doc){
                    callback();
                    //console.log('links doc created');
                }).catch(function(err){
                    //console.log('error creating links doc '+err);
                });
    };

	/**
	*	Retrieving the Selected Test Plan's Information
	*/
	DatabaseService.prototype.getTestPlan = function (id, callback, errorCallback) {
        //console.log('****'+id+'****'+this.remoteDbUrl)
		$.ajax({
            url: this.remoteDbUrl + '/'+id+'/'+'images_2_img',
			beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("hamdinge"+":"+"ngeTOmahawk1992"))},
            dataType: 'json',
            type: 'GET',
            cache: false,
            contentType: 'application/json',
            success: (data) => {
				//console.log("success		:",data);
            },
            error: (xhr) => {
				//console.log("error		:",xhr);
            }
        });
	};
	
	/**
	*	Creating/Updating a Test Plan
	*/
	DatabaseService.prototype.saveTestPlan = function (data, callback, errorCallback) {
		data.name = this.dbPrefix+data.name;
		data.id="info_"+data.name;
		//var method = 'POST';
		$.ajax({
            url: this.remoteDbUrl + '/'+data.name,
			beforeSend: function (xhr) {
				xhr.setRequestHeader ("Authorization", "Basic " + btoa("hamdinge"+":"+"ngeTOmahawk1992"))
			},
            dataType: 'application/json',
            type: 'PUT',
            cache: false,
            contentType: 'application/json',
            success: (data) => {
				//console.log("success		:",data);
            },
            error: (xhr) => {
				//console.log("error		:",xhr);
            }
        });
		//this.localDB.name=data.name;
		
		this.createTestPlanDocument(data);
	};
	
    


	/**
	* Creating the Test Plan's information Document
	*/
	DatabaseService.prototype.createTestPlanDocument = function (data){
		//console.log("sossss")
		var db = new PouchDB(this.remoteDbUrlAuth+'/'+data.name);
				db.put({ 	_id : data.id,
							name : data.name,
							description : data.description,
							cdate : data.cdate
						}).then(function(doc){
							//console.log(doc);
						}).catch(function(err){
							//console.log(err);
						});
		this.createDocuments(data.name);
	};
	
	/**
	*	Removing a Test Plan
	*/
	DatabaseService.prototype.removeTestPlan = function (data, callback, errorCallback) {
		$.ajax({
            url: this.remoteDbUrl + '/'+data.name,
			beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("hamdinge"+":"+"ngeTOmahawk1992"))},
            dataType: 'json',
            type: 'DELETE',
            cache: false,
            contentType: 'application/json',
            success: (data) => {
				//console.log("success		:",data);
            },
            error: (xhr) => {
				//console.log("error		:",xhr);
            }
        });
	};
	
	/**
	*	Retrieving all the Test Plans
	*/
	DatabaseService.prototype.getAllTestPlans = function (callback) {
		//console.log("here")
        console.log(this.login,this.password,this.remoteDbUrl,this.remoteDbUrlAuth)
		var params =['Name'];
		$.ajax({
            url: this.remoteDbUrlAuth + '/_all_dbs',
			beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("hamdinge"+":"+"ngeTOmahawk1992"))},
            dataType: 'json',
            type: 'GET',
            cache: false,
            contentType: 'application/json',
            success: (data) => {
            	var dblist =[];
                const $dbsList = $('<div class="list-group"></div>');
                for (let dbName of data) {
                    if (!dbName.startsWith('_')) {
						//console.log(dbName)
						if (dbName.indexOf(this.dbPrefix) == 0 || dbName == 'test_plan_couchdb'){
							dblist.push(dbName);
						}
                    }
                }
                //this.dbChoosingModal.setContentHtml($dbsList[0].outerHTML);
                //this.dbChoosingModal.show();

                var indexTable = utils.HtmlGenerator.generateSimpleDataTable('dblistTable',params,dblist);
                $("#table_index").append($(indexTable));
                if (typeof callback === 'function' && callback)
                    callback(dblist);
            },
            error: (xhr) => {
                //services.Notification.warning(this._msgRemoteConnectFailed);
                this.setUsingLocalDB();
            }
        });
	};
	
	/**
     * Retrieved from the project Setup database, if none-Download the default values from the file
     * @param callback the function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */
	DatabaseService.prototype.getSpecification = function (callback, errorCallback) {
		this.localDB.get(this.specificationDocId)
		.then (function (doc) {
			callback(doc);
		}).catch( function(err){
			console.log(err);
		});
    };
	
	/**
	* synchronizing AppMatrix Document with Specification Document
	*/
	DatabaseService.prototype.updateAppMatrix = function (appMatrixDoc, specificationDoc) {
		var specificationRequirements = [];
		var appMatrixRequirements = [];
		var dataChanged=false;
		for(var i=0;i<specificationDoc.data.requirements.length;i++){
			specificationRequirements.push(specificationDoc.data.requirements[i].name);
		}
		for(var i=0;i<appMatrixDoc.requirements.length;i++){
			appMatrixRequirements.push(appMatrixDoc.requirements[i].requirement);
		}
		/**
		* Empty AppMatrix Document ==>
		*/
		if (appMatrixDoc.requirements.length == 0){
			for (var i=0;i<specificationRequirements.length;i++){
				var appMatrixElement = {
					requirement : specificationRequirements[i],
					note : '',
					applicable : false
				};
				appMatrixDoc.requirements.push(appMatrixElement);
				dataChanged=true;
			}
		}
		/**
		* Specification Document modified ==>
		*/
		else {
				/**
				* checking if one or more elements were deleted from the Specification Document
				*/
				for (var i=0;i<appMatrixRequirements.length;i++){
						if (specificationRequirements.indexOf(appMatrixRequirements[i]) < 0){
							appMatrixDoc.requirements.splice(i,1);
							appMatrixRequirements.splice(i,1);
							i--;
							dataChanged = true;
						}
				}
				/**
				* checking if one or more elements were added to the Specification Document
				*/
				for (var i=0;i<specificationRequirements.length;i++){
						if (appMatrixRequirements.indexOf(specificationRequirements[i]) < 0){
							var appMatrixElement = {
								requirement : specificationRequirements[i],
								note : '',
								applicable : false
							};
							appMatrixDoc.requirements.push(appMatrixElement);
							dataChanged = true;
						}
				}
		}	
		var result = {	
			dataChanged : dataChanged,
			updatedAppMatrixDoc : appMatrixDoc};
		return result;
    };
	
	DatabaseService.prototype.getAppMatrix = function (id, callback, errorCallback) {
		var that=this;
		var result ='';
		this.localDB.get(id)
		.then (function (appMatrixDoc) {
			that.localDB.get(that.specificationDocId)
			.then (function (specificationDoc) {
				result =  that.updateAppMatrix(appMatrixDoc,specificationDoc);
				if (result.dataChanged == true)
					that.saveAppMatrix(appMatrixDoc._id,result.updatedAppMatrixDoc,function (){});
				callback(result.updatedAppMatrixDoc);
			}).catch( function(err){
				console.log(err);
			});			
		}).catch( function(err){
			//console.log(err);
		});
    };
	
	/**
     * Retrieved from the project Setup database, if none-Download the default values from the file
     * @param callback the function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
	 * PS : supposing that in a document there is only ONE attachment
     */
	 DatabaseService.prototype.getAttachments = function (number, data, callback, errorCallback) {
		var results=[];
		var x=1;
		for (var i=0;i<number;i++){
			
			this.localDB.getAttachment(this.imagesDocId, data[''+i].attachmentId)
			.then(function (attachment) {
					blobUtil.blobToBinaryString(attachment).then(function (binaryString) {
						var result = {
							id: x,
							value: binaryString
						};
						results.push(result);
						
						//console.log(result)
						if (x>=number){console.log("done : ",x,number);callback(results);}
						else {console.log("not yet : ",x,number);x++;}
					}).catch(function (err) {
						console.log(err);
					});
			}).catch(function (err) {
				console.log(err);
			});
		}
	};
	 
	 
	DatabaseService.prototype.getAttachment = function (attachmentId, callback, errorCallback) {
		this.localDB.getAttachment(this.imagesDocId, attachmentId)
		.then(function (attachment) {
				blobUtil.blobToBinaryString(attachment).then(function (binaryString) {
					callback(binaryString);
				}).catch(function (err) {
					console.log(err);
				});
		}).catch(function (err) {
			console.log(err);
		});
	};
	
    /**
     * To save new settings to a database
     * @param settings New settings
     * @param callback the function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */
    DatabaseService.prototype.saveSettings = function (settings, callback, errorCallback) {
        settings.id = this.settingsDocId;
        this.saveEntity('settings', settings, callback, errorCallback);
    };

    /**
     * To run a search query
     * @param options Query parameters
     * @param callback the function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */
    DatabaseService.prototype.find = function (options, callback, errorCallback) {
        this.localDB
            .find(options)
            .then(callback)
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

    /**
     * Query Entity data by type and ID.
     * Only the Entity data itself is returned, all child elements of the recline
     * @param type Entity type
     * @param id Entity ID
     * @param callback the function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */
    DatabaseService.prototype.getEntity = function (type, id, callback, errorCallback) {
        this.localDB.rel.find(type, id)
            .then(result => {
                if (result[type] && result[type].length) {
                    typeof callback === 'function' && callback(result[type][0]);
                } else {
                    typeof errorCallback === 'function' && errorCallback({status: 404});
                }
            })
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

    /**
     * Query Entity data by type and ID.
     * The data of the entity itself is returned, as well as the entity data that applies to it.
     * @param type Entity type
     * @param id Entity ID
     * @param callback The function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */
    DatabaseService.prototype.getEntityWithRelations = function (type, id, callback, errorCallback) {
        this.localDB.rel.find(type, id)
            .then(callback)
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

    /**
     * To save an entity to a database 
     * @param type Entity type
     * @param data Entity Data
     * @param callback the function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */

	DatabaseService.prototype.saveSpecification = function (specification, callback, errorCallback){
		var resultDoc = '';
		this.localDB.upsert(this.specificationDocId, function (doc) {
			var index = -1;
			for (var i=0;i<doc.data.requirements.length;i++){
				if(doc.data.requirements[i].name == specification.requirements.name){
					doc.data.requirements[i] = specification.requirements;
					index = i;
					break;
				}
			}
			if (index == -1)	doc.data.requirements.push(specification.requirements);
			resultDoc = doc;
			return doc;
			}).then(function () {
				callback(resultDoc);
			}).catch(function (err) {
				console.log(err);
			});
	};
	
	DatabaseService.prototype.saveAppMatrix = function (id, data, callback, errorCallback){
		var that=this;
		this.localDB.upsert(id, function (doc) {
				doc.requirements=data.requirements;
				that.updateTestCaseExecution(doc);
				return doc;
			}).then(function () {
			}).catch(function (err) {
				console.log(err);
			});
	};
	
	DatabaseService.prototype.executeTestCase = function(testCasesExeId, logfile,file_object, stepsData=[]) {
		var that=this;
		console.log(file_object);
		this.getEntity('testCasesExe', testCasesExeId, function (doc) {
			var testCaseExeDoc = {
				id : doc.id,
				rev : doc.rev,
				headerValues : doc.headerValues,
				file : logfile || 'No logfile attached',
				settings : doc.settings,
				file_object: file_object,
				blocksValues : {
					preconditions : doc.blocksValues.preconditions,
					steps : doc.blocksValues.steps,
					results : stepsData
				}
			};
			var newUpload = true;
			if (doc.logfileId != undefined)
				newUpload=false;
			if (newUpload && testCaseExeDoc.file!='No logfile attached' && testCaseExeDoc.file!=undefined)
				testCaseExeDoc.logfileId = testCaseExeDoc.headerValues.name + '_asc';
			else
				testCaseExeDoc.logfileId = doc.logfileId;
			var i=0;
			//console.log(testCaseExeDoc.blocksValues.results)
			while (testCaseExeDoc.blocksValues.results[''+i] !=undefined){
				if (stepsData[''+i].result == 'Not Tested' && doc.blocksValues.results != undefined && doc.blocksValues.results[''+i].result != 'Not Tested' )
					testCaseExeDoc.blocksValues.results[''+i].result = doc.blocksValues.results[''+i].result;
				testCaseExeDoc.blocksValues.results[''+i].file_object = testCaseExeDoc.blocksValues.results[''+i].file_object;
				if(testCaseExeDoc.blocksValues.results[''+i].screenshot != "");
					testCaseExeDoc.blocksValues.results[''+i].attachmentId=testCaseExeDoc.headerValues.name+'_'+(i+1)+'_image';
					console.log(testCaseExeDoc.blocksValues.results[''+i].attachmentId)
				i++;
			}
			that.saveEntity('testCasesExe',testCaseExeDoc, function(){
				//console.log(testCaseExeDoc);
			});
			console.log(testCaseExeDoc);
			if (testCaseExeDoc.logfileId != undefined)
					utils.InputsUtils.file_to_64String('', testCaseExeDoc, function(type, data , file, value, typeAttach){
						if(newUpload)
							that.addAttachement(testCaseExeDoc.logfileId, value, typeAttach)
					});
					var j=0;
					while (testCaseExeDoc.blocksValues.results[''+j] !=undefined) j++;
					//console.log(testCaseExeDoc.blocksValues.results)
					 console.log(testCaseExeDoc.blocksValues.results);
		for (let key in testCaseExeDoc.blocksValues.results){
					//var result = testCaseExeDoc.blocksValues.results[''+x] ;
					console.log(testCaseExeDoc.blocksValues.results[key]);
					var result = testCaseExeDoc.blocksValues.results[key];
					if (result.screenshot !="" && result.file_object != undefined){
							if (result.attachmentId != undefined){
								  utils.InputsUtils.file_to_64String('', result,   function(type, data , file, value, typeAttach){
									 let newId = data.attachmentId;
									
									 that.addAttachement(newId,value,typeAttach);
									
								});
							}
					}
				}
				
		});	
	};
	
	
	
	DatabaseService.prototype.removeAttachment = function (attachmentId,callback){
		var that=this;
		this.localDB.get(this.imagesDocId)
		.then(function (doc) {
			that.localDB.removeAttachment(that.imagesDocId,attachmentId,doc._rev)
			.then( function (){
				callback();
			}).catch(function (err) {
				callback()
				console.log('remove',err);
			});
		}).catch(function (err){
			console.log(err);
		});
	};
	
	DatabaseService.prototype.addAttachement = function (attachmentId,value,typeAttach){
		return new Promise(resolve => {
			
	    const id = attachmentId;
		const val = value;
		const type = typeAttach;
		var that=this;
		resolve (this.localDB.get(this.imagesDocId)
		.then(function (doc) {
			  that.localDB.putAttachment(that.imagesDocId,attachmentId,doc._rev, value, typeAttach)
			.then( function (){
				console.log("main",attachmentId);
				console.log("rev is  ",doc._rev); 
				
			}).catch(function (err) {
				console.log("DatabaseService error: ", err);
				that.addAttachement(id,val,type)
				console.log("rev is  ",doc._rev); 
				console.log("-----------------------------------------------------"+id);
			});
		}).catch(function (err){
			console.log(err);
		}));
		
		});
		
	};
	
	DatabaseService.prototype.updateTestCaseExecution = function (appMatrixDoc) {
		var that=this;
		var testCaseTemplateNames=[];
		var testCaseExeNames=[];
		var appMatrixApplicableRequirements=[];
		var applicableTestCaseTemplateNames=[];
		services.TestCasesService.all('', function (testCaseDocs){
			services.TestCasesExeService.all('', function (testCaseExeDocs){
				for (var i=0;i<appMatrixDoc.requirements.length;i++)
					if (appMatrixDoc.requirements[i].applicable == true)
						appMatrixApplicableRequirements.push(appMatrixDoc.requirements[i].requirement);
				for (var i=0;i<testCaseExeDocs.length;i++)
					testCaseExeNames.push(testCaseExeDocs[i].headerValues.name);
				for (var i=0;i<testCaseDocs.length;i++)
					testCaseTemplateNames.push(testCaseDocs[i].headerValues.name);
				for (var i=0;i<testCaseDocs.length;i++)
					if (appMatrixApplicableRequirements.indexOf(testCaseDocs[i].headerValues.requirement)>-1)
						applicableTestCaseTemplateNames.push(testCaseDocs[i].headerValues.name);
				
				/**
				* 	Checking if a test case template was deleted and the test case execution is still stored
				*/
				/*for (var i=0;i<testCaseExeDocs.length;i++)
					if (testCaseTemplateNames.indexOf(testCaseExeNames[i]) < 0)
							that.removeEntity('testCasesExe',testCaseExeDocs[i], function (){
								console.log(i + '- Test Case Execution Document Deleted');
							});*/
				
				/**
				* 	Checking if a test case template was modified
				*/
				for (var i=0;i<testCaseExeDocs.length;i++){
					for (var j=0;j<testCaseDocs.length;j++){
						var breaking = false;
						if (testCaseExeDocs[i].headerValues.name==testCaseDocs[j].headerValues.name){
							if ((testCaseExeDocs[i].headerValues.description) != (testCaseDocs[j].headerValues.description) 
								|| (testCaseExeDocs[i].headerValues.testSetup) != (testCaseDocs[j].headerValues.testSetup)
								|| (testCaseExeDocs[i].blocksValues.toString) != (testCaseDocs[j].blocksValues.toString)){
								testCaseExeDocs[i].headerValues = testCaseDocs[j].headerValues;
								testCaseExeDocs[i].blocksValues = testCaseDocs[j].blocksValues;
								that.saveEntity('testCasesExe',testCaseExeDocs[i],function (doc){
									that.updateTestCaseExecution(appMatrixDoc);
								});
								breaking = true;
							}
						}
						if (breaking) break;
					}
				}
				/**
				* 	Checking if a Requirement is no longer applicable and the Test Case Execution Document is created
				*/
				for (var i=0;i<testCaseExeDocs.length;i++)
					if (applicableTestCaseTemplateNames.indexOf(testCaseExeNames[i]) < 0)
							that.removeEntity('testCasesExe',testCaseExeDocs[i], function (){
								that.updateTestCaseExecution(appMatrixDoc);
							});
				/**
				*	Creating Test Case Execution Documents
				*/
				for (var i=0;i<testCaseDocs.length;i++){
					/**
					* Checking if a test case template is created for this requirement
					*/
					if (appMatrixApplicableRequirements.indexOf(testCaseDocs[i].headerValues.requirement) > -1){
						/**
						*	Checking of a Test Case Execution Document is already created with this  Test Case Template
						*/
						if (testCaseExeNames.indexOf(testCaseDocs[i].headerValues.name) < 0){
						/**
						*	Create Test Case Execution Document
						*/
							var testCaseExeEntity = {
								settings: testCaseDocs[i].settings,
								headerValues: testCaseDocs[i].headerValues,
								blocksValues: testCaseDocs[i].blocksValues
							};
							that.saveEntity('testCasesExe',testCaseExeEntity, function (doc){
								that.updateTestCaseExecution(appMatrixDoc);
							});
						}
					}
				}
			});
		});
    };
	
    DatabaseService.prototype.saveEntity = function (type, data, callback, errorCallback) {
        if (!data.id) {
            delete data.id;
            delete data.rev;
            delete data.hash;
            data.hash = this._generateHash(data);
            data.id = $.now();
        }
        this.localDB.rel.save(type, data)
            .then((result) => typeof callback === 'function' && callback(result[type].length ? result[type][0] : {}))
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };
	
	 /**
     * To save an entity to a database 
     * @param type Entity type
     * @param data Entity Data
     * @param callback the function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */
	DatabaseService.prototype.saveTestSetup = function (type, data, callback, errorCallback) {
		var that = this;
		this.saveEntity(type, data, onSuccess, errorCallback);
		function onSuccess (data){
			if (data.file=='') data.file = data.current;
			utils.InputsUtils.file_to_64String(type, data, function(type, data , file, value, typeAttach){
				/**
				* calling getEntity to execute the callback function
				*/
				that.getEntity(type, data.id,callback, errorCallback);
				that.localDB.get(that.imagesDocId)
				.then(function (doc) {
					that.localDB.putAttachment(that.imagesDocId, data.attachmentId,doc._rev, value, typeAttach)
					.then( function (){
					}).catch(function (err) {
						console.log(err);
					});
				}).catch(function (err){
					console.log(err);
				});
			});
		}
    };

    /**
     * To remove an entity from a database
     * @param type Entity type
     * @param data The Entity data. The object must contain ID and Rev parameters!
     * @param callback The function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */
    DatabaseService.prototype.removeEntity = function (type, data, callback, errorCallback) {
        this.localDB.rel.del(type, data)
            .then(() => typeof callback === 'function' && callback())
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

    /**
     * Querying all entities of the same type
     * @param type Entity type
     * @param callback the function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */
    DatabaseService.prototype.allDocs = function (type, callback, errorCallback) {
        this.localDB.rel
            .find(type)
            .then(result => callback(result[type]))
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

	/**
     * Querying all entities of the same type
     * @param type Entity type
     * @param callback the function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */
    DatabaseService.prototype.getTestCaseExeRelatedDocs = function (relatedDocsType, callback, errorCallback) {
        var relatedDocs = [];
			services.TestCasesService.all('', function (testCasesDocs){
				services.AppMatrixService.all('',function (appMatrixDocs){
				relatedDocs.testCases=testCasesDocs;
				relatedDocs.appMatrix=appMatrixDocs;
				callback(relatedDocs);
				});
			});		
    };
	
    /**
     * Querying entities of the same type by the list of identifiers
     * @param type Entity type
     * @param ids List of identifiers
     * @param callback the function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */
    DatabaseService.prototype.someDocs = function (type, ids, callback, errorCallback) {
        this.localDB.rel
            .find(type, ids)
            .then(result => callback(result[type]))
            .catch((typeof errorCallback === 'function' && errorCallback) || this.processError.bind(this));
    };

    /**
     * Gets the number ID of the entity by complex (from relational-pouch)
     * @param ID Complex Entity ID
     */
    DatabaseService.prototype.parseId = function (id) {
        return this.localDB.rel.parseDocID(id).id;
    };

    /**
     * Gets the entity type by complex ID (from relational-pouch)
     * @param ID Complex Entity ID
     */
    DatabaseService.prototype.parseType = function (id) {
        return this.localDB.rel.parseDocID(id).type;
    };

    /**
     * Gets the complex entity identifier by type (from relational-pouch)
     * @param type Entity type
     * @param id Complex Entity ID
     */
    DatabaseService.prototype.buildRelId = function (type, id) {
        return this.localDB.rel.makeDocID({type: type, id: id});
    };

    /**
     * @returns {boolean} Is the service ready to use
     */
    DatabaseService.prototype.isInitialized = function () {
        return this.initialized;
    };

    DatabaseService.prototype._generateHash = function (data) {
        const string = '' + JSON.stringify(data);
        let hash = 0, i, chr, len;
        if (string.length !== 0) {
            for (i = 0, len = string.length; i < len; i++) {
                chr = string.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
        }
        return hash;
    };
	
    /**
	* Returns to the callback function a document containing all the specification properties with just the requirement selected
	*/
	DatabaseService.prototype.getRequirement = function (id, callback, errorCallback) {
		this.localDB.get(this.specificationDocId)
		.then (function (doc) {
			for (var i =0;i<doc.data.requirements.length;i++){
				if (doc.data.requirements[i].name !== id) 	{
					doc.data.requirements.splice(i, 1);
					i--;
				}
			}
			doc.data.requirements = doc.data.requirements[0];
			callback(doc);
		}).catch( function(err){
			console.log(err);
		});
    };
	
	/**
	* getting the images Document
	*/
	DatabaseService.prototype.getImagesDocument = function (callback, errorCallback) {			
		this.localDB.get(this.imagesDocId)
		.then (function (doc) {
			callback(doc);
		}).catch( function(err){
			console.log(err);
		});
    };
	
	/**
     * To remove an element (Requirement) from the specification Document
     * @param type Entity type
     * @param data The Entity data. The object must contain ID and Rev parameters!
     * @param callback The function to perform when the settings are successfully initialized
     * @param errorCallback function to perform in the event of an error
     */
    DatabaseService.prototype.removeRequirement = function (type, data, callback, errorCallback) {
        this.localDB.upsert(this.specificationDocId, function (doc) {
			for (var i=0;i<doc.data.requirements.length;i++){
				if(doc.data.requirements[i].name == data.requirements.name){
					doc.data.requirements.splice(i,1);
					break;
				}
			}			
			return doc;
			}).then((doc) => typeof callback === 'function' && callback(doc)
			).catch(function (err) {
				console.log(err);
				errorCallback
			});
    };
	

	

	utils.Package.declare('ru.belyiz.services.DatabaseService', new DatabaseService().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.widgets, window.ru.belyiz.services, window.ru.belyiz.utils);
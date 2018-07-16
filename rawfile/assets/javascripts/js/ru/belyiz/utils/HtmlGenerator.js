/** @namespace window.ru.belyiz.utils.HtmlGenerator */

(function (global, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.utils.HtmlGenerator', new HtmlGenerator());

    /**
     * This class collects HTML functions from the configuration and data of test case, groups, and other entities.
     * Functions should not spicifichnymi to specific locations in the interface, but should be as common and reused as possible.
     * A specific HTML is best generated where it will be applied.
     * @constructor
     */
    function HtmlGenerator() {
		this.resultValues = ['Not Tested','Not Testable','Not Applicable','Not OK','OK'];
		this.resultColors = ['darkorange','yellow','violet','red','limegreen']
		this.selectValues = ['No','Yes'];
		this.responsibility = ['NGE-Tunisia','NGE-China'];
    }
	
	HtmlGenerator.prototype.generateTestCaseExeGrid = function (templateInfo, leftColumn, rightColumn){
		/*var testCaseExeGrid = `<div class="row-fluid" ><div class="col-lg-12" >${templateInfo}`;
		testCaseExeGrid += `<div class="row"><div class="col-sm-6 col-md-6 col-lg-6">${leftColumn}</div>`;
		testCaseExeGrid += `<div class="col-sm-6 col-md-6 col-lg-6">${rightColumn}</div></div></div>`;*/
		var testCaseExeGrid = ``+templateInfo+leftColumn+rightColumn;
		return testCaseExeGrid;
	}
	
	/**
	*	Generating a simple Datatable using the params :
	*	id : the id used to identify the generated Datatable
	*	params : the header used to build the columns of the Datatable
	*	data : the data to display in the rows of the generated Datatable (array of objects)
	*/
	HtmlGenerator.prototype.generateSimpleDataTable = function (id, params, data, className="display"){
		//console.log(id,params,data)
		var dataTableHtml = `<table id="${id}" class="list groups"><thead><tr>`;
		for (var i=0;i<params.length;i++)
			dataTableHtml += `<th>${params[i]}</th>`;
		dataTableHtml += `<th>Action</th>`;
		dataTableHtml += `</tr></thead><tbody>`;
		for (var i=0;i<data.length;i++){
			dataTableHtml += `<tr class="box tabular">`;
				dataTableHtml += `<td>${data[i]}</td>`;
				dataTableHtml += `<td><a href="/issue_templates_notes/1/edit?tp=${data[i]}">edit</a> | <a href="delete">delete</a></td>`;
			dataTableHtml +=`</tr>`;
		}
		
		/*<td>
		  <%= link_to l(:lbl_edit_template_note), :controller => "issue_templates_notes", :action => "edit", :id => template_note %>
		  |
		  	<%= link_to l(:lbl_delete_template_note), template_note, method: :delete, data: { confirm: l(:msg_confirm_deletion)}%>
		</td>*/

		/*for (var i=0;i<data.length;i++){
			dataTableHtml += `<tr class="box tabular">`;
			for (let param of params)
				dataTableHtml += `<td>${data[i]}</td>`;
			dataTableHtml +=`</tr>`;
		}*/
		dataTableHtml += `</tbody></table>`;

		/*var dataTableHtml = `<table id="${id}" class="${className}"><thead><tr>`
		for(var i=0;i<head.length;i++)
			dataTableHtml +=`<th>${params[i]}</th>`;
		dataTableHtml +=`</tr></thead><tbody>`;
		for (var i=0;i<data.length;i++){
			dataTableHtml +=`<tr>`;
			for(let param of params)
				dataTableHtml +=`<td>${data[i][param]}</td>`;
			dataTableHtml +=`</tr>`;
		}
		dataTableHtml +=`</tbody></table>`;*/

		return dataTableHtml;
	};
	
	/**
	*	Generating a simple Datatable using the params :
	*	id : the id used to identify the generated Datatable
	*	params : the header used to build the columns of the Datatable
	*	data : the data to display in the rows of the generated Datatable (array of objects)
	*/
	HtmlGenerator.prototype.generateImagesDataTable = function (id, params, data, img){
		var dataTableHtml = `<table id="${id}" class="display"><thead><tr>`
		for(var i=0;i<head.length;i++)
			dataTableHtml +=`<th>${params[i]}</th>`;
		dataTableHtml +=`</tr></thead><tbody>`;
		for (var i=0;i<data.length;i++){
			dataTableHtml +=`<tr>`;
			for(let param of params)
				dataTableHtml +=`<td>${data[i][param]}</td>`;
			dataTableHtml +=`</tr>`;
		}
		dataTableHtml +=`</tbody></table>`;
		return dataTableHtml;
	};
	
	/**
	*	Generating a simple Datatable using the params :
	*	id : the id used to identify the generated Datatable
	*	params : the header used to build the columns of the Datatable
	*	data : the data to display in the rows of the generated Datatable (array of objects)
	*/
	HtmlGenerator.prototype.generateLinksDataTable = function (id, params, data, img){
		var dataTableHtml = `<table id="${id}" class="display"><thead><tr>`
		for(var i=0;i<head.length;i++)
			dataTableHtml +=`<th>${params[i]}</th>`;
		dataTableHtml +=`</tr></thead><tbody>`;
		for (var i=0;i<data.length;i++){
			dataTableHtml +=`<tr>`;
			for(let param of params)
				dataTableHtml +=`<td>${data[i][param]}</td>`;
			dataTableHtml +=`</tr>`;
		}
		dataTableHtml +=`</tbody></table>`;
		return dataTableHtml;
	};
	
	
	/**
	*	Generating Application Matrix Datatable using : head and values parameters.
	*	generating checkbox cell to check the applicable requirements.
	*/
	HtmlGenerator.prototype.generateAppMatrixDataTable = function (head, values){
		var dataTableHtml =`<table id="appMatrixTable" class="display" width="100%"><thead><tr>`;
		for(var i=0;i<head.length;i++)
			dataTableHtml +=`<th>${head[i].name}</th>`;
		dataTableHtml +=`</tr></thead><tbody>`;
		for(var i=0;i<values.length;i++){
			dataTableHtml +=`<tr>`;
			var j=0;
			for(let param of head){
				if (head[j].code=='applicable'){
					if (values[i].applicable == true)
						dataTableHtml +=`<td><input id="applicable-${values[i].requirement}" type="checkbox" class="form-control" checked/></td>`;
					else
						dataTableHtml +=`<td><input id="applicable-${values[i].requirement}" type="checkbox" class="form-control"/></td>`;
				}
				else if (head[j].code=='note'){
						if (values[i].note ==''){
							if (values[i].applicable == true)
								dataTableHtml +=`<td><input id="note-${values[i].requirement}" type="text" placeholder="applicable requirement" disabled/></td>`;
							else
								dataTableHtml +=`<td><input id="note-${values[i].requirement}" type="text" placeholder="type your note"/></td>`;
						}else{
							if (values[i].applicable == true)
								dataTableHtml +=`<td><input id="note-${values[i].requirement}" type="text" placeholder="applicable requirement" disabled/></td>`;
							else
								dataTableHtml +=`<td><input id="note-${values[i].requirement}" type="text" value ="${values[i].note}"/></td>`;
						}
				}
				else
				dataTableHtml +=`<td>${values[i][head[j].code]}</td>`;
				j++;
			}		
			dataTableHtml +=`</tr>`;
		}		
		dataTableHtml +=`</tbody></table>`;
		return dataTableHtml;
	};
	
	
	/**
	*	Generating Sumup Datatable using : head and values parameters.
	*	generating a cell containing a button ("Details") allowing to determine which Test Case is clicked
	*/
	HtmlGenerator.prototype.generateSumupDataTable = function (head, values){
		var dataTableHtml =`<table id="sumupTable" class="display" width="100%"><thead><tr>`;
		for(var i=0;i<head.length;i++)
			dataTableHtml +=`<th>${head[i].name}</th>`;
		dataTableHtml +=`</tr></thead><tbody>`;
		for(var i=0;i<values.length;i++){
			dataTableHtml +=`<tr>`;
			var j=0;
			for(let param of head){
				if (head[j].code=='details')
					dataTableHtml +=`<td id="details-button" data-id="${values[i].details}"	data-name="${values[i].name}">
										<button class="btn btn-primary btn-md" width="100%">
										<i class="fa fa-list"></i>
											Details
										</button>
									</td>`;
				else if (head[j].code=='result'){
					var resultColor = this.resultColors[this.resultValues.indexOf(values[i][head[j].code])];
					dataTableHtml +=`<td style="background-color : ${resultColor}; font-weight:bold;">${values[i][head[j].code]}</td>`;
				}else
					dataTableHtml +=`<td>${values[i][head[j].code]}</td>`;
				j++;
			}
			dataTableHtml +=`</tr>`;
		}
		dataTableHtml +=`</tbody></table>`;
		return dataTableHtml;
	};
	
	/**
	/* widgets.SettingsModal.js : 18 
	/* generating a Modal when trying to Customize 
	*/
	HtmlGenerator.prototype.generateModalFace = function () {
		return (`
				<div class="modal fade" tabindex="-1" role="dialog">
					<div class="modal-dialog  modal-lg" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<button type="button" class="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
								<h4 class="modal-title">Editing table settings</h4>
							</div>
							<div class="modal-body">
								<div class="alert alert-warning" role="alert">
									<strong>Attention!</strong> After you save, all the data you have entered on the page will be deleted.<br>
									Settings apply only to new test case. All saved to the database will retain its structure.
								</div>
								<div class="alert alert-info" role="alert">
									The rows specified in the table banner are displayed in the test case list. Leave at least one field.
								</div>
								<div class="alert alert-info" role="alert">
									Correctness checks Json'a not yet. Write Right. 
								</div>
								<textarea class="form-control js-settings"></textarea>
							</div>
							<div class="modal-footer">
								<div class="btn btn-outline-danger" data-dismiss="modal">Cancel</div>
								<div class="btn btn-success js-save-btn">Save</div>
							</div>
						</div>
					</div>
				</div>
				`);
	};
	
	/**
	/* pages.Testing.js : 179 
	/* generating the side bar (test case & group) when Testing
	*/
	HtmlGenerator.prototype.generateSideBar = function (defaultType) {
		return (`
            <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item">
                    <a class="nav-link js-testing-sidebar-tab ${defaultType === 'tests' ? 'active' : ''}" href="javascript:;"
                       data-target=".js-testing-sidebar-pane[data-entity-type='tests']" data-toggle="tab" role="tab" 
                       data-entity-type="tests">Test Cases</a>
                </li>
                <!-- <li class="nav-item">
                    <a class="nav-link js-testing-sidebar-tab ${defaultType === 'groups' ? 'active' : ''}" href="javascript:;"
                       data-target=".js-testing-sidebar-pane[data-entity-type='groups']" data-toggle="tab" role="tab" 
                       data-entity-type="groups">Group</a>
                </li>-->
            </ul>
            <div class="tab-content">
                <div class="tab-pane js-testing-sidebar-pane fade ${defaultType === 'tests' ? 'show active' : ''}" 
                    id="testing--type-tests" role="tabpanel" data-entity-type="tests"></div>
                <div class="tab-pane js-testing-sidebar-pane fade ${defaultType === 'groups' ? 'show active' : ''}"
                    id="testing--type-groups" role="tabpanel" data-entity-type="groups"></div>
            </div>
        `);
	};
	
	/**
	/* patterns.AbstractEntityInfoPages.js : 74/75/76
	/* generating Create/Save/Remove Buttons.
	*/
	HtmlGenerator.prototype.generatePageCodeButton = function (pageCode,action) {
		return (`[data-page-code="${pageCode}"] .js-${action}-button`);
	};
		
	/**
	/* services.DatabaseService.js : 72 
	/* generating Html when connection to a remote database
	*/
	HtmlGenerator.prototype.generateDbConnection = function (url,name) {
		return (`Connecting to remote DB [${url + '/' + name}]`);
	};

	/**
	/* services.DatabaseService.js : 25
	/* generating the template attribute of the notification
	*/
	HtmlGenerator.prototype.generateNotificationTemplate = function () {
		return ('\
                <div data-notify="container" class="col-xs-11 col-sm-4 alert alert-{0}" role="alert">\
                    <button type="button" class="close p-0 " data-dismiss="alert" aria-label="Close">\
                        <span aria-hidden="true">&times;</span>\
                    </button>\
                    <span data-notify="icon"></span>\
                    <span data-notify="title">{1}</span>\
                    <span data-notify="message" class="d-block pr-4">{2}</span>\
                    <div class="progress" data-notify="progressbar">\
                        <div class="progress-bar progress-bar-{0}" role="progressbar" \
                             aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0;"></div>\
                    </div>\
                    <a href="{3}" target="{4}" data-notify="url"></a>\
                </div>');
	};
	
	/**
	/* services.DatabaseService.js : 168 
	/* generating an item of the database list
	*/
	HtmlGenerator.prototype.generateDbListItem = function (DbName) {
		return (`<div class="list-group-item list-group-item-action js-db-name-item" role="button">${DbName}</div>`);
	};
	
	/**
	/* services.UndoService.js : 77
	/* generating a message givivng the option to cancel an action
	*/
	HtmlGenerator.prototype.generateUndoLink = function (id,rev,message) {
		return (`
            <br/>
            <a href="javascript:;" class="js-undo-alert" data-id="${id}" data-rev="${rev}">
                <i class="fa fa-undo"></i>
                ${message}
            </a>
        `);
	};
	
	/**
	/* utils.TableToFileConverter.js : 10 
	/* generating an link allowing to download
	*/
	HtmlGenerator.prototype.generateDownloadLink = function () {
		return ('<a id="downloadLink" style="display:none;"></a>');
	};
	
	/**
	/* utils.TableToFileConverter.js : 17 
	/* generating a microsoft office word document
	*/
	HtmlGenerator.prototype.generateWordDocument = function () {
		return (`
                <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                      xmlns:w="urn:schemas-microsoft-com:office:word"
                      xmlns="http://www.w3.org/TR/REC-html40">
                    <head>
                        <!--[if gte mso 9]>
                            <xml>
                                <w:WordDocument>
                                </w:WordDocument>
                            </xml>
                        <![endif]-->
                    </head>
                    <body>
                        <table border="1" cellpadding="5"
                               style='border-collapse:collapse; border:none; mso-border-alt:solid windowtext .5pt;'>
                           {table}
                        </table>
                    </body>
                </html>
            `);
	};
	
	/**
	/* utils.TableToFileConverter.js : 22
	/* generating a microsoft office excel document
	*/
	HtmlGenerator.prototype.generateExcelDocument = function () {
		return (`
                <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                      xmlns:x="urn:schemas-microsoft-com:office:excel"
                      xmlns="http://www.w3.org/TR/REC-html40">
                    <head>
                        <!--[if gte mso 9]>
                            <xml>
                                <x:ExcelWorkbook>
                                    <x:ExcelWorksheets>
                                        <x:ExcelWorksheet>
                                            <x:WorksheetOptions>
                                                <x:DisplayGridlines/>
                                            </x:WorksheetOptions>
                                        </x:ExcelWorksheet>
                                    </x:ExcelWorksheets>
                                </x:ExcelWorkbook>
                            </xml>
                        <![endif]-->
                    </head>
                    <body>
                        <table>{table}</table>
                    </body>
                </html>
            `);
	};
	
	/**
	/* generating a test setup list to select from
	*/
	HtmlGenerator.prototype.generateRequirementsSelectHtml = function (mergeConflict,rowParam,localValue, requirements) {
		var html=`<div class="form-group row ${mergeConflict ? 'has-warning' : ''}">
                        <label class="col-sm-2 col-form-label text-right form-control-label" 
                               for="headerRow-${rowParam.code}">${rowParam.name}:</label>
                        <div class="col-sm-10">
						<select id="headerRow-${rowParam.code}" data-cell-code="${rowParam.code}" class="form-control ${mergeConflict ? 'form-control-warning' : ''}" selected="${localValue}" >
						<option value="default" selected disabled hidden>choose a Requirement</option>`;				
		for (var i =0;i<requirements.length;i++){
			if (localValue == requirements[i].name)
				html += `<option value="${requirements[i].name}" selected>${requirements[i].name}</option>`;
			else
				html += `<option value="${requirements[i].name}">${requirements[i].name}</option>`;
		}
		html+= `
				</select>
		 <div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
                        </div>
                    </div>`;                        
		return (html);
	};
	
	/**
	/* generating a test setup list to select from
	*/
	HtmlGenerator.prototype.generateHiddenRowHtml = function (row) {
		var html=`<div id="hiddenRows" style="display: none;">`;
		html += row + `</div>`;
		return (html);
	};
	
	/**
	/* generating a test setup list to select from
	*/
	HtmlGenerator.prototype.generateTestSetupHtmlRow = function (mergeConflict,rowParam,localValue,relatedDocs) {
		var html=`<div class="form-group row ${mergeConflict ? 'has-warning' : ''}">
                        <label class="col-sm-2 col-form-label text-right form-control-label" 
                               for="headerRow-${rowParam.code}">${rowParam.name}:</label>
                        <div class="col-sm-10">
						<select id="headerRow-${rowParam.code}" data-cell-code="${rowParam.code}" class="form-control ${mergeConflict ? 'form-control-warning' : ''}" selected="${localValue}" >
						<option value="default" selected disabled hidden>choose a Test Setup</option>`;			
		for (var i =0;i<relatedDocs.length;i++){
			if (localValue == relatedDocs[i].name)
				html += `<option value="${relatedDocs[i].name}" selected>${relatedDocs[i].name}</option>`;
			else
				html += `<option value="${relatedDocs[i].name}">${relatedDocs[i].name}</option>`;
		}
		html+= `
				</select>
		 <div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
                        </div>
                    </div>`;
		return (html);
	};
	
	HtmlGenerator.prototype.generateResultRow = function (mergeConflict, rowParam, localValue){
		var html = ``;
		html+= `<div class="form-group row ${mergeConflict ? 'has-warning' : ''}">
                        <label class="col-sm-2 col-form-label text-right form-control-label" 
                               for="headerRow-${rowParam.code}">${rowParam.name}:</label>
                        <div class="col-sm-10">
							<select id="headerRow-${rowParam.code}" data-cell-code="${rowParam.code}" class="form-control ${mergeConflict ? 'form-control-warning' : ''}" selected="${localValue}" >
								<option value="${this.resultValues[0]}" selected>${this.resultValues[0]}</option>`
		for (var i =1;i<this.resultValues.length;i++){
			if (localValue == this.resultValues[i])
				html += 	`<option value="${this.resultValues[i]}" selected>${this.resultValues[i]}</option>`;
			else
				html += 	`<option value="${this.resultValues[i]}">${this.resultValues[i]}</option>`;
			}
			html+=			`</select>
							<div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
                        </div>
                    </div>`;
			return html;
		
	};
	
	HtmlGenerator.prototype.generateSelectRow = function (mergeConflict, rowParam, localValue){
		var html = ``;
		html+= `<div class="form-group row ${mergeConflict ? 'has-warning' : ''}">
                        <label class="col-sm-2 col-form-label text-right form-control-label" 
                               for="headerRow-${rowParam.code}">${rowParam.name}:</label>
                        <div class="col-sm-10">
							<select id="headerRow-${rowParam.code}" data-cell-code="${rowParam.code}" class="form-control ${mergeConflict ? 'form-control-warning' : ''}" selected="${localValue}" >
								<option value="${this.selectValues[0]}" selected>${this.selectValues[0]}</option>`
		for (var i =1;i<this.selectValues.length;i++){
			if (localValue == this.selectValues[i])
				html += 	`<option value="${this.selectValues[i]}" selected>${this.selectValues[i]}</option>`;
			else
				html += 	`<option value="${this.selectValues[i]}">${this.selectValues[i]}</option>`;
			}
			html+=			`</select>
							<div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
                        </div>
                    </div>`;
			return html;
		
	};
	
	HtmlGenerator.prototype.generateResSelectRow = function (mergeConflict, rowParam, localValue){
		var html = ``;
		html+= `<div class="form-group row ${mergeConflict ? 'has-warning' : ''}">
                        <label class="col-sm-2 col-form-label text-right form-control-label" 
                               for="headerRow-${rowParam.code}">${rowParam.name}:</label>
                        <div class="col-sm-10">
							<select id="headerRow-${rowParam.code}" data-cell-code="${rowParam.code}" class="form-control ${mergeConflict ? 'form-control-warning' : ''}" selected="${localValue}" >
								<option value="${this.responsibility[0]}" selected>${this.responsibility[0]}</option>`
		for (var i =1;i<this.responsibility.length;i++){
			if (localValue == this.responsibility[i])
				html += 	`<option value="${this.responsibility[i]}" selected>${this.responsibility[i]}</option>`;
			else
				html += 	`<option value="${this.responsibility[i]}">${this.responsibility[i]}</option>`;
			}
			html+=			`</select>
							<div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
                        </div>
                    </div>`;
			return html;
		
	};
	/**
	/* widgets.GroupInfo.js : 119 ---- widgets.TestCaseInfo.js : 175
	/* generating a row
	*/
	HtmlGenerator.prototype.generateHtmlRow = function (mergeConflict,rowParam,localValue,disabled=false) {
		var html = ``;
		if (rowParam.code == "result")
			html+= this.generateResultRow(mergeConflict,rowParam,localValue);
		else if (rowParam.code == "customInput" || rowParam.code == "internalComment" || rowParam.code == "reqTcVersion" || rowParam.code == "crossReviewJustify")
			html+= this.generateSelectRow(mergeConflict, rowParam, localValue);
		else if (rowParam.code == "responsibility")
			html+= this.generateResSelectRow(mergeConflict, rowParam, localValue);
		else{
			if (disabled)
				html += (`
                    <div class="form-group row ${mergeConflict ? 'has-warning' : ''}">
                        <label class="col-sm-2 col-form-label text-right form-control-label" 
                               for="headerRow-${rowParam.code}">${rowParam.name}:</label>
                        <div class="col-sm-10">
                            <input type="text" id="headerRow-${rowParam.code}" data-cell-code="${rowParam.code}"
                                   class="form-control ${mergeConflict ? 'form-control-warning' : ''}" 
                                   value="${localValue}" disabled/>
                            <div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
                        </div>
                    </div>
                `);
			else
				html+= (`
                    <div class="form-group row ${mergeConflict ? 'has-warning' : ''}">
                        <label class="col-sm-2 col-form-label text-right form-control-label" 
                               for="headerRow-${rowParam.code}">${rowParam.name}:</label>
                        <div class="col-sm-10">
                            <input type="text" id="headerRow-${rowParam.code}" data-cell-code="${rowParam.code}"
                                   class="form-control ${mergeConflict ? 'form-control-warning' : ''}" 
                                   value="${localValue}"/>
                            <div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
                        </div>
                    </div>
                `);
		}
		return html;
	};
	
	/**
	/* widgets.GroupInfo.js : 123
	/* generating a group of header rows
	*/
	HtmlGenerator.prototype.generateGroupHeaderRows = function (rowsHtml) {
		return (`<div id="groupHeaderRows">${rowsHtml}</div>`);
	};
	
	HtmlGenerator.prototype.generateTestPlanHeaderRows = function (rowsHtml) {
		return (`<div id="testPlanHeaderRows">${rowsHtml}</div>`);
	};
	
	/**
	/* widgets.TestSetupInfo.js : 123
	/* generating a group of header
	*/
	HtmlGenerator.prototype.generateTestSetupHeaderRows = function (rowsHtml) {
		return (`<div id="testSetupHeaderRows">${rowsHtml}</div>`);
	};
	
	/**
	/* widgets.TestSetupInfo.js : 123
	/* generating uploading area
	*/
	HtmlGenerator.prototype.generateUploadRow = function (mergeConflict='', rowParam, localValue) {
		return (`
                <div class="form-group row ${mergeConflict ? 'has-warning' : ''}">
				 <label class="col-sm-2 col-form-label text-right form-control-label" 
                               for="headerRow-${rowParam.code}">Upload an Image :</label>
					<div  action="/file-upload" class="col-sm-10" >
                            <input name="file" type="file" id="uploadFile" data-cell-code="${rowParam.code}"
                                   class="form-control ${mergeConflict ? 'form-control-warning' : ''}" 
                                   value="${localValue}"/>
						</div>
                </div>
                `);
	};
	
	/**
	/* widgets.TestSetupInfo.js : 123
	/* generating image field with content depending on the argument "info"
	*/
	HtmlGenerator.prototype.generateUploadedRow = function (mergeConflict='', rowParam, info) {
		if (info.file == undefined){
			return (`
                <div class="form-group row ${mergeConflict ? 'has-warning' : ''}">
					<label class="col-sm-2 col-form-label text-right form-control-label" 
                               for="headerRow-${rowParam.code}">Image :</label>
							   <div class="col-sm-10">
							   <div name="empty" id="uploadedFile"/>
									<h3>No Image Saved</h3>
								</div>
                        <div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
                </div>
                `);
		}
		else if (info.binary == undefined){
			var src = info.file;
			return(`
                <div class="form-group row ${mergeConflict ? 'has-warning' : ''}">
					<label class="col-sm-2 col-form-label text-right form-control-label" 
                               for="headerRow-${rowParam.code}">Image :</label>
                        <div class="col-sm-10">
							<div class="single-item">
								<div><input name="${info.file}" type="image" id="uploadedFile" src="${src}" alt="empty"/></div>
							</div>
							<div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
						</div>
                </div>
                `);
		}
		else {
			//console.log(info)
			var src = 'data:image/jpeg;base64,' + btoa(info.binary);
			return(`
                <div class="form-group row ${mergeConflict ? 'has-warning' : ''}">
					<label class="col-sm-2 col-form-label text-right form-control-label" 
                               for="headerRow-${rowParam.code}">Image :</label>
                       
                        <div class="col-sm-10">
							<div class="single-item">
								<div><input name="${info.file}" type="image" id="uploadedFile" src="${src}" alt="empty"/></div>
							</div>
							<div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
						
                        </div>
                </div>
				
                `);
		}
		
	};
	
	/**
	/* widgets.SpecificationInfo.js : 123
	/* generating a group of header rows
	*/
	HtmlGenerator.prototype.generateSpecificationHeaderRows = function (rowsHtml) {
		return (`<div id="specificationHeaderRows">${rowsHtml}</div>`);
	};
	
	/**
	/* widgets.GroupInfo.js : 140
	/* generating a message about a group of test cases
	*/
	HtmlGenerator.prototype.generateMessage = function (message) {
		return (`<div class="alert alert-info mt-2">${message}</div>`);
	};
	
	/**
	/* widgets.GroupInfo.js : 149
	/* generating a row containing test case data
	*/
	HtmlGenerator.prototype.generateTestCaseRow = function (rowParam, testCase) {
		return (`		<div>
                            <small><b>${rowParam.name}:</b></small>
                            ${testCase.headerValues[rowParam.code]}
						</div>
                    `);
	};
	
	/**
	/* widgets.GroupInfo.js : 149
	/* generating a row containing test case data
	*/
	HtmlGenerator.prototype.generateRequirementRow = function (rowParam, specification) {
		return (`		<div>
                            <small><b>${rowParam.name}:</b></small>
                            ${specification.header[rowParam.code]}
                        </div>
                    `);
	};
	
	/**
	/* widgets.GroupInfo.js : 152
	/* generating a test case belonging to a group
	*/
	HtmlGenerator.prototype.generateTestCase = function (testCase, html) {
		return(`
                    <div class="list-group-item draggable js-test-case-item mt-2" data-test-case-id="${testCase.id}">
                         <div class="align-top d-inline-block"><i class="fa fa-arrows-v big-icon mt-2 mr-3"></i></div>
                         <div class="d-inline-block">${html}</div>
                    </div>
                `);
	};
	
	/**
	/* widgets.GroupInfo.js : 152
	/* generating a test cases belonging to a group
	*/
	HtmlGenerator.prototype.generateRequirement = function (requirement, html) {
		return(`
                    <div class="list-group-item draggable js-requirement-item mt-2" data-requirement-id="${requirement.name}">
                         <div class="align-top d-inline-block"><i class="fa fa-arrows-v big-icon mt-2 mr-3"></i></div>
                         <div class="d-inline-block">${html}</div>
                    </div>
                `);
	};
	
	/**
	/* widgets.GroupInfo.js : 169
	/* generating a message about changing test cases order in a group
	*/
	HtmlGenerator.prototype.generateChangingOrderMessage = function (message) {
		return(`
            <div>       
                 <h6>Group Test Case: 
                    <span class="fa fa-info-circle" role="tooltip" data-toggle="tooltip" data-placement="right" 
                          title='${message}'></span> 
                 </h6>
            </div>
        `);
	};
	
	/**
	/* widgets.ItemsList.js : 73
	/* generating an item containing text
	*/
	HtmlGenerator.prototype.generateTextItem = function (key, value, representedParams) {
		if (representedParams == undefined)
			return(`<div class="text-truncate"><small><b>${key}:</b></small> ${value}</div>`);
		else if (representedParams.indexOf(key) > -1)
			return(`<div class="text-truncate"><small><b>${key}:</b></small> ${value}</div>`);
	};
	
	/**
	/* widgets.ItemsList.js : 80
	/* generating an item to be put in a list
	*/
	HtmlGenerator.prototype.generateListItem = function (item, isActive) {
		var id = item.id;
		var rev = item.rev;
		/**
		*	Testing if the item recieved is a document or an element of an array
		*/
		if (item.id == undefined){
			id = item.name;
			rev = item.description;
		}
		return(`
                    <div class="list-group-item list-group-item-action js-items-list-item ${isActive ? 'active' : ''}" role="button"
                         data-item-id="${id}"
                         data-item-rev="${rev}">
                         <div class="collapse align-top cases-list-checkbox"><i class="fa fa-square-o align-middle js-checkbox"/></div>
                    </div>
                `);
	};
	
	/**
	/* Requirements in the vertical Menu
	*/
	HtmlGenerator.prototype.generateRequirementListItem = function (item,isActive) {
		return(`
                    <div class="list-group-item list-group-item-action js-items-list-item ${isActive ? 'active' : ''}" role="button"
                         data-item-id="${item.name}"
                         data-item-rev="${item.description}">
                         <div class="collapse align-top cases-list-checkbox"><i class="fa fa-square-o align-middle js-checkbox"/></div>
                    </div>
                `);
	};
	
	/**
	/* widgets.ItemsList.js : 88 ---- widgets.TestingSteps : 213
	/* generating an alert message
	*/
	HtmlGenerator.prototype.generateAlertMessage = function (message) {
		return(`<div class="alert alert-info">${message}</div>`);
	};
	
	/**
	/* widgets.ItemsListModal.js : 77
	/* generating an alert message indicating an empty list
	*/
	HtmlGenerator.prototype.generateHtmlItem = function (item) {
		return(`	<div class="list-group-item list-group-item-action" 
                      role="button" data-item-code="${item.code || ''}">${item.name || ($.type(item) === 'string' ? item : '<i>No title</i>')}</div>
            `);
	};
	
	/**
	/* widgets.ItemsListModal.js : 79
	/* adding an item or an message in a modal
	*/
	HtmlGenerator.prototype.generateModalItem = function (modalId, itemsHtml, emptyMsg) {
		return(`<div class="list-group" data-modal-id="${modalId}">${itemsHtml || emptyMsg}</div>`);
	};
	
	/**
	/* widgets.Modal.js : 97
	/* generating a modal
	*/
	HtmlGenerator.prototype.generateModalHtml = function (modal) {
		//console.trace();
		//console.log(modal)
		return(`
            <div ${modal.id ? 'id="' + modal.id + '"' : ''} class="modal fade" ${modal.closable ? '' : 'data-backdrop="static"'}>
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title js-modal-title">${modal.title}</h5>
                            <button type="button" class="close" ${modal.closable ? '' : 'hidden'} data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body js-modal-content">${modal.contentHtml}</div>
                        <div class="modal-footer">
                            <button type="button" ${modal.hideApplyBtn ? 'hidden' : ''}
                                    class="btn btn-primary js-apply-btn">${modal.applyBtnText}</button>
                            <button type="button" ${modal.hideCancelBtn ? 'hidden' : ''}
                                    class="btn btn-secondary js-cancel-btn"
                                    data-dismiss="modal">${modal.cancelBtnText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `);
	};
	
	/**
	/* widgets.TestCaseGroups.js : 80
	/* adding a badge for a group when adding a test case
	*/
	HtmlGenerator.prototype.generateGroupBadge = function (group) {
		return(`
            <div class="badge badge-primary">
                ${group.headerValues.name}
                <i class="fa fa-remove js-remove-from-group" data-group-id="${group.id}" role="button"></i>
            </div>
        `);
	};
	
	/**
	/* widgets.TestCaseInfo.js : 96
	/* generating a hint when adding/removing a row
	*/
	HtmlGenerator.prototype.generateRowModificationHint = function (info) {
		return(`
                ${info._msgChangedOnServer}
                <div class="added-row text-left p-1">${info._msgAddedRowHint}</div>
                <div class="removed-row text-left p-1">${info._msgRemovedRowHint}</div>
            `, 'warning');
	};
	
	/**
	/* widgets.TestCaseInfo.js : 145
	/* generating a container for test case groups
	*/
	HtmlGenerator.prototype.generateTestCaseGroupsContainer = function () {
		return(`      
            <div id="testCaseGroupsContainer">
                <div class="d-inline-block js-test-case-groups"></div>
                <div class="btn btn-outline-primary btn-sm js-add-into-group" role="button">
                    <i class="fa fa-plus"></i> Add to Group
                </div>
            </div>
        `);
	};
	
	/**
	/* widgets.TestCaseInfo.js : 180 ---- widgets.TestingSteps.js : 267
	/* generating a row
	*/
	HtmlGenerator.prototype.generateTestHeaderRows = function (rowsHtml,bootstrap) {
		if (bootstrap == true) 	return(`<div id="testHeaderRows" class="mt-4">${rowsHtml}</div>`);
		else 					return (`<div id="testHeaderRows">${rowsHtml}</div>`);
	};
	
	/**
	/* widgets.TestCaseInfo.js : 195
	/* generating a table for settings
	*/
	HtmlGenerator.prototype.generateBlockSettingsTable = function (blockSettings, rowsHtml, addItem=false) {
		if (addItem){
			var emptyMsg ="";
			if (rowsHtml == "") emptyMsg = " (No "+blockSettings.title+" created in the Template)";
			return(`
				<table class="table">
					<tbody id="${blockSettings.code}" class="js-input-data-table">
						<tr>
							<th colspan="100%" class="text-center">${blockSettings.title.toUpperCase()} ${emptyMsg}</th>
						</tr>
						${rowsHtml}
					</tbody>
				</table>
			`);
		}else
			return(`
				<table class="table">
					<tbody id="${blockSettings.code}" class="js-input-data-table">
						<tr>
							<th colspan="100%" class="text-center">${blockSettings.title.toUpperCase()}</th>
						</tr>
						${rowsHtml}
					</tbody>
				</table>
				<div class="text-right">
					<button type="button" class="btn btn-secondary mb-4 js-add-item" 
							data-block-code="${blockSettings.code}">
								<i class="fa fa-plus"></i>
								Add Item
					</button>
				</div>  
			`);
	};
	
	/**
	/* widgets.TestCaseInfo.js : 210
	/* generating a row and its content when adding a precondition/step
	*/
	HtmlGenerator.prototype.generateRowContent = function (columnParam, mergeConflict, addedRow, serverValue, localValue, message) {
		return( `
                    <td width="${columnParam.width || ''}">
                        <div class="form-group ${mergeConflict ? 'has-warning' : ''}">
                            <textarea data-cell-code="${columnParam.code || ''}" class="form-control ${mergeConflict ? 'form-control-warning' : ''}" 
                                      placeholder="${columnParam.name || ''}">${addedRow ? serverValue : localValue}</textarea>
                            <div class="form-control-feedback multiline">${mergeConflict ? message : ''}</div>
                        </div>
                    </td>
                `);
	};
	
	/**
	/* widgets.TestCaseInfo.js : 214
	/* generating a row and its content when adding a precondition/step
	*/
	HtmlGenerator.prototype.generateDraggableRow = function (addedRow, removedRow, rowContent, execution=false) {
		if (execution)
			return( `
				<tr class="js-item draggable ${addedRow ? 'added-row' : ''} ${removedRow ? 'removed-row' : ''}">
					<td width="1%"><i class="fa fa-arrows-v big-icon mt-2" ></i></td>
					${rowContent}
				</tr>
			`);
		else
			return( `
				<tr class="js-item draggable ${addedRow ? 'added-row' : ''} ${removedRow ? 'removed-row' : ''}">
					<td width="1%"><i class="fa fa-arrows-v big-icon mt-2"></i></td>
					${rowContent}
					<td width="1%"><i class="fa fa-remove big-icon mt-2 js-remove-item" role="button"></i></td>
				</tr>
			`);
	};
	
	/**
	/* widgets.TestCaseResultTable.js : 55 : 58 : 75
	/* generating a row and its content when adding a precondition/step
	*/
	HtmlGenerator.prototype.generateColumnHtml = function (settings, title) {
		return(`<tr><td width="100%" colspan="${settings.totalColumnsInRow}"><b>${title}:</b></td></tr>`);
	};
	
	/**
	/* widgets.TestCaseResultTable.js : 100
	/* generating entity data of the header
	*/
	HtmlGenerator.prototype.generateTableHeaderData = function (headerParams, rowParam, settings, value) {
		return(`
                    <tr>
                        <td width="${headerParams.nameWidth}" colspan="${headerParams.nameColspan}"><b>${rowParam.name}:</b></td>
                        <td colspan="${settings.totalColumnsInRow - headerParams.nameColspan}">${value}</td>
                    </tr>
                `);
	};
	
	/**
	/* widgets.TestCaseResultTable.js : 114
	/* generating Html separator between test cases
	*/
	HtmlGenerator.prototype.generateHtmlSeparator = function (columnsCount, brForExcel) {
		return(`<tr><td colspan="${columnsCount}">${brForExcel}${brForExcel}${brForExcel}</td></tr>`);
	};
	
	/**
	/* widgets.TestingSteps.js : 169
	/* generating Html Alert Message
	*/
	HtmlGenerator.prototype.generateTestCaseAlertMessage = function (message) {
		return(`<div class="alert alert-info"><i class="fa fa-arrow-left"></i> ${message}</div>`);
	};
	
	/**
	/* widgets.TestingSteps.js : 218
	/* generating Test Case Html
	*/
	HtmlGenerator.prototype.generateTestCaseHtml = function (logFileInput,testCase, expanded, headerRowsHtml, notExecutableBlocksHtml, stepsHtml, stepsEmptyHtml) {
		return(`
			
            <div class="card">
                <div class="card-header" role="tab" id="heading${testCase.id}">
                    <div class="clickable row" data-toggle="collapse" data-parent="#testingStepsAccordion" data-target="#collapse${testCase.id}" 
                         aria-expanded="${expanded}" aria-controls="collapse${testCase.id}">
                        <div class="col-sm-9 col-md-10 col-lg-11">${headerRowsHtml}</div>
                        <div class="col-sm-3 col-md-2 col-lg-1">
                            <div class="js-test-case-result rounded-circle">
                                <i class="fa fa-2x p-3"></i>
                            </div>
                        </div>
                    </div>
                </div>
				<div class="card-header" role="tab">
                ${logFileInput}</div>
                <div id="collapse${testCase.id}" class="collapse ${expanded ? 'show' : ''}" role="tabpanel" aria-labelledby="heading${testCase.id}">
                    <div class="card-block">
                        ${notExecutableBlocksHtml}
                        <div class="carousel slide over mt-4 js-test-case-steps-carousel" data-test-case-id="${testCase.id}">
                            <div class="carousel-inner" role="listbox">${stepsHtml || stepsEmptyHtml}</div>
                        </div>
                    </div>
                </div>
            </div>
        `);
	};
	
	/**
	/* widgets.TestingSteps.js : 265
	/* generating input fields
	*/
	HtmlGenerator.prototype.generateInputFields = function (rowParam, headerValues, code='No logfile attached',attachment) {
		if (rowParam.code == "logfile"){
			var html=(`  
							<div class="col-sm-12 col-md-12 col-lg-12">
							<b>${rowParam.name}:</b>
								<input name="image" type="file" id="logUploadFile-${headerValues.name}" src="${code}" alt="empty"/>
							</div>
					`);
			if (attachment != undefined && attachment.logfile != undefined){
				var src = 'data:image/jpeg;base64,' + btoa(attachment.logfile);
				html+= `
				<a href="${src}" download="LOGFILE_${headerValues.name}">Download : ${headerValues.name} LOGFILE</a>`;
			}
			else html += `<b>(No logfile attached)</b>`;
			return html;
		}else
			return(`    <div>
							<b>${rowParam.name}:</b>
							${(headerValues && code) || ''}
						</div>`);
	};
	
	/**
	/* widgets.TestingSteps.js : 283
	/* generating table for input fields
	*/
	HtmlGenerator.prototype.generateHtmlTableForBlock= function (blockParams, values, markdown) {
		return(`
                    <h5 class="text-center">${blockParams.title}</h5>
                    <table class="table table-hover table-sm">
                        ${this.generateTableForBlock(blockParams, values, markdown)}
                    </table>
                `);
	};
	
	/**
	/* widgets.TestingSteps.js : 301
	/* generating a test step's html
	*/
	HtmlGenerator.prototype.generateTestStepHtml= function (name, value) {
		return(`<div>
                    <small><b>${name}:</b></small>
                    ${value}
                </div>`);
	};
	
	/**
	/* widgets.TestingSteps.js : 305
	/* generating a Test Steps Block html 
	*/
	HtmlGenerator.prototype.generateTestStepBlockHtml= function (result, attachments,stepNumber, code, rowInBlockNumber, title, textStepFrom, textStepBlocked, textComment, rowsInBlockCount, textFail, textSuccess, textStep, textPreviousStep, textNextStep, blockContent, stepsCount) {
		//console.log(attachments)
		/**
		*	Getting the value of the Comment textarea if it exists
		*/
		var comment = `<textarea class="form-control mt-3 mb-3 js-step-result-comment" placeholder="${textComment}">`;
		if (result != undefined && result[stepNumber-1].comment != '')
			comment += `${result[stepNumber-1].comment}`;
		comment += `</textarea>`;
		/**
		*	Generating the test step image field if it exists
		*/
		var stepAttachmentHtml = `<div><input name="file" type="file" id="stepUploadFile-${stepNumber-1}"/></div>`;
		var src='';
		if (attachments != undefined && attachments.stepAttachment!=undefined){
			var value ='';
			for (var i=0;i<attachments.stepAttachment.length;i++){
				//console.log(i,attachments.stepAttachment)
				//console.log(attachments.stepAttachment[i].id.charAt(attachments.stepAttachment[i].id.length-('_image').length -1))
				//console.log(result[stepNumber-1].attachmentId,attachments.stepAttachment[i].id)
				//console.log(attachments.stepAttachment[i].id,stepNumber)
				if (attachments.stepAttachment[i].id == stepNumber){
					//console.log("found : ",attachments.stepAttachment[i].id,stepNumber)
					value = attachments.stepAttachment[i].value;
					src+='data:image/jpeg;base64,' + btoa(value);
					break;
				}
			}
			
		}
		stepAttachmentHtml +=`<div><input  name="image" type="image" id="stepUploadedFile-${stepNumber-1}" src="${src}" alt="No Image Attached"/></div>`;
		/**
		*	Showing the previous result using the buttons (succes/fail or not tested) 
		*/
		var successButton = ``;
		var failButton = ``;
		if (result != undefined && result[stepNumber-1].result == 'Executed'){
			successButton += `<div class="btn btn-secondary js-step-result js-carousel-control.btn-success btn-success" role="button" data-success="true" data-action="next">
								<i class="fa fa-thumbs-up"></i> ${textSuccess}
							</div>`;
			failButton += 	`<div class="btn btn-secondary js-step-result" role="button" data-success="false">
								<i class="fa fa-thumbs-down"></i> ${textFail}
							</div>`;
		}else if (result != undefined && result[stepNumber-1].result == 'Failed'){
			successButton += `<div class="btn btn-secondary js-step-result js-carousel-control" role="button" data-success="true" data-action="next">
								<i class="fa fa-thumbs-up"></i> ${textSuccess}
							</div>`;
			failButton += 	`<div class="btn btn-secondary js-step-result.btn-danger btn-danger" role="button" data-success="false">
								<i class="fa fa-thumbs-down"></i> ${textFail}
							</div>`;
		}else{
			successButton += `<div class="btn btn-secondary js-step-result js-carousel-control" role="button" data-success="true" data-action="next">
								<i class="fa fa-thumbs-up"></i> ${textSuccess}
							</div>`;
			failButton += 	`<div class="btn btn-secondary js-step-result" role="button" data-success="false">
								<i class="fa fa-thumbs-down"></i> ${textFail}
							</div>`;
		}
		
		return(`
            <div class="card carousel-item js-testing-step ${stepNumber === 1 ? 'active' : ''}" data-step-number="${stepNumber}"
                 data-block-code="${code}" data-block-item-position="${rowInBlockNumber}">
                <div class="card-header text-center">
                    <div class="pt-2 d-inline-block"> 
                        ${title} (${rowInBlockNumber + 1} ${textStepFrom} ${rowsInBlockCount})
                    </div>
                    <div class="btn-group ml-2 float-right" role="group">
                        ${successButton}
                        ${failButton}
                        <div class="pt-2 js-step-blocked-text hidden">${textStepBlocked}</div>
                    </div>
                </div>
                <div class="card-block">
                    ${blockContent}
					${comment}
                    
					<label class="input-group">
						<b>Screenshot :</b>
                    </label>
					${stepAttachmentHtml}
					
					<div class="text-center" role="toolbar">
                        <div class="btn btn-secondary js-carousel-control float-left" ${stepNumber === 1 ? 'hidden' : ''}
                             role="button" data-action="prev">
                            <i class="fa fa-arrow-left"></i> ${textPreviousStep}
                        </div>
                        <div class="js-step-number p-2 d-inline-block">${textStep} ${stepNumber} ${textStepFrom} ${stepsCount}</div>
                        <div class="btn btn-secondary js-carousel-control float-right" ${stepNumber === stepsCount ? 'hidden' : ''}
                             role="button" data-action="next">
                            ${textNextStep} <i class="fa fa-arrow-right"></i>
                        </div>
                    </div>
                </div>
            </div>
        `);
	};
	
	/**
     * Generates HTML for the row with column names in the table for`Connecting to remote DB [${this.remoteDbUrl + '/' + remoteDbName}]`the test case data block
     * @param blockParams Data Block Parameters test case
     * @param useThTag An indicator of the use of the TH tag instead of TD to define the cells
     * @returns {string}
     */
    HtmlGenerator.prototype.generateTableHeader = function (blockParams, useThTag = true) {
        let titleRowContent = '';
        const cellTag = useThTag ? 'th' : 'td';
        for (let columnParam of blockParams.columns) 
            titleRowContent += `<${cellTag} colspan="${columnParam.colspan}" width="${columnParam.width || ''}">${columnParam.name}</${cellTag}>`;
        return (`<tr>${titleRowContent}</tr>`);
    };

    HtmlGenerator.prototype.generateTableForBlock = function (blockParams, blockValues, markdown = false, useThTag = true) {
		//console.log(blockValues)
        let html = this.generateTableHeader(blockParams, useThTag);
        let rowNum = 1;
		if (blockValues != undefined)
        for (let rowData of blockValues) {
            if (this._checkCellsHasDataInResult(blockParams.columns, rowData)) {
                let rowContent = '';
                for (let columnParams of blockParams.columns) {
                    let value = (columnParams.type === 'orderNumber' ? rowNum : (rowData[columnParams.code] || '')) + '';
                    if (markdown) 
                        value = utils.TextUtils.markdownToHtml(value);
                    else 
                        value = utils.TextUtils.brakesForExcelFix(value);
                    if (columnParams.inResult)
                        rowContent += `<td colspan="${columnParams.colspan}" width="${columnParams.width}">${value}</td>`;
                }
                html += `<tr>${rowContent}</tr>`;
                rowNum++;
            }
        }
        return html;
    };

    HtmlGenerator.prototype._checkCellsHasDataInResult = function (columns, rowData) {
        for (let columnParams of columns) {
            if (columnParams.type !== 'orderNumber' && columnParams.inResult && rowData[columnParams.code])
                return true;
        }
        return false;
    };

})(window, window.ru.belyiz.utils);
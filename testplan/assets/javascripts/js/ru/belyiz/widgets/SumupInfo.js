/** @namespace window.ru.belyiz.widgets.SumupInfo */

(function (global, Pattern, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.SumupInfo', SumupInfo);
    Pattern.extend(SumupInfo);

    /**
     * @constructor
     */
    function SumupInfo(setup) {
        setup = setup || {};
        this.$container = $(setup.container);
        this.settings = {};
        this.appMatrixRevision = '';
		this.table = '';
		this.representedParams = ['requirement','description','name','result','crossReviewJustify','comment'];
        this.msgNoOneTestSelected = 'Add a Requirement to the Specification';
        this._msgMergeConflict = 'The data on the server has changed.';
        this._msgServerFieldEmpty = 'The value of this field has been deleted.';
        this._msgActualFieldValue = 'Current text: \n';
        this._msgRemovedFromServer = 'The specification you are editing was deleted from the server. If you save your changes, it is equivalent to creating a new change.';
        this._msgTestCasesTooltip = 'Changing the order of the test case is automatically saved, and you do not have to click Save Changes.';
        this._eventHandlers = {};
        this._eventNames = {
            changed: 'changed',
        };
    }

    SumupInfo.prototype._bindEvents = function () {
        this.$container.on('keyup paste change', 'textarea', 'input', this._events.onFieldChanged.bind(this));
		
    };

    SumupInfo.prototype._events = {
        onFieldChanged: function () {
            this.trigger(this._eventNames.changed);
        }
		
		
    };

    SumupInfo.prototype.reDraw = function (settings, localData=0, relatedDocs, serverData) {
		//console.log(settings,localData);
		/*var elem = document.getElementById('itemsVerticalListMenu');
		elem.parentNode.removeChild(elem);
		var p = document.
		var elem1 = document.getElementById('DatabaseButtons');
		elem1.parentNode.removeChild(elem1);
		document.getElementById("PageContent").classList.remove('col-xl-9');
		document.getElementById("PageContent").classList.add('col-xl-12');*/
        const SumupInfo = localData;
        const localRevision = (SumupInfo && SumupInfo.rev) || '';
        const serverSumupInfo = serverData && serverData.specification;
        const serverRevision = (serverSumupInfo && serverSumupInfo.rev) || '';
        this.appMatrixId = (SumupInfo && SumupInfo.id) || '';
        this.settings = settings;
        this.appMatrixRevision = serverRevision || localRevision;
        this.$container.html('');
		this.$container.append(utils.HtmlGenerator.generateSumupDataTable(this.getDataTableParams(settings.testCaseExe.header.rows), this.getDataTableInfo(relatedDocs)));
		this.executeScript();
        this.$container.find('[data-toggle="tooltip"]').tooltip();
        this.trigger(this._eventNames.changed);
    };

	
	SumupInfo.prototype.getDataTableParams = function (rows = []){
		var representedRows = rows;
		for (var i=0;i<rows.length;i++)
			if (this.representedParams.indexOf(representedRows[i].code) < 0){
				rows.splice(i,1);
				i--;
			}
		var details = {
			code : 'details',
			name : 'Details'
		}
		representedRows.push(details)
		return representedRows;
	}
	/**
	*	The Elements To represent the Sumup Info in the DataTable
	*/
	SumupInfo.prototype.getDataTableInfo = function (relatedDocs = []){
		var dataTableInfo = [];
		for (var i=0;i<relatedDocs.length;i++){
			var dataTableElement = {
				requirement : (relatedDocs[i].headerValues.requirement),
				name: (relatedDocs[i].headerValues.name),
				description : (relatedDocs[i].headerValues.description),
				result : (relatedDocs[i].headerValues.result || 'Not Tested'),
				comment : (relatedDocs[i].headerValues.comment || ''),
				crossReviewJustify : (relatedDocs[i].headerValues.crossReviewJustify || 'No'),
				details : (relatedDocs[i].id)
			};
			dataTableInfo.push(dataTableElement);
		}
		return dataTableInfo;
	};
	
    SumupInfo.prototype.showDifference = function (serverData) {
        if (serverData.appMatrix && serverData.appMatrix.rev && serverData.appMatrix.rev !== this.appMatrixRevision){
            const localData = {appMatrix: this.getData()};
            this.reDraw(this.settings, localData, serverData, true);
        }
    };

    SumupInfo.prototype.removedOnServer = function () {
        services.Notification.static(this._msgRemovedFromServer, 'danger');
        this.appMatrixId = '';
        this.appMatrixRevision = '';
    };
	
	/**
	* Retreiving input Data from the view
	*/
    SumupInfo.prototype.getData = function () {
        var appMatrixData = {
            id: this.appMatrixId,
            rev: this.appMatrixRevision,
            settings: this.settings,
            requirements : []
        };
		var tableRows = this.settings.appMatrix.header.rows;
		var data = this.table.rows().data();
        for (var i=0;i<data.length;i++) {
			var requirement = {
				requirement : '',
				note : '',
				applicable: ''
			};
			var j=0;
			for (let rowParam of tableRows){
				if (rowParam.code == 'note') requirement[rowParam.code] = document.getElementById("note-"+data[i][0]).value;
				else if (rowParam.code == 'applicable') requirement[rowParam.code] = document.getElementById("applicable-"+data[i][0]).checked;
				else requirement[rowParam.code] = data[i][j];
				j++;
			}			
			appMatrixData.requirements.push(requirement);
		}
        return appMatrixData;
    };

    SumupInfo.prototype._getSumupInfoRowsHtml = function (specificationParams, SumupInfo, serverSumupInfo) {
		SumupInfo = SumupInfo || {};
        serverSumupInfo = serverSumupInfo || {};
        const merge = SumupInfo.rev && serverSumupInfo.rev && SumupInfo.rev !== this.specificationRevision;
        let rowsHtml = '';
        for (let rowParam of specificationParams.specification.header.rows) {
            if (rowParam.inInputs) {
				var localInitValue;
				if (SumupInfo.data !== undefined)
					localInitValue = SumupInfo.data.requirements[rowParam.code];
				else { localInitValue = '';}
				const localValue = localInitValue;
				var serverInitValue;
				if (serverSumupInfo.data !== undefined)
					serverInitValue = serverSumupInfo.data.requirements[rowParam.code];
				else
					serverInitValue = '';
				const serverValue = serverInitValue;
                const mergeConflict = merge && localValue !== serverValue;
                const message = this._msgMergeConflict + (serverValue ? this._msgActualFieldValue + serverValue : this._msgServerFieldEmpty);
                rowsHtml += utils.HtmlGenerator.generateHtmlRow(mergeConflict,rowParam,localValue);
            }
        }
        return (utils.HtmlGenerator.generateSpecificationHeaderRows(rowsHtml));
    };

    SumupInfo.prototype._getCellValue = function ($container, code) {
        return ($container.find(`[data-cell-code="${code}"]`).val() || '').trim();
    };

	SumupInfo.prototype.executeScript = function () {
			this.table = $('#sumupTable').DataTable({
			});
    };
})(window, window.ru.belyiz.patterns.AbstractEntityInfoWidget, window.ru.belyiz.utils);
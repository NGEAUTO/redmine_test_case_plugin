/** @namespace window.ru.belyiz.widgets.AppMatrixInfo */

(function (global, Pattern, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.AppMatrixInfo', AppMatrixInfo);
    Pattern.extend(AppMatrixInfo);

    /**
     * @constructor
     */
    function AppMatrixInfo(setup) {
        setup = setup || {};
        this.$container = $(setup.container);
        this.settings = {};
        this.appMatrixRevision = '';
		this.table = '';
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

    AppMatrixInfo.prototype._bindEvents = function () {
        this.$container.on('keyup paste change', 'textarea', 'input', this._events.onFieldChanged.bind(this));
    };

    AppMatrixInfo.prototype._events = {
        onFieldChanged: function () {
            this.trigger(this._eventNames.changed);
        }
    };

    AppMatrixInfo.prototype.reDraw = function (settings, localData, relatedDocs, serverData) {
		/*var elem = document.getElementById('itemsVerticalListMenu');
		elem.parentNode.removeChild(elem);
		var p = document.
		var elem1 = document.getElementById('DatabaseButtons');
		elem1.parentNode.removeChild(elem1);
		document.getElementById("PageContent").classList.remove('col-xl-9');
		document.getElementById("PageContent").classList.add('col-xl-12');*/
        const AppMatrixInfo = localData;
        const localRevision = (AppMatrixInfo && AppMatrixInfo.rev) || '';
        const serverAppMatrixInfo = serverData && serverData.specification;
        const serverRevision = (serverAppMatrixInfo && serverAppMatrixInfo.rev) || '';
        this.appMatrixId = (AppMatrixInfo && AppMatrixInfo.id) || '';
        this.settings = settings;
        this.appMatrixRevision = serverRevision || localRevision;
        this.$container.html('');
		if (localData != undefined)
			this.$container.append(utils.HtmlGenerator.generateAppMatrixDataTable(settings.appMatrix.header.rows, this.getDataTableInfo(localData.requirements)));
		else
			this.$container.append(utils.HtmlGenerator.generateAppMatrixDataTable(settings.appMatrix.header.rows, this.getDataTableInfo(relatedDocs.requirementsDoc.requirements)));
		this.executeScript();
        this.$container.find('[data-toggle="tooltip"]').tooltip();
        this.trigger(this._eventNames.changed);
    };

	AppMatrixInfo.prototype.getDataTableInfo = function (requirements = []){
		var dataTableInfo = [];
		for (var i=0;i<requirements.length;i++){
			var dataTableElement = {
				requirement : (requirements[i].name || requirements[i].requirement),
				note: (requirements[i].note || ''),
				applicable : (requirements[i].applicable || false)
			};
			dataTableInfo.push(dataTableElement);
		}
		return dataTableInfo;
	};
	
    AppMatrixInfo.prototype.showDifference = function (serverData) {
        if (serverData.appMatrix && serverData.appMatrix.rev && serverData.appMatrix.rev !== this.appMatrixRevision) {
            const localData = {appMatrix: this.getData()};
            this.reDraw(this.settings, localData, serverData, true);
        }
    };

    AppMatrixInfo.prototype.removedOnServer = function () {
        services.Notification.static(this._msgRemovedFromServer, 'danger');
        this.appMatrixId = '';
        this.appMatrixRevision = '';
    };
	
	/**
	* Retreiving input Data from the view
	*/
    AppMatrixInfo.prototype.getData = function () {
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

    AppMatrixInfo.prototype._getAppMatrixInfoRowsHtml = function (specificationParams, AppMatrixInfo, serverAppMatrixInfo) {
		AppMatrixInfo = AppMatrixInfo || {};
        serverAppMatrixInfo = serverAppMatrixInfo || {};
        const merge = AppMatrixInfo.rev && serverAppMatrixInfo.rev && AppMatrixInfo.rev !== this.specificationRevision;
        let rowsHtml = '';
        for (let rowParam of specificationParams.specification.header.rows) {
            if (rowParam.inInputs) {
				var localInitValue;
				if (AppMatrixInfo.data !== undefined) { localInitValue = AppMatrixInfo.data.requirements[rowParam.code];}
				else { localInitValue = '';}
				const localValue = localInitValue;
				var serverInitValue;
				if (serverAppMatrixInfo.data !== undefined) { serverInitValue = serverAppMatrixInfo.data.requirements[rowParam.code];}
				else { serverInitValue = '';}
				const serverValue = serverInitValue;
                const mergeConflict = merge && localValue !== serverValue;
                const message = this._msgMergeConflict + (serverValue ? this._msgActualFieldValue + serverValue : this._msgServerFieldEmpty);
                rowsHtml += utils.HtmlGenerator.generateHtmlRow(mergeConflict,rowParam,localValue);
            }
        }
        return (utils.HtmlGenerator.generateSpecificationHeaderRows(rowsHtml));
    };

    AppMatrixInfo.prototype._getCellValue = function ($container, code) {
        return ($container.find(`[data-cell-code="${code}"]`).val() || '').trim();
    };

	AppMatrixInfo.prototype.executeScript = function () {
			this.table = $('#appMatrixTable').DataTable({
			});
    };
})(window, window.ru.belyiz.patterns.AbstractEntityInfoWidget, window.ru.belyiz.utils);
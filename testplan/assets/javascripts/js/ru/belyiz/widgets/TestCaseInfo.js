/** @namespace window.ru.belyiz.widgets.TestCaseInfo */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestCaseInfo', TestCaseInfo);
    Pattern.extend(TestCaseInfo);

    /**
     * @constructor
     */
    function TestCaseInfo(setup) {
        setup = setup || {};
        this.$container = $(setup.container);
        this.testCasesService = setup.entityService;
        this.settings = {};
        this.testCaseId = '';
        this.testCaseRevision = '';
		this.relatedDocType = 'testSetup';
        this._msgMergeConflict = 'The data on the server has changed.';
        this._msgServerFieldEmpty = 'The value of this field has been deleted.';
        this._msgActualFieldValue = 'Current text: \n';
        this._msgAddedRowHint = 'This highlights the rows that were added to the server version';
        this._msgRemovedRowHint = 'This highlights rows that are not in the server version';
        this._msgRemovedFromServer = 'The test case you are editing has been removed from the server. If you save your changes, it is equivalent to creating a new change.';
        this._msgChangedOnServer = 'Edited Test briefcase has been edited. All the differences between the Reaktiruemoj version and the relevant interface are listed.';
        this._eventHandlers = {};
        this._eventNames = {
            changed: 'changed',
        };
    }

    TestCaseInfo.prototype._createWidgets = function () {
        this.testCaseGroupsWidget = new widgets.TestCaseGroups({containerId: 'testCaseGroupsContainer'}).initialize();
    };

    TestCaseInfo.prototype._bindEvents = function () {
        this.$container.on('click', '.js-add-item', this._events.onAddRowClick.bind(this));
        this.$container.on('click', '.js-remove-item', this._events.onRemoveRowClick.bind(this));
		this.$container.on('change', '#headerRow-requirement', this._events.onConfirmClick.bind(this));
        this.$container.on('keyup paste change', 'textarea, input', this._events.onTextareaChanged.bind(this));
    };

    TestCaseInfo.prototype._events = {
		
        onAddRowClick: function (e) {
            const blockCode = $(e.currentTarget).data('blockCode');
            for (let blockParams of this.settings.tests.blocks) {
                if (blockParams.code === blockCode) {
                    this.$container.find(`#${blockCode}`).append(this._getBlockRowHtml(blockParams));
                }
            }
            this.trigger(this._eventNames.changed);	
        },
		
		onConfirmClick: function (e) {
			$("#hiddenRows").show();
			var allData = Array.from(document.getElementsByClassName("text-truncate"));
			var allRequirements=[];
			var allTestCases=[];
			for (var i =0;i<allData.length-1;i+=2){
				allData[i]=allData[i].innerText;
				allRequirements.push(allData[i].slice(allData[i].indexOf(':')+2,(allData[i].length)));
				allData[i+1]=allData[i+1].innerText;
				allTestCases.push(allData[i+1].slice(allData[i+1].indexOf(':')+2,(allData[i+1].length)));
			}
			document.getElementById('headerRow-name').value = utils.InputsUtils.getTestCaseName(document.getElementById('headerRow-requirement').value, allRequirements, allTestCases);
			
			this.trigger(this._eventNames.changed);
        },
		
        onRemoveRowClick: function (e) {
            $(e.currentTarget).closest('tr').remove();
            this.trigger(this._eventNames.changed);
        },

        onTextareaChanged: function () {
            this.trigger(this._eventNames.changed);
        },
    };

    TestCaseInfo.prototype.reDraw = function (settings, testCaseInfo, relatedDocs, serverTestCaseInfo) {
        this.testCaseId = testCaseInfo && testCaseInfo.id || '';
        this.settings = settings;
        const serverRevision = serverTestCaseInfo && serverTestCaseInfo.rev || '';
        const localRevision = testCaseInfo && testCaseInfo.rev || '';
        this.testCaseRevision = serverRevision || localRevision;
        this.$container.html('');
        if (this.testCaseId)
            this._initGroupsBlock();
        this.$container.append(this._getHeaderRowsHtml(settings.tests.header, testCaseInfo, relatedDocs, serverTestCaseInfo));
        for (let blockSettings of settings.tests.blocks) {
            const localBlockValues = testCaseInfo && testCaseInfo.blocksValues && testCaseInfo.blocksValues[blockSettings.code] || false;
            const serverBlockValues = serverTestCaseInfo && serverTestCaseInfo.blocksValues && serverTestCaseInfo.blocksValues[blockSettings.code] || false;
            this.$container.append(this._getBlocksHtml(blockSettings, localBlockValues, serverBlockValues));
        }
        $('.js-input-data-table').sortable({
            items: ">.draggable"
        });		
        utils.InputsUtils.resizeTextAreas();
        this.trigger(this._eventNames.changed);
    };

    TestCaseInfo.prototype.showDifference = function (serverTestCaseInfo) {
        if (serverTestCaseInfo.rev && serverTestCaseInfo.rev !== this.testCaseRevision) {
			services.Notification.static(utils.HtmlGenerator.generateRowModificationHint(this));
            this.reDraw(this.settings, this.getData(), serverTestCaseInfo);
        }
    };

    TestCaseInfo.prototype.removedOnServer = function () {
        services.Notification.static(this._msgRemovedFromServer, 'danger');
        let testCaseData = this.getData();
        testCaseData.id = '';
        testCaseData.rev = '';
        this.reDraw(this.settings, testCaseData);
    };

    TestCaseInfo.prototype.getData = function () {
        let testCaseData = {
            id: this.testCaseId,
            rev: this.testCaseRevision,
            settings: this.settings,
            headerValues: {},
            blocksValues: {},
			relatedDocs: {}
        };
        for (let rowParam of this.settings.tests.header.rows) 
            testCaseData.headerValues[rowParam.code] = this._getCellValue(this.$container.find('#testHeaderRows'), rowParam.code);
        for (let blockSettings of this.settings.tests.blocks) {
            const $itemsTable = this.$container.find(`#${blockSettings.code}`);
            testCaseData.blocksValues[blockSettings.code] = [];
            let rowNum = 1;
            for (let item of $itemsTable.find('.js-item')) {
                const $item = $(item);
                testCaseData.blocksValues[blockSettings.code][rowNum - 1] = {};
                if (this._checkRowHasData($item)) {
                    for (let columnsParams of blockSettings.columns) {
                        if (columnsParams.inInputs && columnsParams.type !== 'orderNumber')
                            testCaseData.blocksValues[blockSettings.code][rowNum - 1][columnsParams.code] = this._getCellValue($item, columnsParams.code);
                    }
                }
                rowNum++;
            }
        }
        return testCaseData;
    };

    TestCaseInfo.prototype._initGroupsBlock = function () {
		this.$container.html(utils.HtmlGenerator.generateTestCaseGroupsContainer());
        this.testCaseGroupsWidget.setTestCaseId(this.testCaseId);
        this.testCasesService.findGroups(this.testCaseId, groups => {
            this.testCaseGroupsWidget.reDraw(groups);
        });
    };

	
    /**
     * Generates HTML for table banner input fields
     *
     * @param headerParams Table banner input Field options
     * @param testCaseInfo Data from the local-saved test case are supplied in the input fields
     * @param serverTestCaseInfo Server version data of the test case, used to display the difference, when editing not the last versionи
     * @returns {string}
     * @private
     */
    TestCaseInfo.prototype._getHeaderRowsHtml = function (headerParams, testCaseInfo, relatedDocs, serverTestCaseInfo) {
        testCaseInfo = testCaseInfo || {};
        serverTestCaseInfo = serverTestCaseInfo || {};
        const merge = testCaseInfo.rev && serverTestCaseInfo.rev && testCaseInfo.rev !== this.testCaseRevision;
        let rowsHtml = '';
		let hiddenRowsHtml = '';
        for (let rowParam of headerParams.rows) {
            if (rowParam.inInputs) {
                const localValue = testCaseInfo.headerValues && testCaseInfo.headerValues[rowParam.code] || '';
				var variableLocalValue='';
                const serverValue = serverTestCaseInfo.headerValues && serverTestCaseInfo.headerValues[rowParam.code] || '';
                const mergeConflict = merge && localValue !== serverValue;
                const message = this._msgMergeConflict + (serverValue ? this._msgActualFieldValue + serverValue : this._msgServerFieldEmpty);
				if (rowParam.code == 'requirement')
					rowsHtml += utils.HtmlGenerator.generateRequirementsSelectHtml(mergeConflict, rowParam, localValue, relatedDocs.specificationDoc.data.requirements);
				else if (rowParam.code == this.relatedDocType)
					hiddenRowsHtml += utils.HtmlGenerator.generateTestSetupHtmlRow(mergeConflict, rowParam, localValue, relatedDocs.testSetup);
				else
					hiddenRowsHtml += utils.HtmlGenerator.generateHtmlRow(mergeConflict, rowParam, localValue);
            }
        }
		if(testCaseInfo.headerValues == undefined)	hiddenRowsHtml = utils.HtmlGenerator.generateHiddenRowHtml(hiddenRowsHtml);
		rowsHtml += hiddenRowsHtml;
		return (utils.HtmlGenerator.generateTestHeaderRows(rowsHtml, true));
    };

	
    TestCaseInfo.prototype._getBlocksHtml = function (blockSettings, localBlockValues, serverBlockValues) {
        localBlockValues = localBlockValues || [];
        serverBlockValues = serverBlockValues || [];
        let rowsHtml = '';
        const rowsCount = Math.max(localBlockValues.length, serverBlockValues.length);
        for (let i = 0; i < rowsCount; i++) {
            const localRowValues = utils.ArraysUtils.getOfDefault(localBlockValues, i, false);
            const serverRowValues = utils.ArraysUtils.getOfDefault(serverBlockValues, i, false);
            rowsHtml += this._getBlockRowHtml(blockSettings, localRowValues, serverRowValues, serverBlockValues.length);
        }
        return (utils.HtmlGenerator.generateBlockSettingsTable(blockSettings, rowsHtml));
    };

	
    TestCaseInfo.prototype._getBlockRowHtml = function (blockSettings, localRowValues, serverRowValues, merge) {
        const addedRow = merge && serverRowValues && !localRowValues;
        const removedRow = merge && !serverRowValues && localRowValues;
        let rowContent = '';
        for (let columnParam of blockSettings.columns) {
            if (columnParam.inInputs) {
                const localValue = localRowValues && localRowValues[columnParam.code] || '';
                const serverValue = serverRowValues && serverRowValues[columnParam.code] || '';
                const mergeConflict = !removedRow && !addedRow && merge && localValue !== serverValue;
                const message = this._msgMergeConflict + (serverValue ? this._msgActualFieldValue + serverValue : this._msgServerFieldEmpty);
				rowContent += utils.HtmlGenerator.generateRowContent(columnParam, mergeConflict, addedRow, serverValue, localValue, message);
			}
        }
        return (utils.HtmlGenerator.generateDraggableRow(addedRow, removedRow, rowContent));
    };

	
    TestCaseInfo.prototype._getCellValue = function ($container, code) {
        return ($container.find(`[data-cell-code="${code}"]`).val() || '').trim();
    };

	
    TestCaseInfo.prototype._checkRowHasData = function ($row) {
        for (let textarea of $row.find('textarea')) {
            if ($(textarea).val())
                return true;
        }
        return false;
    };

	
})(window, window.ru.belyiz.patterns.AbstractEntityInfoWidget, window.ru.belyiz.utils, window.ru.belyiz.widgets);
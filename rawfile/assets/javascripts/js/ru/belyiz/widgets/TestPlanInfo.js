/** @namespace window.ru.belyiz.widgets.TestPlanInfo */

(function (global, Pattern, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestPlanInfo', TestPlanInfo);
    Pattern.extend(TestPlanInfo);

    /**
     * @constructor
     */
    function TestPlanInfo(setup) {
        setup = setup || {};
        this.$container = $(setup.container);
        this.settings = {};
        this.groupId = '';
        this.groupRevision = '';
        this.msgNoOneTestSelected = 'There is no test case in the group';
        this._msgMergeConflict = 'The data on the server has changed.';
        this._msgServerFieldEmpty = 'The value of this field has been deleted.';
        this._msgActualFieldValue = 'Current text: \n';
        this._msgRemovedFromServer = 'The group you are editing was deleted from the server. If you save your changes, it is equivalent to creating a new change.';
        this._msgTestCasesTooltip = 'Changing the order of the test case is automatically saved, and you do not have to click Save Changes.';
        this._eventHandlers = {};
        this._eventNames = {
            testCasesReordered: 'testCasesReordered',
            changed: 'changed',
        };
    }

    TestPlanInfo.prototype._bindEvents = function () {
        this.$container.on('keyup paste change', 'textarea, input', this._events.onFieldChanged.bind(this));
    };

    TestPlanInfo.prototype._events = {
        onFieldChanged: function () {
            this.trigger(this._eventNames.changed);
        }
    };

    TestPlanInfo.prototype.reDraw = function (settings, localData, serverData) {
        const TestPlanInfo = localData && localData.group;
        const localRevision = (TestPlanInfo && TestPlanInfo.rev) || '';
        const serverTestPlanInfo = serverData && serverData.group;
        const serverRevision = (serverTestPlanInfo && serverTestPlanInfo.rev) || '';
        //this.groupId = (TestPlanInfo && TestPlanInfo.id) || '';
        this.settings = settings;
        this.groupRevision = serverRevision || localRevision;
        //this.$container.html('');
        //console.log( this.$container);
        this.$container.append(this._getTestPlanInfoRowsHtml(settings.plan, TestPlanInfo, serverTestPlanInfo));
        //console.log( this.$container);
        //this.$container.append(this._getTestCasesBlockHtml(serverData || localData));
        this.$container.find('[data-toggle="tooltip"]').tooltip();
        this.trigger(this._eventNames.changed);
    };

    TestPlanInfo.prototype.showDifference = function (serverData) {
        if (serverData.group && serverData.group.rev && serverData.group.rev !== this.groupRevision) {
            const localData = {group: this.getData()};
            this.reDraw(this.settings, localData, serverData, true);
        }
    };

    TestPlanInfo.prototype.removedOnServer = function () {
        services.Notification.static(this._msgRemovedFromServer, 'danger');
        this.groupId = '';
        this.groupRevision = '';
    };
	
	TestPlanInfo.prototype.getToday = function() {
		var today = new Date();
		var day = today.getDate();
		var month = today.getMonth()+1;
		var year = today.getFullYear();
		console.log(day,month,year);
		return (day+'/'+month+'/'+year);
	};

    TestPlanInfo.prototype.getData = function () {
		var creationDate = this.getToday();
        let testPlanData = {
			name :'',
			description :'',
			cdate : creationDate
		};
        for (let rowParam of this.settings.plan.header.rows){
			if (rowParam.code != 'cdate')
				testPlanData[rowParam.code] = this._getCellValue(this.$container.find('#testPlanHeaderRows'), rowParam.code);
		}
        return testPlanData;
    };

    /**
     * Generates HTML for the group done input fields
     *
     * @param groupParams Input field settings done about Group
     * @param TestPlanInfo Data from a local-saved group is supplied in the input fields
     * @param serverTestPlanInfo Server version data for the group, used to display the difference, when editing a non-latest version
     * @returns {string}
     * @private
     */
    TestPlanInfo.prototype._getTestPlanInfoRowsHtml = function (groupParams, TestPlanInfo, serverTestPlanInfo) {
        TestPlanInfo = TestPlanInfo || {};
        serverTestPlanInfo = serverTestPlanInfo || {};
        const merge = TestPlanInfo.rev && serverTestPlanInfo.rev && TestPlanInfo.rev !== this.groupRevision;
        let rowsHtml = '';
        for (let rowParam of groupParams.header.rows) {
            if (rowParam.inInputs) {
                const localValue = TestPlanInfo.headerValues && TestPlanInfo.headerValues[rowParam.code] || '';
                const serverValue = serverTestPlanInfo.headerValues && serverTestPlanInfo.headerValues[rowParam.code] || '';
                const mergeConflict = merge && localValue !== serverValue;
                const message = this._msgMergeConflict + (serverValue ? this._msgActualFieldValue + serverValue : this._msgServerFieldEmpty);
				if (rowParam.code != 'cdate')
				rowsHtml += utils.HtmlGenerator.generateHtmlRow(mergeConflict,rowParam,localValue);
            }
        }
        return (utils.HtmlGenerator.generateTestPlanHeaderRows(rowsHtml));
    };

    /**
     * Generates an HTML block with a list of test case members in a group
     *
     * @param groupData Group data and all of its test case
     * @returns {string} Generated HTML block
     * @private
     */
    TestPlanInfo.prototype._getTestCasesBlockHtml = function (groupData) {
        const TestPlanInfo = (groupData && groupData.group) || {};
        const testCases = (groupData && groupData.testCases) || {};
        if (!testCases || !TestPlanInfo.testCases || TestPlanInfo.testCases.length <= 0) 
            return utils.HtmlGenerator.generateMessage(this.msgNoOneTestSelected);
        const $casesContainer = $('<div></div>');
        for (let testCaseId of TestPlanInfo.testCases) {
            const testCase = testCases[testCaseId];
            if (testCase) {
                let html = '';
                for (let rowParam of testCase.settings.tests.header.rows) 
					html+= utils.HtmlGenerator.generateTestCaseRow(rowParam,testCase);	
				var generatedTestCase = utils.HtmlGenerator.generateTestCase(testCase,html);
				$casesContainer.append(generatedTestCase);
            }
        }
        $casesContainer.sortable({
            items: ">.draggable",
            update: () => {
                this.trigger(this._eventNames.testCasesReordered, {
                    testCases: $.map(this.$container.find('.js-test-case-item'), (obj) => $(obj).data('testCaseId')),
                    id: this.groupId,
                    rev: this.groupRevision
                });
                this.trigger(this._eventNames.changed);
            }
        });
		var testCaseMessage = utils.HtmlGenerator.generateChangingOrderMessage(this._msgTestCasesTooltip);
        const $casesBlockContainer = $(testCaseMessage);
        $casesBlockContainer.append($casesContainer);
        return $casesBlockContainer;
    };

    TestPlanInfo.prototype._getCellValue = function ($container, code) {
        return ($container.find(`[data-cell-code="${code}"]`).val() || '').trim();
    };

})(window, window.ru.belyiz.patterns.AbstractEntityInfoWidget, window.ru.belyiz.utils);
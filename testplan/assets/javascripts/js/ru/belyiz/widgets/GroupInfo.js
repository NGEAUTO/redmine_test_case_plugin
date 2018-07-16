/** @namespace window.ru.belyiz.widgets.GroupInfo */

(function (global, Pattern, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.GroupInfo', GroupInfo);
    Pattern.extend(GroupInfo);

    /**
     * @constructor
     */
    function GroupInfo(setup) {
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

    GroupInfo.prototype._bindEvents = function () {
        this.$container.on('keyup paste change', 'textarea, input', this._events.onFieldChanged.bind(this));
    };

    GroupInfo.prototype._events = {
        onFieldChanged: function () {
            this.trigger(this._eventNames.changed);
        }
    };

    GroupInfo.prototype.reDraw = function (settings, localData, serverData) {
        const groupInfo = localData && localData.group;
        const localRevision = (groupInfo && groupInfo.rev) || '';
        const serverGroupInfo = serverData && serverData.group;
        const serverRevision = (serverGroupInfo && serverGroupInfo.rev) || '';
        this.groupId = (groupInfo && groupInfo.id) || '';
        this.settings = settings;
        this.groupRevision = serverRevision || localRevision;
        this.$container.html('');
        this.$container.append(this._getGroupInfoRowsHtml(settings.groups, groupInfo, serverGroupInfo));
        this.$container.append(this._getTestCasesBlockHtml(serverData || localData));
        this.$container.find('[data-toggle="tooltip"]').tooltip();
        this.trigger(this._eventNames.changed);
    };

    GroupInfo.prototype.showDifference = function (serverData) {
        if (serverData.group && serverData.group.rev && serverData.group.rev !== this.groupRevision) {
            const localData = {group: this.getData()};
            this.reDraw(this.settings, localData, serverData, true);
        }
    };

    GroupInfo.prototype.removedOnServer = function () {
        services.Notification.static(this._msgRemovedFromServer, 'danger');
        this.groupId = '';
        this.groupRevision = '';
    };

    GroupInfo.prototype.getData = function () {
        let groupData = {
            id: this.groupId,
            rev: this.groupRevision,
            settings: this.settings,
            headerValues: {},
            testCases: []
        };
        for (let rowParam of this.settings.groups.header.rows)
            groupData.headerValues[rowParam.code] = this._getCellValue(this.$container.find('#groupHeaderRows'), rowParam.code);
        for (let item of this.$container.find('.js-test-case-item')) {
            const $item = $(item);
            groupData.testCases.push($item.data('testCaseId'));
        }
        return groupData;
    };

    /**
     * Generates HTML for the group done input fields
     *
     * @param groupParams Input field settings done about Group
     * @param groupInfo Data from a local-saved group is supplied in the input fields
     * @param serverGroupInfo Server version data for the group, used to display the difference, when editing a non-latest version
     * @returns {string}
     * @private
     */
    GroupInfo.prototype._getGroupInfoRowsHtml = function (groupParams, groupInfo, serverGroupInfo) {
        groupInfo = groupInfo || {};
        serverGroupInfo = serverGroupInfo || {};
        const merge = groupInfo.rev && serverGroupInfo.rev && groupInfo.rev !== this.groupRevision;
        let rowsHtml = '';
        for (let rowParam of groupParams.header.rows) {
            if (rowParam.inInputs) {
                const localValue = groupInfo.headerValues && groupInfo.headerValues[rowParam.code] || '';
                const serverValue = serverGroupInfo.headerValues && serverGroupInfo.headerValues[rowParam.code] || '';
                const mergeConflict = merge && localValue !== serverValue;
                const message = this._msgMergeConflict + (serverValue ? this._msgActualFieldValue + serverValue : this._msgServerFieldEmpty);
                rowsHtml += utils.HtmlGenerator.generateHtmlRow(mergeConflict,rowParam,localValue);
            }
        }
        return (utils.HtmlGenerator.generateGroupHeaderRows(rowsHtml));
    };

    /**
     * Generates an HTML block with a list of test case members in a group
     *
     * @param groupData Group data and all of its test case
     * @returns {string} Generated HTML block
     * @private
     */
    GroupInfo.prototype._getTestCasesBlockHtml = function (groupData) {
        const groupInfo = (groupData && groupData.group) || {};
        const testCases = (groupData && groupData.testCases) || {};
        if (!testCases || !groupInfo.testCases || groupInfo.testCases.length <= 0) 
            return utils.HtmlGenerator.generateMessage(this.msgNoOneTestSelected);
        const $casesContainer = $('<div></div>');
        for (let testCaseId of groupInfo.testCases) {
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

    GroupInfo.prototype._getCellValue = function ($container, code) {
        return ($container.find(`[data-cell-code="${code}"]`).val() || '').trim();
    };

})(window, window.ru.belyiz.patterns.AbstractEntityInfoWidget, window.ru.belyiz.utils);
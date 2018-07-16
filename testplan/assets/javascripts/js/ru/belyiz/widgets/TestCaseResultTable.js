/** @namespace window.ru.belyiz.widgets.TestCaseResultTable */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestCaseResultTable', TestCaseResultTable);
    Pattern.extend(TestCaseResultTable);

    /**
     * A widget to generate a reporting table of test case and group data
     * @constructor
     */
    function TestCaseResultTable(setup) {
        setup = setup || {};
        this.$container = $(setup.container);
    }

    /**
     * Redraws the entire HTML widget
     * @param testCases List of test case
     * @param group Group data
     */
    TestCaseResultTable.prototype.reDraw = function (testCases, group) {
        let html = '';
        if (group) html += this._getGroupHtml(group.settings, group.headerValues);
        if (testCases) {
            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                html += this._getTestCaseHtml(testCase.settings, testCase.headerValues, testCase.blocksValues);
                if (i < testCases.length - 1)
                    html += this._getTestCasesSeparatorHtml(testCase.settings.totalColumnsInRow);
            }
        }
        //this.$container.html(html);
    };

    /**
     * Generates HTML tables with data from the test case group
     * @param settings Application settings
     * @param headerValues Group header field values
     * @returns {string}
     * @private
     */
    TestCaseResultTable.prototype._getGroupHtml = function (settings, headerValues = {}) {
        let html = '';
        const rows = settings.groups.header.rows;
        if (rows && rows.length) {
			html += utils.HtmlGenerator.generateColumnHtml(settings, 'Group');
            html += this._getHeaderRowHtml(settings, 'groups', headerValues);
            html += this._getTestCasesSeparatorHtml(settings.totalColumnsInRow);
			html += utils.HtmlGenerator.generateColumnHtml(settings, 'Test case');
        }
        return html;
    };
	
    /**
     * Generates HTML table with the test case data
     * @param settings Application settings
     * @param headerValues field values of the test case header
     * @param blocksValues Data block field values of the test case
     * @returns {string}
     * @private
     */
    TestCaseResultTable.prototype._getTestCaseHtml = function (settings, headerValues, blocksValues) {
        let html = this._getHeaderRowHtml(settings, 'testCasesExe', headerValues);
        for (let blockParams of settings.testCaseExe.blocks) {
			html += utils.HtmlGenerator.generateColumnHtml(settings, blockParams.title);
            html += utils.HtmlGenerator.generateTableForBlock(blockParams, blocksValues[blockParams.code], settings.markdown, false);
        }
        return html;
    };

    /**
     * Generates HTML tables with entity header data
     * @param settings Application settings
     * @param entityType Entity type
     * @param headerValues Entity header field values
     * @returns {string}
     * @private
     */
    TestCaseResultTable.prototype._getHeaderRowHtml = function (settings, entityType, headerValues) {
		if (entityType == 'testCasesExe') entityType='testCaseExe';
        let html = '';
        let headerParams = settings[entityType].header;
        for (let rowParam of headerParams.rows) {
            if (rowParam.inResult) {
                let value = headerValues[rowParam.code];
                if (settings.markdown) value = utils.TextUtils.markdownToHtml(value);
                else value = utils.TextUtils.brakesForExcelFix(value);
                html += utils.HtmlGenerator.generateTableHeaderData(headerParams, rowParam, settings, value);
            }
        }
        return html;
    };

    /**
     * Generates a separator HTML between the test case in the Otchetnjo table
     * @param columnsCount Number of columns in the reporting table
     * @returns {string}
     * @private
     */
    TestCaseResultTable.prototype._getTestCasesSeparatorHtml = function (columnsCount) {
        const brForExcel = '<br style="mso-data-placement:same-cell;" />';
        return (utils.HtmlGenerator.generateHtmlSeparator(columnsCount, brForExcel)); 
    };

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);
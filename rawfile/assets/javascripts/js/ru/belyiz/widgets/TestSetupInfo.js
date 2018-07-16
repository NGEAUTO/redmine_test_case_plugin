/** @namespace window.ru.belyiz.widgets.TestSetupInfo */

(function (global, Pattern, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestSetupInfo', TestSetupInfo);
    Pattern.extend(TestSetupInfo);

    /**
     * @constructor
     */
    function TestSetupInfo(setup) {
        setup = setup || {};
        this.$container = $(setup.container);
        this.settings = {};
        this.testSetupId = '';
        this.testSetupRevision = '';
        this.msgNoOneTestSelected = 'There is no test case in the group';
        this._msgMergeConflict = 'The data on the server has changed.';
        this._msgServerFieldEmpty = 'The value of this field has been deleted.';
        this._msgActualFieldValue = 'Current text: \n';
        this._msgRemovedFromServer = 'The group you are editing was deleted from the server. If you save your changes, it is equivalent to creating a new change.';
        this._msgTestCasesTooltip = 'Changing the order of the test case is automatically saved, and you do not have to click Save Changes.';
        this.imagesPath = "E:\\";
		this._eventHandlers = {};
        this._eventNames = {
            testCasesReordered: 'testCasesReordered',
            changed: 'changed',
        };
    }

    TestSetupInfo.prototype._bindEvents = function () {
        this.$container.on('keyup paste change', 'textarea', 'input', this._events.onFieldChanged.bind(this));
    };

    TestSetupInfo.prototype._events = {
        onFieldChanged: function () {
            this.trigger(this._eventNames.changed);
        }
    };

    TestSetupInfo.prototype.reDraw = function (settings, localData, serverData) {
        const TestSetupInfo = localData;
        const localRevision = (TestSetupInfo && TestSetupInfo.rev) || '';
        const serverTestSetupInfo = serverData && serverData.group;
        const serverRevision = (serverTestSetupInfo && serverTestSetupInfo.rev) || '';
        this.setupId = (TestSetupInfo && TestSetupInfo.id) || '';
        this.settings = settings;
        this.setupRevision = serverRevision || localRevision;
        this.$container.html('');
        this.$container.append(this._getTestSetupInfoRowsHtml(settings.testSetup, TestSetupInfo, serverTestSetupInfo));
		this.executeScript();
        this.$container.find('[data-toggle="tooltip"]').tooltip();		
        this.trigger(this._eventNames.changed);
    };
	
	TestSetupInfo.prototype.executeScript = function () {
		$('.single-item').slick();
    };
	
    TestSetupInfo.prototype.showDifference = function (serverData) {
        if (serverData.group && serverData.group.rev && serverData.group.rev !== this.groupRevision) {
            const localData = {group: this.getData()};
            this.reDraw(this.settings, localData, serverData, true);
        }
    };

    TestSetupInfo.prototype.removedOnServer = function () {
        services.Notification.static(this._msgRemovedFromServer, 'danger');
        this.setupId = '';
        this.setupRevision = '';
    };

    TestSetupInfo.prototype.getData = function () {
        let testSetupData = {
            id: this.testSetupId,
            rev: this.testSetupRevision,
            settings: this.settings,
            name: '',
			description : '',
			file : '',
			current : '',
            attachmentId : '',
			file_object: ''
        };
        for (let rowParam of this.settings.testSetup.header.rows) {
			if (rowParam.code == "file"){
			
				testSetupData.file_object = $('#uploadFile')[0].files[0];
		
				testSetupData[rowParam.code] = document.getElementById("uploadFile").value;
				}
			else testSetupData[rowParam.code] = this._getCellValue(this.$container.find('#testSetupHeaderRows'), rowParam.code);
        }
		testSetupData.current = document.getElementById("uploadedFile").name ;
		testSetupData.id = this.setupId;
		testSetupData.rev = this.setupRevision;
		/**
		*	setting the test setup image Id to the test setup's name with '_image' as a suffix
		*/
		testSetupData.attachmentId = testSetupData.name + '_image';
		/**
		* The browser prevents getting the real path to a file for security reasons
		* The files to upload are under E:\ 
		*/
		if (testSetupData.file == '') testSetupData.file = testSetupData.current;
		else testSetupData.file = testSetupData.file.replace("C:\\fakepath\\", this.imagesPath);
        return testSetupData;
    };

    /**
     * Generates HTML for the group done input fields
     *
     * @param groupParams Input field settings done about Group
     * @param TestSetupInfo Data from a local-saved group is supplied in the input fields
     * @param serverTestSetupInfo Server version data for the group, used to display the difference, when editing a non-latest version
     * @returns {string}
     * @private
     */
    TestSetupInfo.prototype._getTestSetupInfoRowsHtml = function (testSetupParams, TestSetupInfo, serverTestSetupInfo) {
        TestSetupInfo = TestSetupInfo || {};
        serverTestSetupInfo = serverTestSetupInfo || {};
        const merge = TestSetupInfo.rev && serverTestSetupInfo.rev && TestSetupInfo.rev !== this.groupRevision;
        let rowsHtml = '';
        for (let rowParam of testSetupParams.header.rows) {
            if (rowParam.inInputs) {
                const localValue = TestSetupInfo && TestSetupInfo[rowParam.code] || '';
                const serverValue = serverTestSetupInfo && serverTestSetupInfo[rowParam.code] || '';
                const mergeConflict = merge && localValue !== serverValue;
                const message = this._msgMergeConflict + (serverValue ? this._msgActualFieldValue + serverValue : this._msgServerFieldEmpty);
				if (rowParam.name == "File"){
				/**
				* calling HtmlGenerator to create the upload area and display an attachement if it exists
				*/
				rowsHtml += utils.HtmlGenerator.generateUploadRow(mergeConflict, rowParam, localValue);
				rowsHtml += utils.HtmlGenerator.generateUploadedRow(mergeConflict, rowParam, TestSetupInfo);
				}else rowsHtml += utils.HtmlGenerator.generateHtmlRow(mergeConflict,rowParam,localValue);
            }
        }
        return (utils.HtmlGenerator.generateTestSetupHeaderRows(rowsHtml));
    };

    TestSetupInfo.prototype._getCellValue = function ($container, code) {
        return ($container.find(`[data-cell-code="${code}"]`).val() || '').trim();
    };

})(window, window.ru.belyiz.patterns.AbstractEntityInfoWidget, window.ru.belyiz.utils);
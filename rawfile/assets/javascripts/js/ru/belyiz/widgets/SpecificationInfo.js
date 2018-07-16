/** @namespace window.ru.belyiz.widgets.SpecificationInfo */

(function (global, Pattern, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.SpecificationInfo', SpecificationInfo);
    Pattern.extend(SpecificationInfo);

    /**
     * @constructor
     */
    function SpecificationInfo(setup) {
        setup = setup || {};
        this.$container = $(setup.container);
        this.settings = {};
        this.specificationId = '';
        this.specificationRevision = '';
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

    SpecificationInfo.prototype._bindEvents = function () {
        this.$container.on('keyup paste change', 'textarea', 'input', this._events.onFieldChanged.bind(this));
    };

    SpecificationInfo.prototype._events = {
        onFieldChanged: function () {
            this.trigger(this._eventNames.changed);
        }
    };

    SpecificationInfo.prototype.reDraw = function (settings, localData, serverData) {
        const specificationInfo = localData ;
        const localRevision = (specificationInfo && specificationInfo.data.rev) || '';
        const serverSpecificationInfo = serverData && serverData.specification;
        const serverRevision = (serverSpecificationInfo && serverSpecificationInfo.rev) || '';
        this.specificationId = (specificationInfo && specificationInfo.id) || '';
        this.settings = settings;
        this.specificationRevision = serverRevision || localRevision;
        this.$container.html('');
		this.$container.append(this._getSpecificationInfoRowsHtml(settings, specificationInfo, serverSpecificationInfo));
        this.$container.append(this._getRequirementsBlockHtml(serverData || localData));
        this.$container.find('[data-toggle="tooltip"]').tooltip();
        this.trigger(this._eventNames.changed);
    };

    SpecificationInfo.prototype.showDifference = function (serverData) {
        if (serverData.specification && serverData.specification.rev && serverData.specification.rev !== this.specificationRevision) {
            const localData = {specification: this.getData()};
            this.reDraw(this.settings, localData, serverData, true);
        }
    };

    SpecificationInfo.prototype.removedOnServer = function () {
        services.Notification.static(this._msgRemovedFromServer, 'danger');
        this.specificationId = '';
        this.specificationRevision = '';
    };
	
	/**
	* Retreiving input Data from the view
	*/
    SpecificationInfo.prototype.getData = function () {
		let requirement = {
			name : '',
			description : ''
		};
        let specificationData = {
            id: this.specificationId,
            rev: this.specificationRevision,
            settings: this.settings,
            requirements : ''
        };
		var specRows = this.settings.specification.header.rows;
        for (let rowParam of specRows) 
            requirement[rowParam.code] = this._getCellValue(this.$container.find('#specificationHeaderRows'), rowParam.code);
		specificationData.requirements = requirement;
        return specificationData;
    };

     /** 
	 * Generates HTML for the specification done input fields
     * @param specificationParams Input field settings done about Group
     * @param specificationInfo Data from a local-saved specification is supplied in the input fields
     * @param serverSpecificationInfo Server version data for the specification, used to display the difference, when editing a non-latest version
     * @returns {string}
     * @private
     */
    SpecificationInfo.prototype._getSpecificationInfoRowsHtml = function (specificationParams, specificationInfo, serverSpecificationInfo) {
		specificationInfo = specificationInfo || {};
        serverSpecificationInfo = serverSpecificationInfo || {};
        const merge = specificationInfo.rev && serverSpecificationInfo.rev && specificationInfo.rev !== this.specificationRevision;
        let rowsHtml = '';
        for (let rowParam of specificationParams.specification.header.rows) {
            if (rowParam.inInputs)
				var localInitValue;
				if (specificationInfo.data !== undefined) { localInitValue = specificationInfo.data.requirements[rowParam.code];}
				else { localInitValue = '';}
				const localValue = localInitValue;
				var serverInitValue;
				if (serverSpecificationInfo.data !== undefined) { serverInitValue = serverSpecificationInfo.data.requirements[rowParam.code];}
				else { serverInitValue = '';}
				const serverValue = serverInitValue;
                const mergeConflict = merge && localValue !== serverValue;
                const message = this._msgMergeConflict + (serverValue ? this._msgActualFieldValue + serverValue : this._msgServerFieldEmpty);
                rowsHtml += utils.HtmlGenerator.generateHtmlRow(mergeConflict,rowParam,localValue);
        }
        return (utils.HtmlGenerator.generateSpecificationHeaderRows(rowsHtml));
    };

    /**
     * Generates an HTML block with a list of test case members in a specification
     *
     * @param specificationData Group data and all of its test case
     * @returns {string} Generated HTML block
     * @private
     */
    SpecificationInfo.prototype._getRequirementsBlockHtml = function (specificationData) {
        const specificationInfo = (specificationData && specificationData.specification) || {};
        const requirements = (specificationData && specificationData.requirements) || {};
        if (!requirements || !specificationInfo.requirements || specificationInfo.requirements.length <= 0) {
            var message = this.msgNoOneTestSelected;
            return utils.HtmlGenerator.generateMessage(message);
        }
        const $casesContainer = $('<div></div>');
        for (let requirement of specificationInfo.requirements) {
            const requirement = requirements[requirementId];
            if (requirement) {
                let html = '';
                for (let rowParam of specification.settings.header.rows) 
					html+= utils.HtmlGenerator.generateRequirementRow(rowParam,specification);
				var generatedRequirement = utils.HtmlGenerator.generateRequirement(requirement,html);
				$casesContainer.append(generatedRequirement);
            }
        }
        $casesBlockContainer.append($casesContainer);
        return $casesBlockContainer;
    };

    SpecificationInfo.prototype._getCellValue = function ($container, code) {
        return ($container.find(`[data-cell-code="${code}"]`).val() || '').trim();
    };
	
})(window, window.ru.belyiz.patterns.AbstractEntityInfoWidget, window.ru.belyiz.utils);
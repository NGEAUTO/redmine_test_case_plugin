/** @namespace window.ru.belyiz.widgets.TestingSteps */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.TestingSteps', TestingSteps);
    Pattern.extend(TestingSteps);

    /**
     * Widget for the pass through test case or group
     * @constructor
     */
    function TestingSteps(setup) {
        setup = setup || {};
		this.imagesPath = "D:\\";
        this.$container = $(setup.container);
        this.testCasesService = setup.entityService;
        this.testCases = [];
        this.group = null;
        this._msgMergeConflict = 'The data on the server has changed.';
        this._msgTestCaseNotSelected = 'Select a test case or group from the list on the left';
        this._msgNoneSteps = 'No steps created';
        this._textComment = 'Comment';
        this._textSuccess = 'Executed';
        this._textFail = 'Failed';
        this._textBlocked = 'Blocked';
        this._textStepBlocked = 'Test failed-Step blocked';
        this._textPreviousStep = 'Previous step';
        this._textNextStep = 'Next step';
        this._textStep = 'Step';
        this._textStepFrom = 'Of';
        this._eventHandlers = {};
        this._eventNames = {
            changed: 'changed',
        };
    }

    TestingSteps.prototype._bindEvents = function () {
        this.$container.on('click', '.js-carousel-control', this._events.onCarouselControlClick.bind(this));
        this.$container.on('click', '.js-step-result', this._events.onStepResultClick.bind(this));
        this.$container.on('change', '.js-step-result-comment', this._events.onStepResultCommentChanged.bind(this));
    };

    TestingSteps.prototype._events = {
        onCarouselControlClick: function (e) {
            const $target = $(e.currentTarget);
            const $carousel = $target.closest('.js-test-case-steps-carousel');
            const action = $target.data('action');
            const $activeSlide = $carousel.find('.js-testing-step.active');
            if (action === 'prev' && $activeSlide.is(':first-child') ||
                action === 'next' && $activeSlide.is(':last-child')) {
                return;
            }
            $carousel.carousel(action);
        },

        onStepResultClick: function (e) {
            const $target = $(e.currentTarget);
            const success = $target.data('success');
            $target
                .addClass(success ? 'btn-success' : 'btn-danger')
                .closest('.js-testing-step').data('status', success ? this._textSuccess : this._textFail).end()
                .siblings('.js-step-result').removeClass('btn-success btn-danger').addClass('btn-secondary');
            const $stepsCarousel = $target.closest('.js-test-case-steps-carousel');
            this._markStepsAsBlocked($stepsCarousel);
            this._showTestCaseStatus($stepsCarousel);
            this.trigger(this._eventNames.changed);
        },

        onStepResultCommentChanged: function () {
            this.trigger(this._eventNames.changed);
        }
    };

    /**
     * Makes the steps in the test case available, depending on the outcome of the previous ones.
     * After the failed step, all others are blocked and the test is marked as failed.
     * @param stepsCarousel The carousel with the steps of the test case
     * @private
     */
    TestingSteps.prototype._markStepsAsBlocked = function (stepsCarousel) {
        let afterFailedStep = false;
        stepsCarousel.find('.js-testing-step').each((i, obj) => {
            const $step = $(obj);
            if (afterFailedStep) {
                $step.data('status', this._textBlocked)
                    .find('textarea').prop('disabled', true).val('').end()
                    .find('.js-step-result').hide().end()
                    .find('.js-step-blocked-text').show();
            } else if ($step.data('status') === this._textFail) {
                afterFailedStep = true;
            } else if ($step.data('status') === this._textBlocked) {
                $step.data('status', '')
                    .find('textarea').prop('disabled', false).end()
                    .find('.js-step-result').removeClass('btn-success btn-danger').show().end()
                    .find('.js-step-blocked-text').hide();
            }
        });
    };

    /**
     * Calculates and shows the status of the entire test case. The statuses can be:
     * If at least one of the steps is failing,
     * Tested-If there are pending steps
     * Executed-If all steps have been completed
     * @param stepsCarousel The carousel with the steps of the test case
     * @private
     */
    TestingSteps.prototype._showTestCaseStatus = function (stepsCarousel) {
        const $steps = stepsCarousel.find('.js-testing-step');
        const $statusField = stepsCarousel.closest('.card').find('.js-test-case-result');
        const $statusIcon = $statusField.find('.fa');
        $statusField.removeClass('bg-success bg-info bg-danger');
        $statusIcon.removeClass('fa-hourglass-half fa-thumbs-up fa-thumbs-down');
        if ($steps.filter((i, obj) => $(obj).data('status') === this._textFail).length) {
            $statusField.addClass('bg-danger');
            $statusIcon.addClass('fa-thumbs-down');
            this._showNextTestCase(stepsCarousel.closest('.card'));
        } else if ($steps.filter((i, obj) => $(obj).data('status') === this._textSuccess).length === $steps.length) {
            $statusField.addClass('bg-success');
            $statusIcon.addClass('fa-thumbs-up');
            this._showNextTestCase(stepsCarousel.closest('.card'));
        } else {
            $statusField.addClass('bg-info');
            $statusIcon.addClass('fa-hourglass-half');
        }
    };

    /**
     * Hides the current test case and opens the next
     * @param testCaseCard Current test Case Card
     * @private
     */
    TestingSteps.prototype._showNextTestCase = function (testCaseCard) {
        testCaseCard
            .find('.collapse').collapse('hide').end()
            .next('.card')
            .find('.collapse').collapse('show');
    };

    TestingSteps.prototype.reDraw = function (entity = null, attachmentsValue=[]) {
        this.$container.html('');
        this.group = entity && entity.group ? entity.group : null;
        this.testCases = entity ? (entity.group ? entity.sortedTestCases : [entity]) : [];
        if (this.testCases.length) {
            let $accordion = $('<div id="testingStepsAccordion" role="tablist" aria-multiselectable="false"></div>');
            for (let testCase of this.testCases) {
                $accordion.append(this._getTestCaseHTML(testCase, !$accordion.children().length, attachmentsValue));
            }
            this.$container.append($accordion);
            $('.js-test-case-steps-carousel').carousel({
                ride: false,
                keyboard: true,
                interval: false,
            });
        } else {
            this.$container.append(utils.HtmlGenerator.generateTestCaseAlertMessage(this._msgTestCaseNotSelected));
        }
        this.trigger(this._eventNames.changed);
    };

    /**
     * Collects the latest test data for the entire test case/group
     * @returns {{testCases: *, group: *, testingResult: {}}}
     */
    TestingSteps.prototype.getData = function () {
        const entireTestingResult = {
            testCases: this.testCases,
            group: this.group,
            testingResult: {}
        };
        $('.js-test-case-steps-carousel').each((i, obj) => {
			entireTestingResult.testCases[i].logfile = (document.getElementById("logUploadFile-"+entireTestingResult.testCases[i].headerValues.name).value).replace("C:\\fakepath\\", this.imagesPath);
			entireTestingResult.testCases[i].file_object = $("#logUploadFile-"+entireTestingResult.testCases[i].headerValues.name)[0].files[0];
			console.log(entireTestingResult.testCases[i]);
			let testingResult = {};
            const $carousel = $(obj);
            $carousel.find('.js-testing-step').each((j, obj) => {
				
				var uploadValue = document.getElementById("stepUploadFile-"+j).value.replace("C:\\fakepath\\", this.imagesPath);
				var uploadedValue = document.getElementById("stepUploadedFile-"+j).value.replace("C:\\fakepath\\", this.imagesPath);
				
				var thumbsResult = '';
                const $step = $(obj);
                testingResult[$step.data('blockCode')] = testingResult[$step.data('blockCode')] || {};
					console.log($("#stepUploadFile-"+j)[0].files[0]);
                testingResult[$step.data('blockCode')][$step.data('blockItemPosition')] = {
                    result: $step.data('status') || 'Not Tested',
                    comment: $step.find('.js-step-result-comment').val(),
					screenshot: (document.getElementById("stepUploadFile-"+j).value).replace("C:\\fakepath\\", this.imagesPath),
                    file_object: $("#stepUploadFile-"+j)[0].files[0]
				}
				//if new ! exist and old exist: delete screenshot to not create the same scrrenshot
				if (uploadValue == '' && uploadedValue != '') 
					delete testingResult[$step.data('blockCode')][$step.data('blockItemPosition')].screenshot;
            });
            entireTestingResult.testingResult[$carousel.data('testCaseId')] = testingResult;
        });
        return entireTestingResult;
    };

    /**
     * Generates HTML to pass through the test case
     * @param testCase Test Case Data
     * @param expanded Indicator showing whether the block should be displayed immediately after initialization
     * @returns {string}
     * @private
     */
    TestingSteps.prototype._getTestCaseHTML = function (testCase, expanded = false, attachmentsValue) {
        let stepsHtml = '';
        const steps = this._getAllSteps(testCase);
        const stepsEmptyHtml = utils.HtmlGenerator.generateAlertMessage(this._msgNoneSteps);
        for (let i = 0; i < steps.length; i++)
            stepsHtml += this._getStepHtml(testCase.blocksValues.results, steps[i], i + 1, steps.length,attachmentsValue);
		var headerRowsHtml= this._getHeaderRowsHtml(testCase);
		var notExecutableBlocksHtml = this._getNotExecutableBlocksHtml(testCase);
		var logfileParam = ({code : "logfile" , name : "LogFile", inInputs : true, inResults : true});
		var file = testCase.file;
		var logFileInput = utils.HtmlGenerator.generateInputFields(logfileParam,testCase.headerValues,file,attachmentsValue);
        return (utils.HtmlGenerator.generateTestCaseHtml(logFileInput,testCase, expanded, headerRowsHtml, notExecutableBlocksHtml, stepsHtml, stepsEmptyHtml));
    };

    /**
     * Extracts the Briefcase test steps from the data, that is, only the data blocks that are marked as executable (executable
     * @param testCase Test Case Data
     * @returns {Array}
     * @private
     */
    TestingSteps.prototype._getAllSteps = function (testCase) {
        let steps = [];
        const blocks = testCase.settings.tests.blocks;
        for (let i = 0; i < blocks.length; i++) {
            const blockParams = blocks[i];
            if (blockParams.executable) {
                const blockValues = testCase.blocksValues[blocks[i].code];
                for (let j = 0; j < blockValues.length; j++) {
                    const rowValues = blockValues[j];
                    steps.push({
                        block: blockParams,
                        values: rowValues,
                        rowInBlockNumber: j,
                        rowsInBlockCount: blockValues.length,
                    });
                }
            }
        }
        return steps;
    };

    /**
     * Generates HTML for table banner input fields
     *
     * @param testCaseInfo Data from the local-saved test case are supplied in the input fields
     * @returns {string}
     * @private
     */
    TestingSteps.prototype._getHeaderRowsHtml = function (testCaseInfo) {
		//console.log(testCaseInfo)
        const headerParams = testCaseInfo.settings.tests.header;
        let rowsHtml = '';
        for (let rowParam of headerParams.rows) {
            if (rowParam.inInputs)
                rowsHtml += utils.HtmlGenerator.generateInputFields(rowParam, testCaseInfo.headerValues,testCaseInfo.headerValues[rowParam.code]);
        }
		var testHeaderRows = utils.HtmlGenerator.generateTestHeaderRows(rowsHtml, false);
        return (testHeaderRows);
    };

    /**
     * Generates HTML for table banner input fields
     *
     * @param testCaseInfo Data from the local-saved test case are supplied in the input fields
     * @returns {string}
     * @private
     */
    TestingSteps.prototype._getNotExecutableBlocksHtml = function (testCaseInfo) {
        let html = '';
        for (let blockParams of testCaseInfo.settings.tests.blocks) {
            const values = testCaseInfo.blocksValues[blockParams.code];
            if (!blockParams.executable)
                html += utils.HtmlGenerator.generateHtmlTableForBlock(blockParams, values, testCaseInfo.settings.markdown);
        }
        return html;
    };

    /**
     * Generates HTML for a single test step
     * @param stepData Test Step data
     * @param stepNumber Step number
     * @param stepsCount Total number of steps in the test case
     * @returns {string}
     * @private
     */
    TestingSteps.prototype._getStepHtml = function (result, stepData, stepNumber, stepsCount, attachments) {
        let blockContent = '';
        for (let columnsParam of stepData.block.columns) {
            if (columnsParam.inInputs)
                blockContent += utils.HtmlGenerator.generateTestStepHtml(columnsParam.name, stepData.values[columnsParam.code]);
        }
        return utils.HtmlGenerator.generateTestStepBlockHtml(result, attachments, stepNumber, stepData.block.code, stepData.rowInBlockNumber,
															stepData.block.title, this._textStepFrom,this._textStepBlocked,
															this._textComment, stepData.rowsInBlockCount, this._textFail,this._textSuccess,
															this._textStep, this._textPreviousStep, this._textNextStep,blockContent, stepsCount);
    };

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);
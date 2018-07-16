/** @namespace window.ru.belyiz.widgets.SettingsModal */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.SettingsModal', SettingsModal);
    Pattern.extend(SettingsModal);

    /**
     * @constructor
     */
    function SettingsModal() {
        this._eventHandlers = {};
        this._eventNames = {
            save: 'save'
        };
    }

    SettingsModal.prototype._html = utils.HtmlGenerator.generateModalFace();

    SettingsModal.prototype._cacheElements = function () {
        this.$modal = $(this._html);
        this.$settingsArea = this.$modal.find('textarea.js-settings');
    };

    SettingsModal.prototype._bindEvents = function () {
        this.$modal.on('click', '.js-save-btn', this._events.onSaveClick.bind(this));
        this.$modal.on('shown.bs.modal', () => utils.InputsUtils.resizeTextArea(this.$settingsArea.get(0)));
    };

    SettingsModal.prototype._events = {
        onSaveClick: function () {
            let settingsJson = JSON.parse(this.$settingsArea.val());
            settingsJson.rev = this.$settingsArea.data('rev');
            this.trigger(this._eventNames.save, settingsJson);
            this.$modal.modal('hide');
        }
    };

    /**
     * Create and show dialog for editing settings
     * @param settingsJson current settings json
     */
    SettingsModal.prototype.show = function (settingsJson) {
        let json = $.extend(true, {}, settingsJson);
        delete json.id;
        delete json.rev;
        this.$settingsArea.val(JSON.stringify(json, null, 4));
        utils.InputsUtils.selectRange(this.$settingsArea.get(0), 0);
        this.$settingsArea.data('rev', settingsJson.rev);
        this.$modal.modal('show');
    }

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);
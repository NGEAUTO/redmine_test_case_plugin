/** @namespace window.ru.belyiz.services.Confirmation */

(function (global, Pattern, widgets, utils) {
    'use strict';
    Pattern.extend(Confirmation);

    /**
     * Service to display a modal window asking you to confirm the action.
     * The modal window is one. Inside, the text and content are replaced.
     * The vegetables is added only once in the DOM tree
     * @constructor
     */
    function Confirmation() {
        this.defaultMessages = {
            title: 'Confirmation required',
            text: 'Is that right?',
            applyBtn: 'Reaffirm',
            cancelBtn: 'Cancel',
        };
        this.onApplyCallback = null;
    }

    Confirmation.prototype._init = function () {
        this.modal = new widgets.Modal({
            id: this.id,
            title: this.defaultMessages.title,
            contentHtml: `<p class="js-modal-text">${this.defaultMessages.text}</p>`,
            applyBtnText: this.defaultMessages.applyBtnText,
            cancelBtnText: this.defaultMessages.cancelBtnText,
        }).initialize();
        this.modal.on('apply', this._events.onConfirm, this);
    };

    Confirmation.prototype._events = {
        onConfirm: function () {
            if (typeof (this.onApplyCallback) === 'function')
                this.onApplyCallback();
            this.modal.hide();
        }
    };

    /**
     * Displays the Confirm modal window
     * @param messages Message, That will be inserted into a modal window: {
     *                     title: Window title,
     *                     text:  Message body,
     *                     applyBtn: Confirm button Text,
     *                     cancelBtn: Undo Button Text,
     *                 }
     * @param onApplyCallback
     */
    Confirmation.prototype.show = function (messages, onApplyCallback) {
        messages = $.extend({}, this.defaultMessages, messages);
        this.onApplyCallback = onApplyCallback;
        this.modal
            .setTitle(messages.title)
            .setContentText(messages.text)
            .setApplyBtnText(messages.applyBtn)
            .setCancelBtnText(messages.cancelBtn)
            .show();
    };

    utils.Package.declare('ru.belyiz.services.Confirmation', new Confirmation().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.widgets, window.ru.belyiz.utils);
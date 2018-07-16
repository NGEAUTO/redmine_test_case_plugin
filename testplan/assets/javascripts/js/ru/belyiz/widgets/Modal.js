/** @namespace window.ru.belyiz.widgets.Modal */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.Modal', Modal);
    Pattern.extend(Modal);

    /**
     * @constructor
     */
    function Modal(setup) {
        setup = setup || {};
        this.id = setup.id || '';
        this.title = setup.title || '';
        this.contentHtml = setup.contentHtml || '';
        this.applyBtnText = setup.applyBtnText || 'Apply';
        this.hideApplyBtn = !!setup.hideApplyBtn;
        this.cancelBtnText = setup.cancelBtnText || 'Cancel';
        this.hideCancelBtn = !!setup.hideCancelBtn;
        this.closable = !!setup.closable;
        this._eventHandlers = {};
        this._eventNames = {
            show: 'show',
            hide: 'hide',
            apply: 'apply',
            cancel: 'cancel',
        };
    }

    Modal.prototype._cacheElements = function () {
        this.$modal = $(this._buildModalHtml());
        this.$title = this.$modal.find('.js-modal-title');
        this.$content = this.$modal.find('.js-modal-content');
        this.$applyBtn = this.$modal.find('.js-apply-btn');
        this.$cancelBtn = this.$modal.find('.js-cancel-btn');
        //console.log(this.$modal)
    };

    Modal.prototype._bindEvents = function () {
        this.$modal.on('show.bs.modal', this._events.onShow.bind(this));
        this.$modal.on('hide.bs.modal', this._events.onHide.bind(this));
        this.$modal.on('click', '.js-apply-btn', this._events.onApplyClick.bind(this));
        this.$modal.on('click', '.js-cancel-btn', this._events.onCancelClick.bind(this));
    };

    Modal.prototype._events = {
        onShow: function () {
            //console.log(this._eventNames.show)
            this.trigger(this._eventNames.show);
        },

        onHide: function () {
            //console.log(this._eventNames.show)
            this.trigger(this._eventNames.hide);
        },

        onApplyClick: function () {
            //console.log(this._eventNames.show)
            this.trigger(this._eventNames.apply);
        },

        onCancelClick: function () {
            //console.log(this._eventNames.show)
            this.trigger(this._eventNames.cancel);
        }
    };

    Modal.prototype.show = function () {
        this.$modal.modal('show');
    };

    Modal.prototype.hide = function () {
        this.$modal.modal('hide');
    };

    Modal.prototype.setContentHtml = function (contentHtml) {
        this.$content.html(contentHtml);
    };

    Modal.prototype.setContentText = function (text) {
        this.$content.html($('<p></p>').text(text));
        return this;
    };

    Modal.prototype.setTitle = function (text) {
        this.$title.text(text);
        return this;
    };

    Modal.prototype.setApplyBtnText = function (text) {
        this._setBtnText(this.$applyBtn, text);
        return this;
    };

    Modal.prototype.setCancelBtnText = function (text) {
        this._setBtnText(this.$cancelBtn, text);
        return this;
    };

    Modal.prototype._buildModalHtml = function () {
		return (utils.HtmlGenerator.generateModalHtml(this));
    };

    Modal.prototype._setBtnText = function ($btn, text) {
        (text && $btn.text(text).show()) || $btn.hide();
    };

})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);
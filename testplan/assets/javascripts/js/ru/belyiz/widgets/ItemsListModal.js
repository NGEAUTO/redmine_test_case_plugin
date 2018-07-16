/** @namespace window.ru.belyiz.widgets.ItemsListModal */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.ItemsListModal', ItemsListModal);
    Pattern.extend(ItemsListModal);

    /**
     * @constructor
     *
     * A modal window with the ability to select from a list of items.
     *
     * The list of items can be passed in the constructor in the items parameter, or after initialization by calling the Setitems method (array).
     * Elements can be strings or objects:
     *  {
     *      name - String that the text is displayed to the user,
     *      code - Code that will be stored in the data-item-code attribute
     *  }
     *
     */
    function ItemsListModal(setup) {
        setup = setup || {};
        this.modalId = $.now() + '';
        this.items = setup.items || [];
        this.emptyMsg = setup.emptyMsg || 'There are no available items';
        this.modalSetup = setup;
        this._eventHandlers = {};
        this._eventNames = {
            selected: 'selected',
        };
    }

    ItemsListModal.prototype._cacheElements = function () {
    };

    ItemsListModal.prototype._createWidgets = function () {
        this.modal = new widgets.Modal(this.modalSetup).initialize();
    };

    ItemsListModal.prototype._bindEvents = function () {
        global.nodes.body.on('click', `[data-modal-id="${this.modalId}"] .list-group-item`, this._events.onItemClick.bind(this));
    };

    ItemsListModal.prototype._ready = function () {
        this.setItems(this.items);
    };

    ItemsListModal.prototype._events = {
        onItemClick: function (e) {
            const $target = $(e.currentTarget);
            this.trigger(this._eventNames.selected, {name: $target.text(), code: $target.data('itemCode')});
            this.hide();
        }
    };

    /**
     * You can use this feature to specify the list of items to display.
     * Elements can be strings or objects:
     *  {
     *      name - String that the text is displayed to the user,
     *      code - Code that will be stored in the data-item-code attribute
     *  }
     *
     * @param items (array)
     * @param showOnFinish (boolean) Show or hide a dialog box after inserting values in a list
     */
    ItemsListModal.prototype.setItems = function (items, showOnFinish) {
        let itemsHtml = '';
        for (let item of items)
            itemsHtml += utils.HtmlGenerator.generateHtmlItem(item);
		this.modal.setContentHtml(utils.HtmlGenerator.generateModalItem(this.modalId, itemsHtml, this.emptyMsg));
        if (showOnFinish) 
            this.show();
    };

    ItemsListModal.prototype.show = function () {
        this.modal.show();
    };

    ItemsListModal.prototype.hide = function () {
        this.modal.hide();
    };


})(window, window.ru.belyiz.patterns.Widget, window.ru.belyiz.utils, window.ru.belyiz.widgets);
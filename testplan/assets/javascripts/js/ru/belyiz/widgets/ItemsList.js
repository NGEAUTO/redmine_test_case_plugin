/** @namespace window.ru.belyiz.widgets.ItemsList */

(function (global, Pattern, utils, widgets) {
    'use strict';
    utils.Package.declare('ru.belyiz.widgets.ItemsList', ItemsList);
    Pattern.extend(ItemsList);

    /**
     * @constructor
     */
    function ItemsList(setup) {
        setup = setup || {};
        this.emptyListMsg = setup.emptyListMsg || 'List is empty';
        this.$container = $(setup.container);
        this.multipleSelectionMode = false;
        this.selectedIds = [];
        this._eventHandlers = {};
        this._eventNames = {
            selected: 'selected',
            multipleSelectionModeOn: 'multipleSelectionModeOn',
            multipleSelectionModeOff: 'multipleSelectionModeOff',
            multipleSelected: 'multipleSelected'
        };
    }

    ItemsList.prototype._bindEvents = function () {
        this.$container.on('click', '.js-items-list-item', this._events.onListItemClick.bind(this));
    };

    ItemsList.prototype._events = {
        onListItemClick: function (e) {
            const $target = $(e.currentTarget);
            const id = $target.data('itemId');
            const rev = $target.data('itemRev');
            if (this.multipleSelectionMode) {
                $target.toggleClass('active');
                const isActive = $target.hasClass('active');
                $target.find('.js-checkbox').toggleClass('fa-square-o', !isActive).toggleClass('fa-check-square-o', isActive);
                if (isActive)
                    this.selectedIds.push(id);
                else
                    this.selectedIds = utils.ArraysUtils.removeAllMatches(this.selectedIds, id);
                this.trigger(this._eventNames.multipleSelected, {ids: this.selectedIds});

            } else {
                this.resetSelection();
                $target.addClass('active');
                this.trigger(this._eventNames.selected, {id: id, rev: rev});
            }
        }
    };

	ItemsList.prototype.reDrawRequirements = function (items, representedParams) {
        this.$container.html('');
        const $listGroup = $('<div class="js-items-list list-group"></div>');
        if (items && items.length) {
            for (let item of items) {
                const $itemsContainer = $('<div class="d-inline-block full-width"></div>');
				 $.each(item, (key, value) =>{
						var textItem = utils.HtmlGenerator.generateTextItem(key, value, representedParams);
                        $itemsContainer.append(textItem);
				 });
				var listItem = utils.HtmlGenerator.generateRequirementListItem(item, true);
				const $listGroupItem = $(listItem);
                $listGroupItem.append($itemsContainer);
                $listGroup.append($listGroupItem);
            }
            this.$container.append($listGroup);
        } else {
			var alertMessage = utils.HtmlGenerator.generateAlertMessage(this.emptyListMsg);
			this.$container.html(alertMessage);
        }
    };
	
    ItemsList.prototype.reDraw = function (items, currentItemId, representedParams) {
        this.$container.html('');
        const $listGroup = $('<div class="js-items-list list-group"></div>');
        if (items && items.length) {
            for (let item of items) {
                const $itemsContainer = $('<div class="d-inline-block full-width"></div>');
                $.each(item, (key, value) => {
					if (!key.startsWith('_') && key != 'id' && key != 'rev') {
						var textItem = utils.HtmlGenerator.generateTextItem(key, value, representedParams);
						$itemsContainer.append(textItem);
					}
                });
                const isActive = currentItemId && currentItemId === item.id;
				if(item.applicable == undefined || item.applicable == true){
					var listItem = utils.HtmlGenerator.generateListItem(item, isActive);
					const $listGroupItem = $(listItem);
					$listGroupItem.append($itemsContainer);
					$listGroup.append($listGroupItem);
				}
            }
            this.$container.append($listGroup);
        }else {
			var alertMessage = utils.HtmlGenerator.generateAlertMessage(this.emptyListMsg);
			this.$container.html(alertMessage);
        }
    };
	
    ItemsList.prototype.resetSelection = function () {
        this.$container.find('.js-items-list-item.active').removeClass('active');
        this.$container.find('.js-checkbox').addClass('fa-square-o').removeClass('fa-check-square-o');
    };

})(window, window.ru.belyiz.patterns.ReDrawableWidget, window.ru.belyiz.utils, window.ru.belyiz.widgets);
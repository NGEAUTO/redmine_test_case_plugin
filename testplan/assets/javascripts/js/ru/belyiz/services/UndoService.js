/** @namespace window.ru.belyiz.services.UndoService */
(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(UndoService);

    /**
     * Service to display messages about the opportunity to undo the action you just made.
     * @constructor
     */
    function UndoService() {
        this._undoLinkMsg = 'Return as was';
        this._undoFailed409Msg = 'An action cannot be canceled because someone has already changed the entity.';
        this._undoFailedMsg = 'The action cannot be canceled because there is an error.';

        this._eventHandlers = {};
        this._eventNames = {
            undo: 'undo',
        };
    }

    UndoService.prototype._init = function () {
        global.nodes.body.on('click', '.js-undo-alert', this._events.onUndoClick.bind(this));
        services.DatabaseService.on('dbChanged', this._events.onDatabaseChanged, this);
    };

    UndoService.prototype._events = {
        onUndoClick: function (e) {
            const $target = $(e.currentTarget);
            const id = $target.data('id');
            const rev = $target.data('rev');
            let lastRev = '';
            services.DatabaseService.localDB
                .get(id, {revs: true, revs_info: true, open_revs: 'all'})
                .then(result => {
                    if (rev.indexOf(result[0].ok._revisions.ids[1]) === -1) {
                        // You can only undo the last operation on an entity
                        throw Error({status: 409});
                    }
                    lastRev = result[0].ok._rev;
                    return services.DatabaseService.localDB.get(id, {rev: rev});
                })
                .then(doc => {
                    doc._rev = lastRev;
                    return services.DatabaseService.localDB.put(doc);
                })
                .then(doc => {
                    const id = services.DatabaseService.parseId(doc.id);
                    const type = services.DatabaseService.parseType(doc.id);
                    this.trigger(this._eventNames.undo, {id: id, type: type});

                    $target.closest('.alert').remove();
                })
                .catch(err => {
                    if (err.status === 409) {
                        services.Notification.warning(this._undoFailed409Msg);
                    } else {
                        console.error(err);
                        services.Notification.warning(this._undoFailedMsg);
                    }
                });
        },
        onDatabaseChanged: function () {
            $('.js-undo-alert').closest('.alert').remove();
        },
    };

    /**
     * Shows a message with the option to cancel the action
     * @param text Message body
     * @param id Entity ID
     * @param rev the audit number of the entity to which the changes should be rolled back
     */
    UndoService.prototype.show = function (text, id, rev) {
        const undoLink = utils.HtmlGenerator.generateUndoLink(id,rev,this._undoLinkMsg);
        services.Notification.show(text + undoLink, 'success', 10000);
    };

    utils.Package.declare('ru.belyiz.services.UndoService', new UndoService().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.services, window.ru.belyiz.utils);
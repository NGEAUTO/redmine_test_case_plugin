/** @namespace window.ru.belyiz.services.Notification */

(function (global, Pattern, services, utils) {
    'use strict';
    Pattern.extend(Notification);

    /**
     * @constructor
     */
    function Notification() {
        this.defaultDelay = 500;
    }


    Notification.prototype.show = function (message, type, delay) {
        type = type || 'info';
		var NotificationTemplate = utils.HtmlGenerator.generateNotificationTemplate()
        $.notify({
            message: message,
            icon: false
        }, {
            type: type,
            delay: delay || 0,
            z_index: 1050,
            template: NotificationTemplate,
			
        });
    };

    Notification.prototype.success = function (message) {
        this.show(message, 'success', this.defaultDelay);
    };

    Notification.prototype.warning = function (message) {
        this.show(message, 'warning', this.defaultDelay);
    };

    Notification.prototype.error = function (message) {
        this.show(message, 'danger', 0);
    };

    Notification.prototype.info = function (message) {
        this.show(message, 'info', this.defaultDelay);
    };

    Notification.prototype.static = function (message, type) {
        this.show(message, type, 0);
    };

    utils.Package.declare('ru.belyiz.services.Notification', new Notification().initialize());
})(window, window.ru.belyiz.patterns.Service, window.ru.belyiz.services, window.ru.belyiz.utils);
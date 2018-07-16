/** @namespace window.ru.belyiz.patterns.AbstractEntityService */

/**
 * Parent class for all DAO services
 */
(function (pattern, utils) {
    'use strict';
    AbstractEntityService.prototype = Object.create(pattern.proto);

    utils.Package.declare('ru.belyiz.patterns.AbstractEntityService', {
        extend: function (newService) {
            newService.prototype = Object.create(AbstractEntityService.prototype);
        },
        clazz: AbstractEntityService,
        proto: AbstractEntityService.prototype
    });

    /**
     * @constructor
     *
     * Abstract parent class for all DAO services.
     * Each child class must have a set of base methods and fields:
     * type - Entity type,
     * getEntity() - Get entity by ID
     * saveEntity() - To save an entity to a database
     * removeEntity() - Delete an entity
     * all() - Retrieving all entities with type
     * some() - Gets the list of entities, by list ID
     */
    function AbstractEntityService() {
    }

    AbstractEntityService.prototype.initialize = function () {
        if (!this.type)
            throw('Field type must be defined in class, Inherited from AbstractEntityInfoWidget.');
        if (typeof this.getEntity !== 'function')
            throw('function getEntity() must be defined in class, Inherited from AbstractEntityInfoWidget.');
        if (typeof this.saveEntity !== 'function')
            throw('function saveEntity() must be defined in class, Inherited from AbstractEntityInfoWidget.');
        if (typeof this.removeEntity !== 'function')
            throw('function removeEntity() must be defined in class, Inherited from AbstractEntityInfoWidget.');
        if (typeof this.all !== 'function')
            throw('function all() must be defined in class, Inherited from AbstractEntityInfoWidget.');
        if (typeof this.some !== 'function')
            throw('function some() must be defined in class, Inherited from AbstractEntityInfoWidget.');
        return pattern.proto.initialize.call(this);
    };

})(window.ru.belyiz.patterns.Service, window.ru.belyiz.utils);
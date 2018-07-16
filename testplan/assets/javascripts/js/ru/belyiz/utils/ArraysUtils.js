/** @namespace window.ru.belyiz.utils.ArraysUtils */

(function (global, utils) {
    'use strict';
    utils.Package.declare('ru.belyiz.utils.ArraysUtils', new ArraysUtils());

    /**
     * @constructor
     */
    function ArraysUtils() {
    }

    /**
     * Returns the array element at the specified index, or the default value if the index is out of the bounds of the array
     * @param array An array to select the item
     * @param index The sequence number of the target element in the array
     * @param defaultValue Default value
     */
    ArraysUtils.prototype.getOfDefault = function (array, index, defaultValue) {
        return index >= 0 && array && index < array.length ? array[index] : defaultValue;
    };

    /**
     * Checks two arrays for the identity of elements.
     * @param array1 First array
     * @param array2 Second array
     * @param orderDependent (optional) Consider the order of elements or not
     * @returns {boolean} Returns false if at least one of the parameters (Array1, array2) is not an array
     */
    ArraysUtils.prototype.compare = function (array1, array2, orderDependent) {
        if (!Array.isArray(array1) || !Array.isArray(array2) || array1.length !== array2.length) {
            return false;
        }
        return orderDependent ?
            array1.every((element, index) => element === array2[index]) :
            $(array1).not(array2).length === 0 && $(array2).not(array1).length === 0;
    };

    /**
     * Removes all occurrences of the specified element from the array
     * @param array Target array
     * @param item Item to remove
     * @returns {*} New array without target features
     */
    ArraysUtils.prototype.removeAllMatches = function (array, item) {
        return $.grep(array, value => value !== item);
    };

    /**
     * In the passed array, removes the first occurrence of the specified element
     * @param array Target array
     * @param item Item to remove
     */
    ArraysUtils.prototype.removeFirstMatch = function (array, item) {
        const index = $.inArray(item, array);
        if (index >= 0) {
            array.splice(index, 1);
        }
    };

})(window, window.ru.belyiz.utils);
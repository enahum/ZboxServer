'use strict';

/**
 * Herramientas utiles
 * @namespace utils
 * @author Elias Nahum
 * @param {object|undefined} utils - Objeto utils a ser extendido
 */
module.exports = (function(utils) {

    /**
     * Permite extender un objeto con las propiedades de otros
     * @function extend
     * @author Elias Nahum
     * @param out
     * @example
     * extend(obj, {name: 'test'}, {id: 0});
     * @returns {*|{}} retorna el objeto con las nuevas propiedades asignadas
     */
    var extend = function(out) {
            out = out || {};

            for (var i = 1; i < arguments.length; i++) {
                if (!arguments[i])
                    continue;

                for (var key in arguments[i]) {
                    if (arguments[i].hasOwnProperty(key))
                        out[key] = arguments[i][key];
                }
            }

            return out;
        },
        /**
         * Permite extender un objeto con las propiedades de otros objetos anidados
         * @function deepExtend
         * @author Elias Nahum
         * @param out
         * @example
         * extend(obj, {user: { name: 'test' } }, {comment: { id: 0, text: 'example' } });
         * @returns {*|{}} retorna el objeto con las nuevas propiedades asignadas
         */
        deepExtend = function(out) {
            out = out || {};

            for (var i = 1; i < arguments.length; i++) {
                var obj = arguments[i];

                if (!obj)
                    continue;

                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (typeof obj[key] === 'object')
                            deepExtend(out[key], obj[key]);
                        else
                            out[key] = obj[key];
                    }
                }
            }

            return out;
        };

    utils = utils || {};

    extend(utils, {
        extend: extend,
        deepExtend: deepExtend
    });

    return utils;
});
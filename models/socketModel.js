'use strict';

/**
 * Modelo para los usuarios
 * @namespace socketModel
 * @author Elias Nahum
 */
module.exports = (function() {
    /** @private */
    var users = [];

    /**
     * Obtiene todos los usuarios menos el que está haciendo la consulta
     * @function getAll
     * @author Elias Nahum
     * @param {object} socket - El socket conectado al server
     * @returns {Array} Los usuarios conectados
     */
    this.getAll = function(socket) {
        return users.map(function(c){
            if(!socket || c.socket.id !== socket.id) {
                return {name: c.name, date: c.date, image: c.image};
            }
        }).filter(function(c){
            return c !== undefined;
        });
    };

    /**
     * Busca un usuario existente o crea uno nuevo
     * @function findOrCreateUser
     * @author Elias Nahum
     * @param {object} user - El usuario a buscar
     * @returns {*} el usuario encontrado o el nuevo usuario creado
     */
    this.findOrCreateUser = function(user) {
        var i = users.length;
        for(; --i >= 0; ) {
            if(users[i].name.toLowerCase() === user.name.toLowerCase()) {
                if(users[i].socket.id === user.socket.id) {
                    return users[i];
                }
                else {
                    return null;
                }
            }
        }

        users.push(user);
        return user;
    };

    /**
     * Busca un usuario dado su nombre de usuario
     * @function findUserByName
     * @author Elias Nahum
     * @param {String} username - El nombre del usuario a buscar
     * @returns {*|null} El objeto el usuario encontrado
     */
    this.findUserByName = function(username) {
        var i = users.length;
        for(; --i >= 0; ) {
            if(users[i].name === username) {
                return users[i];
            }
        }
        return null;
    };

    /**
     * Busca un usuario dado el objeto de conexión
     * @function findUserBySocket
     * @author Elias Nahum
     * @param {object} socket - El objeto de conexión perteneciente a un usuario
     * @returns {*|null} El objeto el usuario encontrado
     */
    this.findUserBySocket = function(socket){
        var i = users.length;

        if(i > 0) {
            for (; i-- >= 0;) {
                if (users[i].socket.id === socket.id) {
                    return users[i];
                }
            }
        }

        return null;
    };

    /**
     * Busca el indice de un usuario dado el objeto de conexión
     * @function indexOfSocket
     * @author Elias Nahum
     * @param {object} socket - El objeto de conexión perteneciente a un usuario
     * @returns {*|null} El objeto el usuario encontrado
     */
    this.indexOfSocket = function(socket) {
        var i = users.length;
        if(i > 0) {
            for (; --i >= 0;) {
                if (users[i].socket.id === socket.id) {
                    return i;
                }
            }
        }
        return -1;
    };

    /**
     * Remueve un usuario dado el objeto de conexión
     * @function removeUserBySocket
     * @author Elias Nahum
     * @param {object} socket - El objeto de conexión perteneciente a un usuario
     * @returns {*|false} El objeto el usuario removido
     */
    this.removeUserBySocket = function(socket) {
        var index = this.indexOfSocket(socket);

        if(index > -1) {
            return users.splice(index, 1)[0];
        }
        return false;
    };

    /**
     * Busca los usuarios que se encuentran en una misma sala
     * @function findUsersInRoom
     * @author Elias Nahum
     * @param {String} room - El nombre de la sala del cual se quieren obtener los usuarios
     * @returns {Array} Los usuarios encontrados
     */
    this.findUsersInRoom = function(room) {
        return users.filter(function(c) {
            return c.room === room;
        });
    };

    return this;
}).call(this);
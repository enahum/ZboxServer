'use strict';

var model = require('../models/socketModel'),
    log = require('../libs/log')(module),
    utils = require('../libs/utils')();

/**
 * Controlador para los usuarios
 * @namespace socketController
 * @author Elias Nahum
 */
module.exports = (function() {
    /**
     * Remueve a todos los usuarios de la sala especificada
     * @function leaveRoom
     * @private
     * @author Elias Nahum
     * @param {string} room - el nombre de la sala
     */
    var leaveRoom = function(room) {
        var users, i;
        if(room) {
            users = model.findUsersInRoom(room);
            i = users.length;
            for (; --i >= 0;) {
                users[i].room = null;
            }
        }
    };

    /**
     * Obtiene todos los usuarios menos el que está haciendo la consulta
     * @function getAll
     * @author Elias Nahum
     * @param {object} socket - El socket conectado al server
     * @param {function} fn - El callback que maneja la respuesta
     * @returns {Array}
     */
    this.getAll = function(socket, fn) {
        if(fn && typeof fn === typeof Function) {
            fn(model.getAll(socket));
        }
    };

    /**
     * Establece el inicio de sesión de un usuario
     * @function login
     * @author Elias Nahum
     * @param {object} socket - El socket conectado al server
     * @param {object} user - El objeto usuario
     * @param {function} fn - El callback que maneja la respuesta
     * @fires signed
     */
    this.login = function(socket, user, fn){
        var username = user.name;
        if(!username && (fn && typeof fn === typeof Function))
        {
            return fn(false);
        }

        utils.extend(user, {
            socket: socket,
            date: new Date(),
            image: 'p' + (Math.floor(Math.random() * 4) + 1).toString() + '.jpg'
        });

        if(model.findOrCreateUser(user)) {
            log.info(user.name + ' connected');
            socket.broadcast.emit('signed', { name: username, date: user.date, image: user.image });
            if (fn && typeof fn === typeof Function) {
                return fn(true);
            }
        }
        else {
            if (fn && typeof fn === typeof Function) {
                return fn(null);
            }
        }
    };

    /**
     * Solicita iniciar una llamada
     * @function call
     * @author Elias Nahum
     * @param {object} io - El objeto que maneja todas las conexiones (socket.io)
     * @param {object} socket - El socket conectado al server
     * @param {String} username - El nombre del usuario a quien llamar
     * @param {function} fn = El callback que maneja la resputa
     * @fires calling
     */
    this.call = function(io, socket, username, fn) {
        var initiator = model.findUserBySocket(socket),
            receptor = model.findUserByName(username),
            error = null;

        if(!receptor) {
            error = {
                message: username + ' no está conectado'
            };
        }
        else if (receptor.room) {
            error = {
                message: username + ' está en una llamada'
            };
        }

        if(!error) {
            io.to(receptor.socket.id).emit('calling', initiator.name);
        }

        if(fn && typeof fn === typeof Function) {
            fn(error);
        }
    };

    /**
     * El usuario a quien se llamo no responde
     * @function noResponse
     * @author Elias Nahum
     * @param {object} io - El objeto que maneja todas las conexiones (socket.io)
     * @param {object} socket - El socket conectado al server
     * @param {String} username - El nombre del usuario quien inició la llamada
     * @fires noresponse
     */
    this.noResponse = function(io, socket, username) {
        var u = model.findUserByName(username),
            s = model.findUserBySocket(socket);
        if(u) {
            io.to(u.socket.id).emit('noresponse', s.name);
        }
    };

    /**
     * Rechaza la solicitud de una llamada
     * @function reject
     * @author Elias Nahum
     * @param {object} io - El objeto que maneja todas las conexiones (socket.io)
     * @param {object} socket - El socket conectado al server
     * @param {String} username - El nombre del usuario quien hace la solicitud
     * @fires rejected
     */
    this.reject = function(io, socket, username) {
        var u = model.findUserByName(username),
            s = model.findUserBySocket(socket);
        if(u) {
            io.to(u.socket.id).emit('rejected', s.name);
        }
    };

    /**
     * Atiende una llamada solicitada
     * @function pickup
     * @author Elias Nahum
     * @param {object} io - El objeto que maneja todas las conexiones (socket.io)
     * @param {object} socket - El socket conectado al server
     * @param {String} username - El nombre del usuario que solicito la llamada
     * @param {function} fn = El callback que maneja la resputa
     * @fires answered
     */
    this.pickup = function(io, socket, username, fn) {
        var u = model.findUserByName(username),
            s = model.findUserBySocket(socket),
            room;
        if(u) {
            room = username + '|' + s.name;
            s.room = u.room = room;
            io.to(u.socket.id).emit('answered', room);
            if(fn && typeof fn === typeof Function) {
                fn(room);
            }
        }
    };

    /**
     * Cuelga una llamada atendida
     * @function hangup
     * @author Elias Nahum
     * @param {object} io - El objeto que maneja todas las conexiones (socket.io)
     * @param {object} socket - El socket conectado al server
     * @param {String} room - El nombre de la sala que alberga los usuarios en la llamada
     * @fires hangup
     */
    this.hangup = function(io, socket, room) {
        var users = model.findUsersInRoom(room), i = users.length, sId;
        for(; --i >=0;) {
            sId = users[i].socket.id;
            users[i].room = null;
            if(socket.id !== sId) {
                io.to(sId).emit('hangup');
            }
        }
    };

    /**
     * Termina la sesión de un usuario
     * @function logout
     * @author Elias Nahum
     * @param {object} socket - El socket conectado al server
     * @fires logout
     */
    this.logout = function(socket) {
        var user = model.removeUserBySocket(socket);
        if(user) {
            log.info(user.name + ' has logout');
            leaveRoom(user.room);
            return socket.broadcast.emit('logout', user.name);
        }
        socket.broadcast.emit('logout', undefined);
    };

    /**
     * Obtiene un usuario dado el objeto de conexión
     * @function get
     * @author Elias Nahum
     * @param {object} socket - El objeto de conexión perteneciente a un usuario
     * @returns {*|null} El objeto el usuario encontrado
     */
    this.get = function(socket) {
        return model.findUserBySocket(socket);
    };

    return this;
}).call(this);
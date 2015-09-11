/**
 * Created by enahum on 09-09-15.
 */
var model = require('../models/socketModel'),
    log = require('../libs/log')(module),
    controller = {};
controller.list = function(fn) {
    if(fn && typeof fn === typeof Function) {
        fn(model.findAll());
    }
};

controller.login = function(socket, user, fn){
    var username = user.name;
    if(!username && (fn && typeof fn === typeof Function))
    {
        return fn(false);
    }
    user.socket = socket;
    user.date = new Date();
    if(model.findOrCreateUser(user)) {
        log.info(user.name + ' connected');
        if (fn && typeof fn === typeof Function) {
            fn(true);
        }
        socket.broadcast.emit('signed', { name: username, date: user.date });
    }
    else {
        if (fn && typeof fn === typeof Function) {
            fn(null);
        }
    }
};

controller.logout = function(socket) {
  var user = this.findUserBySocket(socket);
    if(user) {
        log.info(user.name + ' has logout');
        return socket.broadcast.emit('logout', user.name);
    }
};

controller.disconnect = function(io, socket) {
    var user = model.removeUserBySocket(socket);
    if(user) {
        log.info(user.name + ' has disconnected');
       return socket.broadcast.emit('logout', user.name);
    }

    socket.broadcast.emit('logout', undefined);
};

controller.get = function(socket) {
    return model.findUserBySocket(socket);
};

module.exports = controller;
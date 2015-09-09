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
    model.findOrCreateUser(user);
    log.info(user.name + ' connected');
    if(fn && typeof fn === typeof Function) {
        fn(true);
    }
    socket.emit('refresh');
};

controller.logout = function(io, socket) {
    var user = model.removeUserBySocket(socket);
    if(user) {
        log.info(user.name + ' disconnected');
        controller.list(function(userList){
            io.emit('refresh', userList);
        });
    }
};

module.exports = controller;
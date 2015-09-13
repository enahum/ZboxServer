/**
 * Created by enahum on 09-09-15.
 */
var model = require('../models/socketModel'),
    log = require('../libs/log')(module),
    controller = {};
controller.list = function(socket, fn) {
    if(fn && typeof fn === typeof Function) {
        fn(model.findAll(socket));
    }
};

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

controller.login = function(socket, user, fn){
    var username = user.name;
    if(!username && (fn && typeof fn === typeof Function))
    {
        return fn(false);
    }
    user.socket = socket;
    user.date = new Date();
    user.image = 'p' + (Math.floor(Math.random() * 4) + 1).toString() + '.jpg';
    if(model.findOrCreateUser(user)) {
        log.info(user.name + ' connected');
        if (fn && typeof fn === typeof Function) {
            fn(true);
        }
        socket.broadcast.emit('signed', { name: username, date: user.date, image: user.image });
    }
    else {
        if (fn && typeof fn === typeof Function) {
            fn(null);
        }
    }
};

controller.call = function(io, socket, username, fn) {
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

controller.noResponse = function(io, socket, username) {
    var u = model.findUserByName(username),
        s = model.findUserBySocket(socket);
    if(u) {
        io.to(u.socket.id).emit('noresponse', s.name);
    }
};

controller.reject = function(io, socket, username) {
    var u = model.findUserByName(username),
        s = model.findUserBySocket(socket);
    if(u) {
        io.to(u.socket.id).emit('rejected', s.name);
    }
};

controller.pickup = function(io, socket, username, fn) {
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

controller.hangup = function(io, socket, room) {
    var users = model.findUsersInRoom(room), i = users.length, sId;
    for(; --i >=0;) {
        sId = users[i].socket.id;
        users[i].room = null;
        if(socket.id !== sId) {
            io.to(sId).emit('hangup');
        }
    }
};

controller.logout = function(socket) {
  var user = this.findUserBySocket(socket);
    if(user) {
        log.info(user.name + ' has logout');
        leaveRoom(user.room);
        return socket.broadcast.emit('logout', user.name);
    }
};

controller.disconnect = function(io, socket) {
    var user = model.removeUserBySocket(socket);
    if(user) {
        leaveRoom(user.room);
        log.info(user.name + ' has disconnected');
       return socket.broadcast.emit('logout', user.name);
    }

    socket.broadcast.emit('logout', undefined);
};

controller.get = function(socket) {
    return model.findUserBySocket(socket);
};

module.exports = controller;
/**
 * Created by enahum on 08-09-15.
 */
var clients = [],
    model = {};

model.findAll = function(socket) {
    return clients.map(function(c){
        if(c.socket.id !== socket.id) {
            return {name: c.name, date: c.date, image: c.image};
        }
    }).filter(function(c){
        return c !== undefined;
    });
};

model.findOrCreateUser = function(user) {
    var i = clients.length;
    for(; --i >= 0; ) {
        if(clients[i].name.toLowerCase() === user.name.toLowerCase()) {
            if(clients[i].socket.id === user.socket.id) {
                return clients[i];
            }
            else {
                return null;
            }
        }
    }

    clients.push(user);
    return user;
};

model.findUserByName = function(username) {
    var i = clients.length;
    for(; --i >= 0; ) {
        if(clients[i].name === username) {
            return clients[i];
        }
    }
    return null;
};

model.findUserBySocket = function(socket){
    var i = clients.length;

    if(i > 0) {
        for (; i-- >= 0;) {
            if (clients[i].socket.id === socket.id) {
                return clients[i];
            }
        }
    }

    return null;
};

model.indexOfSocket = function(socket) {
    var i = clients.length;
    if(i > 0) {
        for (; --i >= 0;) {
            if (clients[i].socket.id === socket.id) {
                return i;
            }
        }
    }
    return -1;
};

model.removeUser = function(user) {
    var i = clients.length;
    if(i > 0) {
        for (; --i >= 0;) {
            if (clients[i].name === user.name) {
                return clients.splice(i, 1)[0];
            }
        }
    }
    return false;
};

model.removeUserBySocket = function(socket) {
    var index = this.indexOfSocket(socket);

    if(index > -1) {
        return clients.splice(index, 1)[0];
    }
    return false;
};

model.findUsersInRoom = function(room) {
  return clients.filter(function(c) {
      return c.room === room;
  });
};

module.exports = model;
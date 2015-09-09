/**
 * Created by enahum on 08-09-15.
 */
var clients = [],
    model = {},
    removeCircular = function(cache, key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    };

model.findAll = function() {
    var cache = [];
    var cs = JSON.parse(JSON.stringify(clients, removeCircular.bind(undefined, cache))), i = cs.length;
    for(; --i >= 0;) {
        delete cs[i].socket;
    }
    return cs;
};

model.findOrCreateUser = function(user) {
    var i = clients.length;
    for(; --i >= 0; ) {
        if(clients[i].name === user.name) {
            return clients[i];
        }
    }

    clients.push(user);
    return user;
};

model.findUserBySocket = function(socket){
    var i = clients.length;

    for(; i-- >= 0;) {
        if (clients[i].socket.id === socket.id) {
            return clients[i];
        }
    }
};

model.removeUser = function(user) {
    var i = clients.length;
    for(; --i >= 0; ) {
        if(clients[i].name === user.name) {
            return clients.splice(i, 1)[0];
        }
    }
    return false;
};

model.removeUserBySocket = function(socket) {
    var i = clients.length;

    for(; i-- >= 0;) {
        if (clients[i].socket.id === socket.id) {
            return clients.splice(i, 1)[0];
        }
    }
    return false;
};

module.exports = model;
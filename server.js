/**
 * Created by enahum on 08-09-15.
 */
var log = require('./libs/log')(module),
    config = require('./libs/config'),
    SocketServer = require('socket.io'),
    fs = require('fs'),
    secure = config.get("sslSettings:enabled"),
    port = normalizePort(secure ? config.get("ssl") : config.get("port")),
    controller = require('./controllers/socketController'),
    server_handler = function (req, res) {
        res.writeHead(404);
        res.end('welcome to zbox');
    },
    io = null,
    server = null;


if (secure) {
    server = require('https').createServer({
        key: fs.readFileSync(config.get("sslSettings:key")),
        cert: fs.readFileSync(config.get("sslSettings:cert")),
        passphrase: config.get("sslSettings:passphrase")
    }, server_handler);
} else {
    server = require('http').createServer(server_handler);
}
server.listen(port);
server.on('listening', onListening);
io = new SocketServer({
    serveClient: false
});
io.listen(server);

io.on('connection', function(socket) {
    log.info('someone connected');
    socket.on('list', controller.list.bind(undefined, socket));
    socket.on('login', controller.login.bind(undefined, socket));
    socket.on('call', controller.call.bind(undefined, io, socket));
    socket.on('noresponse', controller.noResponse.bind(undefined, io, socket));
    socket.on('pickup', controller.pickup.bind(undefined, io, socket));
    socket.on('reject', controller.reject.bind(undefined, io, socket));
    socket.on('hangup', controller.hangup.bind(undefined, io, socket));
    socket.on('logout', controller.logout.bind(undefined, socket));
    socket.on('disconnect', controller.disconnect.bind(undefined, io, socket));
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    log.info('Socket server listening on ' + bind);
}

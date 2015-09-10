/**
 * Created by enahum on 08-09-15.
 */
var expect = require('chai').expect,
    io = require('socket.io-client'),
    config = require('../libs/config'),
    secure = config.get("sslSettings:enabled"),
    port = secure ? config.get("ssl") : config.get("port"),
    protocol = secure ? 'https' : 'http',
    socketURL= protocol +"://localhost:" + port,
    connected = false,
    client = null;

describe('Socket Client', function() {
    client = io.connect(socketURL);
    before(function(done){

        client.on('connect', function () {
            connected = true;
            done();
        });
    });

    it('it should be connected and login nd not receive the logged notification', function (done) {
        expect(connected).to.be.true;
        client.on('signed', function(username){
           expect.fail('Recibido el usuario ' + username);
        });
        client.emit('login', {name: 'Elias'}, function(data){
            expect(data).to.be.true;
            done();
        });
    });

    it('it should get the list of logged users', function (done) {
        expect(connected).to.be.true;
        client.emit('list', function(data){
            expect(data).to.be.an('array');
            expect(data).to.have.length(1);
            done();
        });
    });

    it('it should disconnect and the other users should get the logout info', function (done) {
        expect(connected).to.be.true;
        var c = io.connect(socketURL, {'force new connection': true});
        c.on('connect', function(){
            c.on('logout', function(data){
                expect(data).to.be.ok;
                done();
            })
        });
        client.disconnect();
        expect(client.disconnected).to.be.true;
    });
});
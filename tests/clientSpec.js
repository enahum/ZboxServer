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
    before(function(done){
        client = io.connect(socketURL);

        client.on('connect', function () {
            connected = true;
            done();
        });
    });

    it('it should be connected and login', function (done) {
        expect(connected).to.be.true;
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

    it('it should disconnect', function (done) {
        expect(connected).to.be.true;
        client.disconnect();
        expect(client.disconnected).to.be.true;
        done();
    });
});
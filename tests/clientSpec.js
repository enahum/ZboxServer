/**
 * Created by enahum on 08-09-15.
 */
var expect = require('chai').expect,
    io = require('socket.io-client'),
    Q = require('q'),
    config = require('../libs/config'),
    secure = config.get("sslSettings:enabled"),
    port = secure ? config.get("ssl") : config.get("port"),
    protocol = secure ? 'https' : 'http',
    socketURL= protocol +"://localhost:" + port,
    connected = false, connected2 = true,
    client = null, client2 = null, room = null;

describe('Socket Clients', function() {
    before(function(done) {
        var q1 = Q.defer(), q2 = Q.defer();
        Q.all([q1.promise, q2.promise])
            .then(function(){
                done();
            });
        client = io.connect(socketURL);
        client2 = io.connect(socketURL, {'force new connection': true});
        client.on('connect', function () {
            connected = true;
            q1.resolve();
        });

        client.on('connect', function () {
            connected = true;
            q2.resolve();
        });
    });

    it('both users should be connected', function(done){
        expect(connected).to.be.true;
        expect(connected2).to.be.true;
        done();
    });

    it('it should login both users and notify the first one about the second', function (done) {

        client.on('signed', function(username){
            expect(username).to.be.exist;
            done();
        });
        client.emit('login', {name: 'Elias'}, function(data){
            expect(data).to.be.true;
        });
        client2.emit('login', {name: 'Nahum'}, function(data){
            expect(data).to.be.true;
        });
    });

    it('it should get the list of logged users for both users', function (done) {
        var q1 = Q.defer(), q2 = Q.defer();
        Q.all([q1.promise, q2.promise])
            .then(function(){
                done();
            });
        client.emit('list', function(data){
            expect(data).to.be.an('array');
            expect(data).to.have.length(1);
            q1.resolve();
        });

        client2.emit('list', function(data){
            expect(data).to.be.an('array');
            expect(data).to.have.length(1);
            q2.resolve();
        });
    });

    it('it should call and receive the calling notification', function(done) {
        var q = Q.defer();
        Q.all([q.promise])
            .then(function() {
                done();
            });

        client.emit('call', 'Nahum', function(data){
            expect(data).to.not.exist;
        });

        client2.on('calling', function(username){
            expect(username).to.eql('Elias');
            q.resolve();
        });
    });

    it('it should not answer the call', function(done) {
        client.on('noresponse', function(username) {
            expect(username).to.eql('Nahum');
            done();
        });

        client.emit('call', 'Nahum', function(data){
            expect(data).to.not.exist;
        });

        client2.emit('noresponse', 'Elias');
    });

    it('it should reject the call', function(done) {
        client.on('rejected', function(username) {
            expect(username).to.eql('Nahum');
            done();
        });

        client.emit('call', 'Nahum', function(data){
            expect(data).to.not.exist;
        });

        client2.emit('reject', 'Elias');
    });

    it('it should establish a call', function(done) {
        client.on('answered', function(r) {
            expect(r).to.exist;
            room = r;
            done();
        });

        client.emit('call', 'Nahum', function(data){
            expect(data).to.not.exist;
        });

        client2.emit('pickup', 'Elias', function(r){
            expect(r).to.exist;
        })
    });

    it('it should hangup a call', function(done) {
        client.on('hangup', function() {
            done();
        });

        client2.emit('hangup', room);
    });

    it('it should logout client and notify client2', function(done) {
        client2.on('logout', function(username){
            expect(username).to.exist;
        });

        client.emit('logout');
        done();
    });

    it('it should disconnect both clients', function(done) {
        client.disconnect();
        client2.disconnect();
        expect(client.disconnected).to.be.true;
        expect(client2.disconnected).to.be.true;
        done();
    })
});
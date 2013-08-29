'use strict';

var util = require('util')
var when = require('when')
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Transport = require('./transport.js')

function MongoTransport(cfg) {
    Transport.call(this)

    var that = this
    var defer = when.defer()

    this.cfg = cfg
    this.promise = defer.promise
    this.parse = cfg.parse
    this.schemas = cfg.schemas || (cfg.schmeas = {})

    var db = mongoose.connect('mongodb://' + cfg.dbHost + ':' + cfg.dbPort + '/' + cfg.dbName, {
        server: {
            socketOptions: {
                connectTimeoutMS: cfg.dbTimeout
            }
        }
    })

    db.connection.on('error', function() {
        defer.reject()
        that.transport = function() {}
        console.error('connect mongo server error!')
    })

    db.connection.once('open', function() {
        var schemas = that.schemas
        Object.keys(schemas).forEach(function(name) {
            var schema = schemas[name]
            if (!(schema instanceof Schema)) {
                schema = new Schema(schema)
            }
            schemas[name] = db.model(name, schema)
        })

        defer.resolve()
    })
}

util.inherits(MongoTransport, Transport)

MongoTransport.prototype.transport = function(data) {
    var that = this
    this.promise.then(function() {
        that.parse(data.message)
    })
}

exports.get = function(cfg) {
    return new MongoTransport(cfg)
}

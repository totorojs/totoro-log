'use strict';

var util = require('util')
var Transport = require('./transport.js')

function ConsoleTransport() {
   Transport.call(this);
}

util.inherits(ConsoleTransport, Transport)

ConsoleTransport.prototype.getLevel = function() {
    return process.argv.some(function(arg) {
        return arg === '--verbose'
    }) ? 'debug' : 'info'
}

ConsoleTransport.prototype.transport = function(data) {
    console.log(data.output)
}

exports.get = function() {
    return new ConsoleTransport()
}


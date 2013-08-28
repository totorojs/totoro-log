'use strict';

var levels = require('./const').levels

var Transport = module.exports = function() {
    this.level = this.getLevel()
}

Transport.prototype = {
    _transport: function(data) {
        var title =data.title
        if (levels.indexOf(title) >= levels.indexOf(this.level)){
            this.transport(data)
        }
    },

    transport: function(data) {
    },

    getLevel: function() {
        return 'debug'
    }
}


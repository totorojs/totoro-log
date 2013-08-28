'use strict';

var Console = require('./console');
var colorful = require('colorful')

var ConsoleTransport = require('./console-transport.js')
var CONST = require('./const')
// Retrieve

var levels = CONST.levels

var templ = '{{title}} {{file}}:{{line}} | {{message}}'

var colors = {
        info: colorful.green,
        warn: colorful.yellow,
        error: colorful.red,
        fatal: colorful.red
    }


exports.getLog = function(cfg) {
    var transports = [ConsoleTransport.get()]

    if (cfg && cfg.transports) {
        transports = transports.concat(cfg.transports)
    }

    return Console({
        methods: levels,

        level: 'debug',

        format: [
            templ,
            {
                fatal: templ + '\nCall Stack:\n{{stacklist}}'
            }
        ],

        dateformat: 'yyyy-mm-dd hh:MM:ss',

        preprocess: function(data) {
            if (data.title === 'fatal') {
                data.stacklist = data.stack.join('\n')
            }
        },

        filters: [
            {
                debug : colors.cyan,
                info: colorful.white,
                warn: colorful.yellow,
                error: colorful.red,
                fatal: [colorful.red, colorful.bold]
            }
        ],

        transport: function(data) {
            transports.forEach(function(t) {
                t._transport(data)
            })

            if (data.title === 'fatal') {
                process.exit(0)
            }
        }
    })
}

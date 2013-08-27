'use strict';

var fs = require('fs')
var path = require('path')
var colorConsole = require('./color_console');
var colorful = require('colorful')
var dateFormat = require('dateformat')
var util = require('util')
// Retrieve

var levels = ['debug', 'info', 'warn', 'error', 'fatal']

var templ = '{{title}} {{file}}:{{line}} | {{message}}'

var colors = {
        info: colorful.green,
        warn: colorful.yellow,
        error: colorful.red,
        fatal: colorful.red
    }


exports.getLog = function(cfg) {
    var transports = [exports.getConsole()]

    if (cfg && cfg.transports) {
        transports = transports.concat(cfg.transports)
    }

    return colorConsole({
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


exports.Transport = Transport


function Transport() {
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

exports.getConsole = function() {
    return new ConsoleTransport()
}

function FileTransport() {
   Transport.call(this);
}

util.inherits(FileTransport, Transport)

FileTransport.prototype.transport = function(data) {
    push2File(generateLog(data))
}

exports.getFileTransport = function(cfg) {
    return new FileTransport()
}

var logFile

function push2File(str) {
    var now = dateFormat(new Date(), 'yyyymmdd')

    if (logFile && logFile.date !== now) {
        logFile.destroy()
        logFile = null
    }

    if (!logFile) {
        logFile = new LogFile(now)
    }

    logFile.write(str)
}


function LogFile(date) {
    this.date = date;
    this.path = path.join('logs', date + '.log')

    if (!fs.existsSync(path.dirname(this.path))) {
        fs.mkdirSync(path.dirname(this.path))
    }

    this.stream = fs.createWriteStream(this.path, {
        flags: 'a',
        encoding: 'utf8'
    })
}

LogFile.prototype.write = function(str) {
    this.stream.write(str + '\n');
}

LogFile.prototype.destroy = function() {
    if (this.stream) {
        this.stream.end()
        this.stream.destroySoon()
        this.stream = null
    }
}


function generateLog(data) {
    var title = data.title
    var msg = prefix(data) +  ' | ' + data.message

    if (title === 'fatal') {
        msg = msg + '[' + data.stacklist.split('\n').join(', ') + ']'
    }

    return msg
}


function prefix(data) {
    var title = data.title
    return  padding(title, 5) + ' ' + data.timestamp +
        ' ' + padding(data.file, 12, true) + ':' + padding(data.line, 3)
}


function padding(msg, width, alignRight) {
    msg = msg.split('')

    for (var i = msg.length; i < width; i++) {
        if (alignRight) {
            msg.unshift(' ')
        } else {
            msg.push(' ')
        }
    }
    return msg.join('')
}

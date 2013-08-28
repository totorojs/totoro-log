'use strict';

var util = require('util')
var path = require('path')
var fs = require('fs')
var dateFormat = require('dateformat')
var Transport = require('./transport.js')

function FileTransport() {
   Transport.call(this);
}

util.inherits(FileTransport, Transport)

FileTransport.prototype.transport = function(data) {
    push2File(generateLog(data))
}

exports.get = function(cfg) {
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

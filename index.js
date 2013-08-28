'use strict';

module.exports = require('./lib/logger.js')

module.exports.getConsoleTransport = require('./lib/console-transport').get
module.exports.getFileTransport = require('./lib/file-transport').get
module.exports.getMongoTransport = require('./lib/mongo-transport').get
module.exports.Transport = require('./lib/transport')

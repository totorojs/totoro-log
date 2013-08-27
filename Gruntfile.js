/*
 * totoro-server
 * https://github.com/totorojs/totoro-server
 *
 * Copyright (c) 2013 kangpangpang, fool2fish
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path')

module.exports = function(grunt) {

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-jshint');


  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
          'Gruntfile.js',
          'lib/**/*.js',
          'tests/**/*.js'
      ],
      options: {
          'jshintrc': '.jshintrc'
      }
    },
  })
  grunt.registerTask('default', ['jshint']);
};

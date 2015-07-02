module.exports = function(grunt) {

  var path = require('path');
  var base = path.resolve();

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'create-windows-installer': {
      appDirectory: '/tmp/GrandView',
      outputDirectory: '/tmp/GrandView/installer',
      authors: 'Concept - Bjørn Bråthen, Andreas Drivenes',
      description: 'Et verktøy for å strukturere store informasjonsmengder.',
      exe: 'GrandView.exe'
    }
  });

  grunt.loadNpmTasks('grunt-electron-installer');

};

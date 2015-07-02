module.exports = function(grunt) {

  var path = require('path');
  var base = path.resolve();

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'create-windows-installer': {
      appDirectory: base + '/dist/windows/GrandView',
      outputDirectory: base + '/dist/windows/installer',
      authors: 'Concept - Bjørn Bråthen, Andreas Drivenes',
      description: 'Et verktøy for å strukturere store informasjonsmengder.',
      exe: 'GrandView_setup.exe'
    }
  });

  grunt.loadNpmTasks('grunt-electron-installer');

};

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'create-windows-installer': {
      appDirectory: '/dist/windows/GrandView',
      outputDirectory: '/dist/windows/installer',
      authors: 'Concept - Bjørn Bråthen, Andreas Drivenes',
      exe: 'GrandView_setup.exe'
    }
  });

  grunt.loadNpmTasks('grunt-electron-installer');

};

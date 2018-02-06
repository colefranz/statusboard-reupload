module.exports = function(grunt) {

   var connectMiddleware = function(connect, options, middlewares) {
    var stylus = require('stylus'),
        nib = require('nib');

    middlewares.unshift(stylus.middleware({
      src: __dirname + '/app',
      dest: __dirname + '/app',
      debug: true,
      compile: function(str, path) {
        return stylus(str)
          .set('filename', path)
          .use(nib());
      }
    }));

    return middlewares;
  };

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-stylus');

  grunt.registerTask('serve', ['connect:dev:keepalive']);
  grunt.registerTask('build', ['copy:build', 'stylus:build']);

  grunt.initConfig({
    connect: {
      options: {
        base: 'app',
        middleware: connectMiddleware
      },
      dev: {
        options: {
          port: 8000,
          debug: true
        }
      }
    },
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'app/',
            src: 'bower_components/angular/angular.min.js',
            dest: 'build'
          }, {
            expand: true,
            cwd: 'app/',
            src: 'bower_components/angular-animate/angular-animate.min.js',
            dest: 'build'
          }, {
            expand: true,
            cwd: 'app/',
            src: ['app.js', 'index.html'],
            dest: 'build'
          }
        ]
      }
    },
    stylus: {
      build: {
        files: {
          'build/css/main.css': [
            'app/css/main.styl'
          ]
        }
      }
    }
  });
};

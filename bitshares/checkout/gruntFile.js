module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-recess');


  // Default task.
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['clean:all','concat','recess:build']);
  grunt.registerTask('release', ['clean:all','uglify','concat:index', 'recess:min']);


  // Print a timestamp (useful for when watching)
  grunt.registerTask('timestamp', function() {
    grunt.log.subhead(Date());
  });



  // Project configuration.
  grunt.initConfig({
    distdir: 'dist',
    pkg: grunt.file.readJSON('package.json'),
    src: {
      js: ['js/*.js'],
      jsTpl: ['<%= distdir %>/templates/**/*.js'],
      specs: ['test/**/*.spec.js'],
      scenarios: ['test/**/*.scenario.js'],
      html: ['index.html'],
      tpl: {
        app: ['src/app/**/*.tpl.html'],
        common: ['src/common/**/*.tpl.html']
      },
      css: ['css/*.css', 'css/vendor/*.css'], // recess:build doesn't accept ** in its file patterns
      cssWatch: ['css/**/*.css']
    },
    clean: {
        all: ['<%= distdir %>/*']
        },
    copy: {
      distfiles: {
        files: [{ dest: '', src : '**', expand: true, cwd: '<%= distdir %>' }]
      } 
                  
    },
    
    concat:{
      dist:{
        options: {
          banner: "<%= banner %>"
        },
        src:['<%= src.js %>', '<%= src.jsTpl %>'],
        dest:'<%= distdir %>/<%= pkg.name %>.js'
      },
      index: {
        src: ['index.html'],
        dest: '<%= distdir %>/index.html',
        options: {
          process: true
        }
      },
      vendor: {
        src:['js/vendor/jquery.min.js', 'js/vendor/jquery.noty.packaged.min.js', 'js/vendor/jquery.localize.min.js', 'js/vendor/bootstrap.min.js', 'js/vendor/bootstrap-dialog.min.js', 'vendor/angular-cookies.min.js', 'js/vendor/waypoints.min.js', 'js/vendor/angular-animate.min.js', 'js/vendor/html5shiv.js', 'js/vendor/respond.min.js'],
        dest: '<%= distdir %>/vendor.js'
      }
    },
    uglify: {
      dist:{
        options: {
          mangle: false
        },
        src:['<%= src.js %>' ,'<%= src.jsTpl %>'],
        dest:'<%= distdir %>/<%= pkg.name %>.js'
      },
      vendor: {
        src:['<%= concat.vendor.src %>'],
        dest: '<%= distdir %>/vendor.js'
      }   
    },
    recess: {
      build: {
        files: {
          '<%= distdir %>/<%= pkg.name %>.css':
          ['<%= src.css %>'] },
        options: {
          compile: true
        }
      },
      min: {
        files: {
          '<%= distdir %>/<%= pkg.name %>.css': ['<%= src.css %>']
        },
        options: {
          compress: true
        }
      }
    },
    watch:{
      all: {
        files:['<%= src.js %>', '<%= src.specs %>', '<%= src.cssWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>'],
        tasks:['default','timestamp']
      },
      build: {
        files:['<%= src.js %>', '<%= src.specs %>', '<%= src.cssWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>'],
        tasks:['build','timestamp']
      }
    }   
    
  });

};

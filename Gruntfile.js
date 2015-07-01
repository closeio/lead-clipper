// Grunt config file to help with static JS assets - run the requirejs optimizer, compilation, etc.
// https://github.com/gruntjs/grunt/
module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({

        // The clean task ensures all files are removed from the dist/ directory so
        // that no files linger from previous builds.
        clean: ['dist/'],

        jshint: {
            all: [
                'js/*.js'
            ],
            options: {
                scripturl: true,
                expr: true,
                multistr: true
            }
        },

        less: {
            menu: {
                src: 'less/menu.less',
                dest: 'dist/css/menu.css'
            },
            signIn: {
                src: 'less/sign_in.less',
                dest: 'dist/css/sign_in.css'
            }
        },

        uglify: {
            options: {
                unsafe: false,
                screw_ie8: true,
                compress: true
            },
            prod: {
                files: {
                    'dist/js/background.js': [
                        'js/settings.js',
                        'js/background.js'
                    ],
                    'dist/js/contentscript.js': [
                        'js/contentscript.js'
                    ],
                    'dist/js/menu.js': [
                        'js/menu.js'
                    ],
                    'dist/js/sign_in.js': [
                        'js/sign_in.js'
                    ]
                }
            }

        },

        copy: {
            dev: {
                files: [
                    { src: ['less/bootstrap.min.css'], dest: 'dist/css/bootstrap.min.css'},
                    { src: ['manifest.json'], dest: 'dist/'},
                    { src: ['js/lib/*'], dest: 'dist/'},
                    {
                        expand: true,
                        cwd: 'img/',
                        src: ['**/*.{png,jpg,gif}'],
                        dest:'dist/img/'
                    },
                    {
                        expand: true,
                        cwd: 'templates/',
                        src: ['**/*.html'],
                        dest: 'dist/templates/'
                    }
                ]
            },
            prod: {
                files: [
                    { src: ['less/bootstrap.min.css'], dest: 'dist/css/bootstrap.min.css'},
                    { src: ['manifest.json'], dest: 'dist/'},
                    { src: ['js/lib/*'], dest: 'dist/'},
                    { src: ['key.pem'], dest: 'dist/'},
                    { 
                        expand: true,
                        cwd: 'img/', 
                        src: ['**/*.{png,jpg,gif}'], 
                        dest:'dist/img/' 
                    },
                    {
                        expand: true,
                        cwd: 'templates/',
                        src: ['**/*.html'],
                        dest: 'dist/templates/'
                    }
                ]
            }
        }

    });

    grunt.registerTask('lint', 'jshint');
    grunt.registerTask('build:dev', ['clean', 'jshint', 'less', 'uglify:prod', 'copy:dev']);
    grunt.registerTask('build:prod', ['clean', 'jshint', 'less', 'uglify:prod', 'copy:prod']);
    grunt.registerTask('build', ['build:dev']);

};

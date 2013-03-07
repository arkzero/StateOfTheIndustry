/*Bryan Nissen - Bryan@Webizly.com*/
/*global window, Backbone,  document, Handlebars,  jQuery*/
( function($) {"use strict";
        /////-----     MODELS     -----/////
        window.Photo = Backbone.Model.extend({});

        window.Controller = Backbone.Model.extend({
            defaults : {
                position : 0,
                animations : true
            }
        });

        /////-----  COLLECTIONS  -----/////

        window.Photos = Backbone.Collection.extend({
            model : window.Photo,
            url : 'json/photos.json',

            initialize : function() {
                this.fetch({
                    update : true
                });
            }
        });

        window.photos = new window.Photos();
        window.controller = new window.Controller();

        $(document).ready(function() {

            /////-----     VIEWS     -----/////

            window.PhotoView = Backbone.View.extend({
                template : Handlebars.compile($('#PhotoView-template').html()),

                initialize : function() {
                    this.controller = this.options.controller;

                    this.controller.bind('change:position', this.highlight, this);
                },

                render : function() {
                    $(this.el).append(this.template(this.model.toJSON()));
                    return true;
                },

                highlight : function() {
                    var pos = this.controller.get('position');

                    $('.photo').removeClass('selected');
                    $('#' + pos + '.photo').addClass('selected');

                }
            });

            window.PhotoInfo = Backbone.View.extend({
                template : Handlebars.compile($('#PhotoInfo-template').html()),
                
                events: {
                    'click #close': 'close'  
                },
                
                initialize : function() {
                    this.controller = this.options.controller;
                },

                render : function() {
                    if(this.controller.get('animations')){
                        console.log('pew')
                        $(this.el).append(this.template(this.model.toJSON()));
                        this.transition();
                        return true;
                    }
                },
                
                close: function () {
                    $(this.el).empty();
                    this.destory();  
                },
                
                destroy : function() {
                    //this.remove();
                },

                transition : function() {
                    console.log('pew')
                    $('#photoInfo').animate({
                        width: '700px',
                        marginLeft: '142px'
                    }, 500);
                }
            });

            window.PhotosPage = Backbone.View.extend({
                template : Handlebars.compile($('#PhotosPage-template').html()),

                events : {
                    'click .photoView' : 'openPhoto'
                },

                initialize : function() {
                    this.controller = this.options.controller;
                    this.collection.bind('reset', this.render, this);
                },

                render : function() {
                    var collection = this.collection, $el = $('#photos'), self = this, view;

                    $(this.el).html(this.template({}));
                    collection.each(function(photo) {
                        view = new window.PhotoView({
                            model : photo,
                            el : $('#photosList'),
                            controller : self.controller
                        });
                        view.render();
                    });
                },

                openPhoto : function(event) {
                    var id = $(event.currentTarget).attr('id'), view;

                    this.controller.set({
                        position : id
                    });

                    view = new window.PhotoInfo({
                        model : this.collection.at(id),
                        el : $('#info'),
                        collection : this.collection,
                        controller : this.controller
                    });
                    view.render();
                }
            });

            window.App = Backbone.Router.extend({

                routes : {
                    '' : 'home'
                },

                home : function() {
                    this.photosPage = new window.PhotosPage({
                        el : $('#photoPage'),
                        collection : window.photos,
                        controller : window.controller
                    });
                    //this.characterPage.render();
                }
            });

            $(function() {
                window.App = new App();
                Backbone.history.start();
            })
        });

    }(jQuery));

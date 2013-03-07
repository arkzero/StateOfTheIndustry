/*Bryan Nissen - Bryan@Webizly.com*/
/*global window, Backbone,  document, Handlebars,  jQuery*/
( function($) {"use strict";
        /////-----     MODELS     -----/////
        window.Character = Backbone.Model.extend({});

        window.Controller = Backbone.Model.extend({
            defaults : {
                position : 0,
                animations : true
            }
        });

        /////-----  COLLECTIONS  -----/////

        window.Characters = Backbone.Collection.extend({
            model : window.Character,
            url : url,

            initialize : function() {
                this.fetch({
                    update : true
                });
            }
        });

        window.characters = new window.Characters();
        window.controller = new window.Controller();

        $(document).ready(function() {

            /////-----     VIEWS     -----/////

            window.CharacterList = Backbone.View.extend({
                template : Handlebars.compile($('#CharacterList-template').html()),

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

                    $('.character').removeClass('selected');
                    $('#' + pos + '.character').addClass('selected');

                }
            });

            window.CharacterInfo = Backbone.View.extend({
                template : Handlebars.compile($('#CharacterInfo-template').html()),

                initialize : function() {
                    this.controller = this.options.controller;
                },

                render : function() {
                    if(this.controller.get('animations')){
                        $(this.el).append(this.template(this.model.toJSON()));
                        this.transition();
                        return true;
                    }
                },

                destroy : function() {
                    //this.remove();
                },

                transition : function() {
                    console.log('pew')
                    var self = this;
                    //$('.infoItem').css('opacity', '0')
                    this.controller.set({
                        animations : false
                    })
                    $('.new').animate({
                        width : '552px',
                        padding : '20px'
                    }, 1000, function() {
                        $(this).removeClass('new');
                        $(this).addClass('old');
                        self.controller.set({
                                animations : true
                            })
                    });

                    $('.old').css('padding', '20px 0px');
                    $('.old').animate({
                        width : '0px'
                    }, 1000, function() {
                        $(this).remove();
                    });
                }
            });

            window.CharacterPage = Backbone.View.extend({
                template : Handlebars.compile($('#CharacterPage-template').html()),

                events : {
                    'click .character' : 'openCharacter'
                },

                initialize : function() {
                    this.controller = this.options.controller;
                    this.collection.bind('reset', this.render, this);
                },

                render : function() {
                    var collection = this.collection, $el = $('#characterList'), self = this, view;

                    $(this.el).html(this.template({}));
                    collection.each(function(character) {
                        view = new window.CharacterList({
                            model : character,
                            el : $('#characterList'),
                            controller : self.controller
                        });
                        view.render();
                    });
                },

                openCharacter : function(event) {
                    var id = $(event.currentTarget).attr('id'), view;

                    this.controller.set({
                        position : id
                    });

                    view = new window.CharacterInfo({
                        model : this.collection.at(id),
                        el : $('#characterInfo'),
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
                    this.characterPage = new window.CharacterPage({
                        el : $('#charactersPage'),
                        collection : window.characters,
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

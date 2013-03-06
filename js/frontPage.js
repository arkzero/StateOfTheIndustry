/*Bryan Nissen - Bryan@Webizly.com*/
/*global window, Backbone,  document, Handlebars,  jQuery*/
(function ($) {
    "use strict";
    /////-----     MODELS     ------/////

    window.NewsItem = Backbone.Model.extend({

    });

    window.Controller = Backbone.Model.extend({
        defaults: {
            slidePosition: 0,
            slideLength: 4,
            delay: 7000,
            feedLength: 5
        },
        
        nextSlide: function () {
            var position = this.get('slidePosition'),
                length = this.get('slideLength');
            
            if (position < length - 1){
                position++;
            }else{
                position = 0;
            }
            this.set({'slidePosition': position});
        },
        
        increaseFeed: function() {
        	var length = this.get('feedLength');
        	length += 5;
        	this.set({feedLength: length});
        }
    });

    window.controller = new window.Controller();

    /////-----  COLLECTIONS  -----/////

    window.NewsItems = Backbone.Collection.extend({
        model: window.NewsItem,
        url: 'json/newsFeed.json',

        initialize: function () {
            this.fetch({
                update: true
            });
        }

    });

    window.newsItems = new window.NewsItems();

    window.SlideshowItems = Backbone.Collection.extend({
        model: window.NewsItem,

        initialize: function () {
            this.newsItems = window.newsItems;
            this.newsItems.bind('reset', this.sort, this);

            this.length = 5; //Number of items in slideshow
        },

        sort: function () {
            var promoted = false,
                length = 0,
                self = this;

            this.newsItems.each(function (item) {
                promoted = item.get('promoted');
                if (promoted && length < self.length) {
                    self.add(item);
                    length += 1;
                }
            });
            this.trigger('reset')
        }
    });

    window.slideShow = new window.SlideshowItems();


    $(document).ready(function () {

        /////-----     VIEWS     -----/////

        window.FeedItemView = Backbone.View.extend({
            template: Handlebars.compile($('#FeedItem-template').html()),

            initialize: function () {
                this.controller = this.options.controller;
            },

            render: function () {
                $(this.el).append(this.template(this.model.toJSON()));
                return true;
            }
        });

        window.SlideshowItemView = Backbone.View.extend({
            template: Handlebars.compile($('#SlideshowItem-template').html()),

            initialize: function () {
                this.controller = this.options.controller;
            },

            render: function () {
                $(this.el).append(this.template(this.model.toJSON()));
                return true;
            }
        });

        window.NewsFeedView = Backbone.View.extend({
            template: Handlebars.compile($('#NewsFeed-template').html()),
			
			events: {
				'click #showMore': 'showMore'
			},
			
			initialize: function () {
				this.controller = this.options.controller;
				this.length = this.controller.get('itemsLength');
				
				this.collection.bind('reset', this.render, this);
				this.collection.bind('add', this.render, this);
				this.collection.bind('remove', this.render, this);
				this.controller.bind('change:feedLength', this.render, this);
			},
			
			render: function () {
				var collection = this.collection,
					self = this,
					length = this.controller.get('feedLength'),
					view, i = 0;
				console.log(length)
				$(this.el).html(this.template({}));
				collection.each(function(item){
					if(i < length){
						view = new FeedItemView({
							model: item,
							el: $('#feedItems'),
							controller: self.controller
						});
						view.render();
						i++;
					}
				});
			},
			
			showMore: function() {
				this.controller.increaseFeed();
			}
        });

        window.Slideshow = Backbone.View.extend({
            template: Handlebars.compile($('#Slideshow-template').html()),
            
            events: {
                'click .tab': 'changeSlide'
            },
			
			initialize: function () {
				this.controller = this.options.controller;
				this.length = this.controller.get('itemsLength');

				this.collection.bind('reset', this.render, this);
				this.controller.bind('change:slidePosition', this.render, this);
			},
			
			render: function () {
				var collection = this.collection,
					self = this,
					position = this.controller.get('slidePosition'),
					view,
					titles = [],i;
					
            	for (i = 0; i < 4; i += 1){
	            	titles[i] = this.collection.at(i).get('title');
	            	console.log(titles[i])
	            }
	            
				$(this.el).html(this.template({
					title0: titles[0],
					title1: titles[1],
					title2: titles[2],
					title3: titles[3]
				}));
				view = new SlideshowItemView({
					el: $('#slideshowBody'),
					model: self.collection.at(position),
					controller: self.controller
				});
				view.render();
				this.startTimer();
			},
			
			startTimer: function () {
			     var position = this.controller.get('slidePosition'),
			         delay = this.controller.get('delay'),
			         self = this;
     
			     $('#bar-'+position).animate({
			         width: '100%',
			     }, delay, function(){
			         $(this).css('width', '0px');
			         self.controller.nextSlide();
			     })
			},
			
			changeSlide: function (event) {
			    var id = $(event.currentTarget).data('id');
			    
			    this.controller.set({slidePosition: id});
			    $('.loadingBar').css('width', '0px');
			}
        });

        /////-----    ROUTER    -----/////
        window.App = Backbone.Router.extend({

            routes: {
                '': 'home'
            },

            home: function () {
                this.newsFeedView = new window.NewsFeedView({
                    el: $('#newsFeed'),
                    collection: window.newsItems,
                    controller: window.controller
                });

                this.slideShowView = new window.Slideshow({
                    el: $('#slideShow'),
                    collection: window.slideShow,
                    controller: window.controller
                });
            }

        });
        
        $(function() {
            window.App = new App();
            Backbone.history.start();
        });

    });

}(jQuery));
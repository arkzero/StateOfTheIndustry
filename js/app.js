/*Bryan Nissen - Bryan@Webizly.com*/
/*global window, Backbone,  document, Handlebars,  jQuery*/
(function ($) {
    "use strict";
    /////-----     MODELS     ------/////

    window.NewsItem = Backbone.Model.extend({

    });

    window.Controller = Backbone.Model.extend({

    });

    window.controller = new window.Controller();

    /////-----  COLLECTIONS  -----/////

    window.NewsItems = Backbone.Collection.extend({
        model: window.NewsItem,
        url: 'newsFeed.json',

        initialize: function () {
        	var self = this;
            this.fetch({
                update: true,
                success: function(){
	            	console.log(self)
	            }
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
			
			initialize: function () {
				this.controller = this.options.controller;
				this.length = this.controller.get('itemsLength');
				
				this.collection.bind('reset', this.render, this);
				this.collection.bind('add', this.render, this);
				this.collection.bind('remove', this.render, this);
			},
			
			render: function () {
				var collection = this.collection,
					self = this,
					view;
					
				$(this.el).html(this.template({}));
				collection.each(function(item){
					view = new FeedItem({
						model: item,
						el: $('#newsFeedItems'),
						controller: self.controller
					});
					view.render();
				});
				
			}
        });

        window.Slideshow = Backbone.View.extend({
            template: Handlebars.compile($('#Slideshow-template').html()),

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

                this.slideShowView = new window.SlideshowItemView({
                    el: $('#slideShow'),
                    colletion: window.slideShow,
                    controller: window.controller
                });
            }

        });

    });

}(jQuery));
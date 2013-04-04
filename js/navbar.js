(function ($) {
    $(document).ready(function () {
        $('.navButton').hover(function(event){
            $(event.currentTarget).animate({
                backgroundPositionY: '-=30'
            }, 250);
        }, function (event){
            $(event.currentTarget).animate({
                backgroundPositionY: '+=30'
            }, 250);
        });
        
    });
}(jQuery));

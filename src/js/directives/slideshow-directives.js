(function() {
    var app = angular.module('slideshow');
    var commonUtils = {};

    commonUtils.getDimensions = function(_element) {
        var obj = {};
        obj.width = _element.width;
        obj.height = _element.height;
        if (_element.width > _element.height) {
            obj.isLandscape = true;
        } else {
            obj.isLandscape = false;
        }
        return obj;
    };


    // height: 667px;
    // width: 130px;
    //        margin-left: auto;
    //        margin-right: auto;

    app
    .directive('checkOrientation', function() {
        return {
            restrict: 'A',
            link: function(scope, el, attrs) {
                var dimensions;

                $(el).load(function() {
                    dimensions = commonUtils.getDimensions(this);
                    if (!dimensions.isLandscape) {
                        el.addClass('portrait');
                    }

                });

            }
        };
    })
    .directive('fullscreenImage', ['$window', function($window) {
        return {
            restrict: 'A',
            link: function(scope, el, attrs) {
                var fullscreenToggled = false,
                    imageDimensions = {};

                $(el).load(function() {
                    imageDimensions = commonUtils.getDimensions(this);


                    // Now that we have the original image
                    // dimensions, we can add the image class.
                    el.addClass('image-tile');

                });

                el.on('click', function() {
                    var imageWrapper,
                        imageHeight,
                        imageWidth,
                        marginTop,
                        marginLeft;

                    imageWrapper = el.parent();

                    if (fullscreenToggled) {
                        fullscreenToggled = false;
                        imageWrapper.removeClass('fullscreen-wrapper');
                        el.removeClass('fullscreen-img');
                        el.removeAttr('style');
                    } else {
                        fullscreenToggled = true;
                        imageWrapper.addClass('fullscreen-wrapper');
                        el.addClass('fullscreen-img');

                        if ($(window).width() > $(window).height()) {
                            // The window is landscaped.  Show Landscape pictures
                            // as they are, show portrait pictures based on window
                            // height.
                            if (imageDimensions.isLandscape) {
                                el.css('width', '100%');
                                el.css('height', '100%');
                            } else {
                                imageWidth = $(window).width() * (3/4);
                                marginLeft = ($(window).width() - imageWidth) / 2;
                                el.css('width', imageWidth);
                                el.css('height', '100%');
                                el.css('margin-left', marginLeft);
                            }
                        } else {
                            // The window is portrait. Show the Portrait pictures
                            // as they are, show landscape pictures based on window
                            // width.
                            if (imageDimensions.isLandscape) {
                                imageHeight = $(window).height() * (9/16);
                                marginTop = ($(window).height() - imageHeight) / 2;
                                el.css('width', '100%');
                                el.css('height', imageHeight);
                                el.css('margin-top', marginTop);
                            } else {
                                el.css('width', '100%');
                                el.css('height', '100%');
                            }
                        }


                    }

                });
            }
        };
    }]);
    

})();

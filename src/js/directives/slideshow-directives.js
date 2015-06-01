(function() {
    var app = angular.module('slideshow');

    app
    .directive('fullscreenImage', ['$window', function($window) {
        return {
            restrict: 'A',
            link: function(scope, el, attrs) {
                var fullscreenToggled = false,
                    imageDimensions = {};

                $(el).load(function() {
                    imageDimensions.width = this.width;
                    imageDimensions.height = this.height;
                    if (this.width > this.height) {
                        imageDimensions.isLandscape = true;
                    } else {
                        imageDimensions.isLandscape = false;
                    }

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

                        console.log('Image Dimensions: ', imageDimensions);
                        if (imageDimensions.isLandscape) {
                            console.log('LANDSCAPE');
                        } else {
                            console.log('PORTRAIT');
                        }

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

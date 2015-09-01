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
    }])
    .directive('l2Packery', function($timeout, $window, UpdateSlidesService) {
        return {
            restrict: 'A',
            scope: {
                l2Packery: '='
            },
            link: function(scope, el, attrs, ctrl) {

                var packedGroup,
                    foundGroup,
                    draggieList = [],
                    packeryObject,
                    orderSet = false;

                var toggleArrange = function() {

                    var itemOrderMap = [];

                    $timeout(function() {

                        if (scope.l2Packery) {
                            packedGroup = el.packery({
                                gutter: 0 
                            });

                            foundGroup = packedGroup.find('.slide-tile');

                            foundGroup.each(function(i, itemElem) {
                                var sWidth, sHeight, draggie;

                                sWidth = $(itemElem).outerWidth();
                                sHeight = $(itemElem).outerHeight();

                                draggie = new Draggabilly(itemElem, {
                                    grid: [sWidth, sHeight]
                                });

                                draggieList.push(draggie);

                                packedGroup.packery('bindDraggabillyEvents', draggie);

                                // Tests if the order has ever been set for this group.
                                if ($(itemElem).data('order') !== 0) {
                                    orderSet = true;
                                }

                            });

                            if (orderSet) {
                                console.log('The order for this group has been set.');
                            } else {
                                console.log('The order for this group has NOT been set.');

                            }

                            // Set the order of the items to defaults if has the order has never been set.
                            if (!orderSet) {
                                foundGroup.each(function(i, itemElem) {
                                    $(itemElem).attr('data-order', i+1);
                                    $(itemElem).data('order', i+1);
                                });
                            }

                        } else {
                            if (packedGroup !== undefined) {

                                // Check if the order of the elements is different from when we started
                                // arranging.  If so, put them in a list and send them to the server to be updated.
                                _.each(packedGroup.packery('getItemElements'), function(item, i) {
                                    var oldOrder,
                                        newOrder;

                                    oldOrder = $(item).data('order');
                                    newOrder = i+1;

                                    // If the order has been set before, just
                                    // set the ones changed by the user.  Otherwise,
                                    // set them all in the database if
                                    // this is the first time.
                                    if (orderSet) {
                                        if (oldOrder !== newOrder) {
                                            itemOrderMap.push({
                                                id: $(item).data('pk'),
                                                oldOrder: oldOrder,
                                                newOrder: newOrder
                                            });

                                        }
                                    } else {
                                        itemOrderMap.push({
                                            id: $(item).data('pk'),
                                            oldOrder: oldOrder,
                                            newOrder: newOrder
                                        });
                                    }
                                });


                                console.log('itemOrderMap: ', itemOrderMap);

                                // Send re-order slides to the server
                                UpdateSlidesService.reorderSlides(itemOrderMap)
                                    .then(function(success) {
                                        console.log(success);
                                    }, function(error) {
                                        console.log(error);
                                    });

                                _.each(draggieList, function(drag) {
                                    var slide;
                                    // console.log('Drag: ', drag);
                                    slide = drag.$element;

                                    drag.destroy();
                                });
                                el.packery('destroy');
                            }
                        }

                    });

                };

                scope.$watch('l2Packery', function(n, o) {
                    if (n !== o) {
                        toggleArrange();
                    }

                });
            }
        };
    });
    

})();

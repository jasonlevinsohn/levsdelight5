(function() {
    var app = angular.module('slideshow');

    app
    .service('UpdateSlidesService', function($http, $rootScope, $timeout) {
        var itemsArrangedCount = 0;

        var pub = {};

        pub.reorderSlides = reorderSlides;
        pub.addReorder = addReorder;
        pub.resolveReorder = resolveReorder;
        pub.updateTitleAndDesc = updateTitleAndDesc;

        function reorderSlides(slideObj) {
            var jsonData;
            jsonData = JSON.stringify(slideObj);
            var sendObj = {
                'reorder': jsonData
            };
            return $http.post('/api/reorder/', jsonData);
        }

        // Adds to the count of reorderings happening
        function addReorder() {
            itemsArrangedCount++;
        }

        // Resolves a reordering has completed and checks if
        // all the reorderings have been completed.  If so,
        // fire a reorder complete event to re-populate the slides.
        function resolveReorder() {
            if (itemsArrangedCount > 0) {
                itemsArrangedCount--;
            }

            $timeout(function() {
                if (itemsArrangedCount === 0) {
                    $rootScope.$emit('reorder:complete', itemsArrangedCount);
                }
            });
        }

        // Send the edited slides to the server to be updated and saved.
        function updateTitleAndDesc(slides) {
            var jsonData,
                sendObj;

            jsonData = JSON.stringify(slides);
            return $http.post('/api/update/', jsonData);
        }
        
        return pub;
    })
    .service('DataService', function() {
        var pub = {};
        var self = this;

        // Add capitalization function to the String prototype
        String.prototype.cap = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        };

        // Creates a Month Map Object set for the UI Navigation
        pub.groupMonthMap = function(list) {
            console.log('Getting Grouped Month Map');
            self.monthMap = list;

            var orderedMap,
                groupedMap,
                projectMap = [],
                groupedMapArray = [];

            // Return only the fields object as part of the array.
            orderedMap = _.map(list, function(l) {
                return l.fields;
            });

            // Sort the Months forward.
            orderedMap.sort(function(a, b) {
                return a.slideshow_id - b.slideshow_id;
            });

            // Pull out the project objects.
            projectMap = _.remove(orderedMap, function(p) {
                return p.slideshow_id >= 500;
            });

            // Group all the slideshows by year.
            groupedMap = _.groupBy(orderedMap, function(m) {
                return m.year;
            });

            // Create an array of the grouped objects
            _.map(groupedMap, function(value, key) {
                groupedMapArray.push({
                    name: key,
                    list: value
                });
            });

            // Sort the grouped array descending in years.
            groupedMapArray.sort(function(a, b) {
                return b.name - a.name;
            });

            // Add the Project Group to the end.
            groupedMapArray.push({
                name: 'Projects',
                list: projectMap
            });

            return groupedMapArray;

        };

        // Sets the MonthMap used for ordering the main content when looking
        // at all the slides
        pub.setMonthMap = function(monthData, gettingAllSlides) {
            var _localMap;

            // Get just the model data
            _localMap = _.map(monthData, function(m) {
                return m.fields;
            });

            // Sort the months forward
            _localMap.sort(function(a, b) {
                return b.slideshow_id - a.slideshow_id;
            });

            // Remove the project ids, we aren't showing them in the slideshow
            if (gettingAllSlides) {
                _.remove(_localMap, function(l) {
                    return l.slideshow_id >= 500;
                });
            }

            // self.allSlidesMonthMap = _.cloneDeep(_localMap);
            self.allSlidesMonthMap = _.cloneDeep(_localMap);
            // console.log('All Slides Map: ', self.allSlidesMonthMap);

        };

        // Adds a time
        pub.addDisplayTime = function(slides) {
            var newObj,
                newList = [],
                parsedLocation,
                parsedMonth,
                parsedYear;

            _.each(slides, function(s) {
                s.displayMobileDate = moment(s.pub_date).format('MM.D.YYYY');
                s.displayDate = moment(s.pub_date).format('MMM Do, YYYY');
                // s.dateGroup = moment(s.pub_date).format('MMMM YYYY');

                // parsedLocation = s.pictureLocation.match(/([a-zA-Z]+)([0-9]+)/);
                // parsedMonth = parsedLocation[1].cap();
                // parsedYear = parsedLocation[2];

                // s.dateGroup = parsedMonth + ' ' + parsedYear;

                // console.log('Parsed Location: ', s.dateGroup);

                newList.push(s);
            });


            return newList;
        };

        // Creates an array of array of slide objects suitable for Twitter Bootstrap
        // Grid System.  Also add an show flag for displaying the image used for infinite
        // scrolling and performance.
        pub.arrangeForUi = function(slideList) {
            var newList = [],
                subList = [],
                listObj = {},
                interval = 12,
                tempHeader,
                groupedSlideList;


            // Compile the slide metadata.
            groupedSlideList = _.groupBy(slideList, 'slideshow_id');

            // are more than 12 slides in the group.
            _.each(self.allSlidesMonthMap, function(month, index) {
                var group,
                    monthSlides,
                    orderedMonthSlides;

                monthSlides = groupedSlideList[month.slideshow_id.toString()];

                // Order the month slides by the order_id.
                orderedMonthSlides = _.sortBy(monthSlides, function(s) {
                    return s.order_id;
                });

                group = month;
                group.monthsSlides = orderedMonthSlides;

                newList.push(group);

            });

            // Remove any objects in the array where no pictures
            // have been added yet.
            _.remove(newList, function(n) {

                return n.monthsSlides.length === 0;
            });

            return newList;
        };

        return pub;
    });

})();

(function() {
    var app = angular.module('slideshow');

    app
    .service('UpdateSlidesService', function($http) {

        var pub = {};
        pub.reorderSlides = reorderSlides;

        function reorderSlides(slideObj) {
            return $http.post('/api/reorder/', slideObj);
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
            // TODO: We might have to create a new group when there
            groupedSlideList = _.groupBy(slideList, 'slideshow_id');

            // are more than 12 slides in the group.
            _.each(self.allSlidesMonthMap, function(month, index) {
                var group,
                    monthSlides;

                monthSlides = groupedSlideList[month.slideshow_id.toString()];
                group = month;
                group.monthsSlides = monthSlides;

                newList.push(group);

            });

            // Remove any objects in the array where no pictures
            // have been added yet.
            _.remove(newList, function(n) {
                return n.monthsSlides === undefined;
            });

            return newList;


            // Add the first header object to the list.
            // newList.push({
            //     header: true,
            //     name: slideList[0].dateGroup
            // });

            // // Hold the current month year text.
            // tempHeader = slideList[0].dateGroup;
            
            // _.each(slideList, function (s, i) {

            //     // List length has reached the interval,
            //     // close out list and start a new.
            //     if (subList.length === interval) {
            //         newList.push({
            //             name: s.dateGroup,
            //             list: subList
            //         });
            //         subList = [];

            //     // The List has gone to a new Month, add a list
            //     // header object to the list and start a new Group.
            //     } else if (s.dateGroup !== tempHeader) {
            //         newList.push({
            //             name: s.dateGroup,
            //             list: subList
            //         });

            //         newList.push({
            //             header: true,
            //             name: s.dateGroup
            //         });

            //         // Change the temp header.
            //         tempHeader = s.dateGroup;

            //         // Clear out the sublist and start a new.
            //         subList = [];

            //     // The end of the list, but the remaining
            //     // objects in the last array and push
            //     } else if (i === slideList.length - 1) {
            //         s.showing = (i <= interval ? true : false);
            //         subList.push(s);

            //         newList.push({
            //             name: s.dateGroup,
            //             list: subList
            //         });
            //     } else {

            //         // Show the first 12 images by default. After that
            //         // let the infinite scroller show the images.
            //         s.showing = (i <= interval ? true : false);
            //         subList.push(s);
            //     }

            // });

            // return newList;

        };

        return pub;
    });

})();

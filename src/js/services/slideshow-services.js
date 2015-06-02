(function() {
    var app = angular.module('slideshow');

    app
    .service('DataService', function() {
        var pub = {};
        var self = this;

        pub.groupMonthMap = function(list) {

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

        // Adds a time
        pub.addDisplayTime = function(slides) {
            var newObj,
                newList = [];

            _.each(slides, function(s) {
                s.displayTime = moment(s.pub_date).format('h:mm A');
                s.displayMobileDate = moment(s.pub_date).format('MM.D.YYYY');
                s.displayDate = moment(s.pub_date).format('MMM Do, YYYY');
                s.dateGroup = moment(s.pub_date).format('MMMM YYYY');

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
                tempHeader;

            // Add the first header object to the list.
            newList.push({
                header: true,
                name: slideList[0].dateGroup
            });

            // Hold the current month year text.
            tempHeader = slideList[0].dateGroup;
            
            _.each(slideList, function (s, i) {

                // List length has reached the interval,
                // close out list and start a new.
                if (subList.length === interval) {
                    newList.push({
                        name: s.dateGroup,
                        list: subList
                    });
                    subList = [];

                // The List has gone to a new Month, add a list
                // header object to the list and start a new Group.
                } else if (s.dateGroup !== tempHeader) {
                    newList.push({
                        name: s.dateGroup,
                        list: subList
                    });

                    newList.push({
                        header: true,
                        name: s.dateGroup
                    });

                    // Change the temp header.
                    tempHeader = s.dateGroup;

                    // Clear out the sublist and start a new.
                    subList = [];

                // The end of the list, but the remaining
                // objects in the last array and push
                } else if (i === slideList.length - 1) {
                    s.showing = (i <= interval ? true : false);
                    subList.push(s);

                    newList.push({
                        name: s.dateGroup,
                        list: subList
                    });
                } else {

                    // Show the first 12 images by default. After that
                    // let the infinite scroller show the images.
                    s.showing = (i <= interval ? true : false);
                    subList.push(s);
                }

            });

            return newList;

        };

        return pub;
    });

})();

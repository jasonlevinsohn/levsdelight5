var slideshowApp = angular.module('slideshow', ['ui.router', 'ui.bootstrap', 'infinite-scroll'])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('levs-main', {
                url: '/',
                views: {
                    'navigation': {
                        templateUrl: 'views/navigation.html',
                        controller: 'NavigationCtrl as nav'
                    },
                    'content': {
                        templateUrl: 'views/content.html',
                        controller: 'MainContent as mc'
                    }
                }
            });
    }])
    .run(['$state', function($state) {
        $state.go('levs-main');
    }]);


slideshowApp.controller('MainContent', ['$http', 'DataService', function($http, DataService) {
    var slideshowP,
        allSlides,
        self = this;

    // Scoped Variablies
    self.monthSlides = [];
    self.orderedSlides = [];
    self.disableScroll = true;

    // Scoped Functions
    self.doScroll = function() {
        console.log('Rn the scroll');
        addSlidesToUi(2);
    };

    var init = function() {
        var localSlides;

        getAllSlides(100).then(function(success) {
            console.log('Success: ', success);
            if (success.data) {
                localSlides = _.map(success.data, function(d) {
                    return d.fields;
                });

            } else {
                $log.warn('Error retrieving all slides data');
            }

            // Add the display time formats to the slides for the UI.
            localSlides = DataService.addDisplayTime(localSlides);

            allSlides = DataService.arrangeForUi(localSlides);

            // Add the first couple of header and
            // set of 12 slide objects to the UI.
            // The rest will be added as per
            // infinite scrolling.
            addSlidesToUi(2);

            // TODO: Keep this disabled for testing CSS
            self.disableScroll = true;

        }, function(error) {
            console.log('Error retreiving slides from backend: ', error);
        });
    };

    var addSlidesToUi = function(_numberOfObjectsToAdd) {

        for (var i = 0; i < _numberOfObjectsToAdd; i++){
            console.log('All Slides Lenght: ', allSlides.length);
            if (allSlides.length > 0) {
                var obj = allSlides.shift();
                self.orderedSlides.push(obj);
                console.log('Slide: ', obj);
            } else {
                self.disableScroll = true;
            }
        }

    };
    // var init = function() {
    //     var allSlidesP;

    //     slideshowP = $http.get('http://localhost:8000/api/slideshow/2014/march/');

    //     slideshowP.then(function(success) {
    //         var slideshowData,
    //             aData,
    //             formattedData,
    //             oneSlideshow;

    //         // Parse the data from Django into a Javascript Collection

    //         // TODO: Try using a different $http function other than GET,
    //         // because we have to use Parse twice.
    //         slideshowData = JSON.parse(success.data);

    //         oneSlideshow = JSON.parse(slideshowData);

    //         formattedData = buildSlideshowArray(oneSlideshow);

    //         self.monthSlides = formattedData;

    //         console.log('Month Slides', formattedData);


    //         }, function(error) {
    //             console.log('Error: ', error);
    //         });

    //     };

    var getAllSlides = function(number) {
        var allSlidesP;

        allSlidesP = $http.get('/api/allslides/' + number + '/');


        return allSlidesP;
    };

    var buildSlideshowArray = function(slideshowMonthfromDjango) {
        var arrayOfSlides = [];
        _.each(slideshowMonthfromDjango, function(slide) {
            arrayOfSlides.push(slide.fields);
        });

        return arrayOfSlides;
    };

    init();

}])
.controller('NavigationCtrl', ['$http', '$log', 'DataService', function($http, $log, DataService) {
    console.log('Navigation Controller');

    var monthMapP,
        self = this;

    DataService.getUniqueYears();

    var init = function() {
        monthMapP = $http.get('/api/monthlist/');

        monthMapP.then(function(success) {
            var years;

            if (success.data) {
                DataService.setMonthMap(success.data);
                years = DataService.getUniqueYears();
                console.log('years: ', years);

            } else {
                $log.warn("No Month List Data");
            }
        });

    };

    // Builds a list of the years for which pictures have been
    // accumulated.
    var buildYearsList = function(list) {

    };

    init();

}])
.service('DataService', function() {
    var pub = {};
    var self = this;

    pub.setMonthMap = function(list) {
        var monthMap;

        self.monthMap = list;

    };

    pub.getUniqueYears = function() {
        var uniqueYears,
            yearsList;
            
        yearsList = _.map(self.monthMap, function(d) {
            return d.fields.year;
        });

        // Sorted Unique List
        uniqueYears = _.uniq(yearsList);

        uniqueYears.sort(function(a, b) {
            return b - a;
        });

        return uniqueYears;
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



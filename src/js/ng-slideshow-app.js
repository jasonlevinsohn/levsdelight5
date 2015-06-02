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
        var localSlides,
            numberOfSlidesToGet = 1;

        getAllSlides(numberOfSlidesToGet).then(function(success) {
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

    var monthMapP,
        self = this;

    // DataService.getUniqueYears();

    var init = function() {

        self.navCollapsed = true;

        monthMapP = $http.get('/api/monthlist/');

        monthMapP.then(function(success) {
            var years;

            if (success.data) {
                // DataService.setMonthMap(success.data);
                // years = DataService.getUniqueYears();
                // console.log('years: ', years);

                self.groupedMonthList = DataService.groupMonthMap(success.data);

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

}]);

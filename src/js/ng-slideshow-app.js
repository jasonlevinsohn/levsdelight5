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
            })
            .state('slideshow', {
                url: '/slideshow/{year}/{month}/',
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
    }]);
    // .run(['$state', function($state) {

    //     console.log('Initial State: ', $state);
    //     if ($state.current.url === '/') {
    //         $state.go('levs-main');
    //     }
    // }]);


slideshowApp.controller('MainContent', ['$http', 'DataService', '$stateParams',
        function($http, DataService, $stateParams) {

    console.log('State Params: ', $stateParams);

    var slideshowP,
        allSlides,
        self = this;

    // Scoped Variablies
    self.monthSlides = [];
    self.orderedSlides = [];
    self.disableScroll = true;
    self.noContentFound = false;
    self.slideMonth = "";
    self.slideYear = "";

    // Scoped Functions
    self.doScroll = function() {
        console.log('Rn the scroll');
        addSlidesToUi(2);
    };

    var init = function() {
        var numberOfSlidesToGet = 1;

        // Show the particular month
        if ($stateParams.year && $stateParams.month) {
            self.slideMonth = $stateParams.month;
            self.slideYear = $stateParams.year;

            getMonthSlides($stateParams.year, $stateParams.month)
                .then(function(success) {
                    console.log('Month Slide Capture: ', success.data);
                    if (success.data) {
                        // If we have slides display them, otherwise display
                        // no slides found.
                        if (success.data.length > 0) {
                            apiSlideDataToUI(success.data);
                        } else {
                            self.noContentFound = true;
                        }
                    } else {
                        $log.warn('Error retreiving ' + $stateParams.month + ' slides data');
                    }
                }, function(error) {
                    console.log('Error retreiving slides from the backend: ', error);
                });

        // Show all the months
        } else {

            getAllSlides(numberOfSlidesToGet).then(function(success) {
                console.log('Success: ', success);
                if (success.data) {
                    // If we have slides display them, otherwise display
                    // no slides found.
                    if (success.data.length > 0) {
                        apiSlideDataToUI(success.data);
                    } else {
                        self.noContentFound = true;
                    }
                } else {
                    $log.warn('Error retrieving all slides data');
                }

            }, function(error) {
                console.log('Error retreiving slides from backend: ', error);
            });
        }

    };

    var apiSlideDataToUI = function(slides) {
        var localSlides;

        localSlides = _.map(slides, function(d) {
            return d.fields;
        });

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

    var getAllSlides = function(number) {
        var allSlidesP;

        allSlidesP = $http.get('/api/allslides/' + number + '/');

        return allSlidesP;
    };

    var getMonthSlides = function(year, month) {
        var monthSlidesP;

        monthSlidesP = $http.get('/api/slideshow/' + year + '/' + month + '/');

        return monthSlidesP;
    };

    init();

}])
.controller('NavigationCtrl', ['$http', '$log', 'DataService', '$stateParams', function($http, $log, DataService, $stateParams) {

    var monthMapP,
        self = this;

    // DataService.getUniqueYears();

    var init = function() {

        self.navCollapsed = true;

        monthMapP = $http.get('/api/monthlist/');

        monthMapP.then(function(success) {
            var years;

            if (success.data) {

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

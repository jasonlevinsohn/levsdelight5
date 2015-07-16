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
                },
                resolve: {
                    monthMap: function($http) {
                        return $http.get('/api/monthlist/');
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
                },
                resolve: {
                    monthMap: function($http, $q, $rootScope) {
                        var p = $q.defer();

                        if ($rootScope.monthList) {
                            return $rootScope.monthList;
                        } else {
                            $http.get('/api/monthlist/')
                                .then(function(success) {
                                    $rootScope.monthList = success;
                                    p.resolve(success);
                                },
                                function(error) {
                                    p.reject('Unable to reteive Month List');
                                });
                        }
                        return p.promise;
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


slideshowApp.controller('MainContent', ['$http', 'DataService', '$stateParams', 'monthMap',
        function($http, DataService, $stateParams, monthMap) {

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
        console.log('scrolling');
        addSlidesToUi(1);
    };

    var init = function() {
        var numberOfSlidesToGet = 100;

        // Show the particular month
        if ($stateParams.year && $stateParams.month) {
            self.slideMonth = $stateParams.month;
            self.slideYear = $stateParams.year;

            getMonthSlides($stateParams.year, $stateParams.month)
                .then(function(success) {
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

            getAllSlides().then(function(success) {
                if (success.data) {
                    // If we have slides display them, otherwise display
                    // no slides found.
                    if (success.data.length > 0) {
                        apiSlideDataToUI(success.data, true);
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

    var apiSlideDataToUI = function(slides, isAllSlides) {
        var localSlides;


        localSlides = _.map(slides, function(d) {
            return d.fields;
        });

        console.log('Local Slides: ', localSlides);

        DataService.setMonthMap(monthMap.data, isAllSlides);

        // Add the display time formats to the slides for the UI.
        localSlides = DataService.addDisplayTime(localSlides);

        allSlides = DataService.arrangeForUi(localSlides);

        console.log('All Slides: ', allSlides.length);

        // Add the first couple of header and
        // set of 12 slide objects to the UI.
        // The rest will be added as per
        // infinite scrolling.
        // addSlidesToUi(2);

        // TODO: Keep this disabled for testing CSS
        self.disableScroll = false;

    };

    var addSlidesToUi = function(_numberOfObjectsToAdd) {

        for (var i = 0; i < _numberOfObjectsToAdd; i++){
            if (allSlides.length > 0) {
                var obj = allSlides.shift();
                self.orderedSlides.push(obj);
            } else {
                self.disableScroll = true;
            }
        }
        console.log('Ordered Slides: ', self.orderedSlides);

    };

    var getAllSlides = function(number) {
        var allSlidesP;

        // Retreive Subset
        if (number) {
            allSlidesP = $http.get('/api/allslides/' + number + '/');
        // Get all the slides listed
        } else {
            allSlidesP = $http.get('/api/allslides/');

        }

        return allSlidesP;
    };

    var getMonthSlides = function(year, month) {
        var monthSlidesP;

        monthSlidesP = $http.get('/api/slideshow/' + year + '/' + month + '/');

        return monthSlidesP;
    };

    init();

}])
.controller('NavigationCtrl', ['$http', '$log', 'DataService', '$stateParams', 'monthMap', function($http, $log, DataService, $stateParams, monthMap) {

    console.log('MonthMap: ', monthMap);

    var monthMapP,
        self = this;

    // DataService.getUniqueYears();

    var init = function() {

        self.navCollapsed = true;

        // monthMapP = $http.get('/api/monthlist/');

        // monthMapP.then(function(success) {
        //     var years;

        if (monthMap.data) {

            self.groupedMonthList = DataService.groupMonthMap(monthMap.data);
            console.log('Grouped Month List: ', self.groupedMonthList);

        } else {
            $log.warn("No Month List Data");
        }
    // });

    };

    // Builds a list of the years for which pictures have been
    // accumulated.
    var buildYearsList = function(list) {

    };

    init();

}])
.filter('capitalize', function() {
    // convert string to capitalize
    return function(input) {
        if (input) {
            return input.charAt(0).toUpperCase() + input.slice(1);
        } else {
            return input;
        }
    };
});

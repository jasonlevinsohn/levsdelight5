var slideshowApp = angular.module('slideshow', ['ui.router', 'ui.bootstrap'])
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


slideshowApp.controller('MainContent', ['$http', function($http) {
    var slideshowP,
        self = this;

    // Scoped Variablies
    self.monthSlides = [];
    self.allSlides = [];

    var init = function() {
        var allSlidesP;

        slideshowP = $http.get('http://localhost:8000/api/slideshow/2014/march/');

        slideshowP.then(function(success) {
            var slideshowData,
                aData,
                formattedData,
                oneSlideshow;

            // Parse the data from Django into a Javascript Collection

            // TODO: Try using a different $http function other than GET,
            // because we have to use Parse twice.
            slideshowData = JSON.parse(success.data);

            oneSlideshow = JSON.parse(slideshowData);

            formattedData = buildSlideshowArray(oneSlideshow);

            self.monthSlides = formattedData;

            console.log('Month Slides', formattedData);


            }, function(error) {
                console.log('Error: ', error);
            });

        };

    var getAllSlides = function() {
        var allSlidesP,
            localSlides;
            

        allSlidesP = $http.get('http://localhost:8000/api/allslides/30/');

        allSlidesP.then(function(success) {
            console.log('Success: ', success);
            if (success.data) {
                localSlides = _.map(success.data, function(d) {
                    return d.fields;
                });

            } else {
                $log.warn('Error retrieving all slides data');
            }

            console.log('All Slides: ', localSlides);

            self.allSlides = localSlides;

        }, function(error) {
            console.log('Error: ', error);
        });

    };

    var buildSlideshowArray = function(slideshowMonthfromDjango) {
        var arrayOfSlides = [];
        _.each(slideshowMonthfromDjango, function(slide) {
            arrayOfSlides.push(slide.fields);
        });

        return arrayOfSlides;
    };

    // init();
    getAllSlides();

}])
.controller('NavigationCtrl', ['$http', '$log', 'DataService', function($http, $log, DataService) {
    console.log('Navigation Controller');

    var monthMapP,
        self = this;

    DataService.getUniqueYears();

    var init = function() {
        monthMapP = $http.get('http://localhost:8000/api/monthlist/');

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

    return pub;
});



/// <reference path="../ts/definitions/angular.d.ts" />
/// <reference path="../ts/definitions/lodash.d.ts" />

console.log('awesome');

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

    var init = function() {
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

    var buildSlideshowArray = function(slideshowMonthfromDjango) {
        var arrayOfSlides = [];
        _.each(slideshowMonthfromDjango, function(slide) {
            arrayOfSlides.push(slide.fields);
        });

        return arrayOfSlides;


    };

    // init();

}])
.controller('NavigationCtrl', ['$http', '$log', function($http, $log) {
    console.log('Navigation Controller');

    var monthMapP,
        self = this;
    
    

    var init = function() {
        monthMapP = $http.get('http://localhost:8000/api/monthlist/');

        monthMapP.then(function(success) {
            var data,
                yearsList,
                uniqueYears;

            if (success.data) {
               data = success.data;
               yearsList = _.map(data, function(d: string) {
                   return d.fields.year;
               });

               // Sorted Unique List
               uniqueYears = _.uniq(yearsList);

               uniqueYears.sort(function(a, b) {
                   return b - a;
               });

               console.log('Years: ', uniqueYears);

            } else {
                $log.warn("No Month List Data");
            }
            console.log('month map: ', success);
        });

    };

    init();

}]);



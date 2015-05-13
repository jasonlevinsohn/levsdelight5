var slideshowApp = angular.module('slideshow', ['ui.router', 'ui.bootstrap'])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('levs-main', {
                url: '/',
                views: {
                    'navigation': {
                        templateUrl: 'views/navigation.html'
                    },
                    'content': {
                        templateUrl: 'views/content.html',
                        controller: 'MainContent'
                    }
                }
            });
    }])
    .run(['$state', function($state) {
        $state.go('levs-main');
    }]);


slideshowApp.controller('MainContent', ['$http', function($http) {
    var slideshowP;

    console.log('Main Content controller');

    slideshowP = $http.get('http://localhost:8000/api/slideshow/2014/march/');

    slideshowP.then(function(success) {
        console.log('Success: ', success);
    }, function(error) {
        console.log('Error: ', error);
    });
    

}]);

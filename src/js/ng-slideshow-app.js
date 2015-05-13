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


slideshowApp.controller('MainContent', function() {

    console.log('Main Content controller');

});

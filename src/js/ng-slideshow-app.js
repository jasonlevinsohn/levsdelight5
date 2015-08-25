var slideshowApp = angular.module('slideshow', [
        'ui.router',
        'ui.bootstrap',
        'infinite-scroll',
        'ngResource'])
    .config([
            '$stateProvider',
            '$urlRouterProvider',
            '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {

        // Django and Angular support csrf tokens.
        // Tell Angular which cookie to add to what header.
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

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


slideshowApp.controller('MainContent', [
        '$rootScope',
        '$http',
        'DataService',
        '$stateParams',
        'monthMap',
        'AuthFactory',
        function($rootScope, $http, DataService, $stateParams, monthMap, AuthFactory) {

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
    self.userIsAuthentic = false;
    self.arrange = false;

    // Scoped Functions
    self.doScroll = function() {
        addSlidesToUi(1);
    };

    var init = function() {

        checkAuthentication();
        watchArrange();

        var numberOfSlidesToGet = 100;

        window.stateP = $stateParams;

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
                    console.log('Success Data: ', success);
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
                addSlidesToUi(1);

            }, function(error) {
                console.log('Error retreiving slides from backend: ', error);
            });

        }

    };

    var apiSlideDataToUI = function(slides, isAllSlides) {
        var localSlides;


        localSlides = _.map(slides, function(d) {
            var obj;
            obj = d.fields;
            obj.pk = d.pk;
            return obj;
        });

        DataService.setMonthMap(monthMap.data, isAllSlides);

        // Add the display time formats to the slides for the UI.
        localSlides = DataService.addDisplayTime(localSlides);

        allSlides = DataService.arrangeForUi(localSlides);

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

    var checkAuthentication = function() {

        // Set Event Handler for when the user logs in.
        $rootScope.$on('AUTH_EVENT', function(e, data) {
            if (data !== 'anonymous') {
                self.userIsAuthentic = true;
            } else {
                self.userIsAuthentic = false;
            }

        });

        // Check if the user is logged in
        AuthFactory.isAuthenticated()
            .then(function(success) {

                if (success) {
                    self.userIsAuthentic = true;
                } else {
                    self.userIsAuthentic = false;
                }
            }, function(error) {
                $log.error(error);
            });

    };

    var watchArrange = function() {
        $rootScope.$on('nav:arrange', function(e, data) {
            console.log('Arrange has been toggled elseware');
            console.log('Event: ', e);
            console.log('Data: ', data);
            console.log('State: ', $stateParams);
            self.arrange = data;
        });

    };

    init();

}])
.controller('NavigationCtrl', [
        '$http',
        '$log',
        'DataService',
        '$stateParams',
        'monthMap',
        'AuthFactory',
        '$modal',
        '$rootScope',
        '$scope',
        function($http, $log, DataService, $stateParams, monthMap, AuthFactory, $modal, $rootScope, $scope) {


    var monthMapP,
        self = this;
    

    // Scoped Variables
    self.showFailedLogin = false;
    self.userIsAuthentic = false;
    self.navCollapsed = true;
    self.theSetUser = undefined;
    self.arrange = false;

    var init = function() {

        checkAuthentication();

        if (monthMap.data) {

            self.groupedMonthList = DataService.groupMonthMap(monthMap.data);

        } else {
            $log.warn("No Month List Data");
        }

        $stateParams.arrange = self.arrange;

    };

    // Angular does not detect auto-fill or auto-complete. If the browser
    // autofills 'username', Angular will be unaware of this and think
    // the $scope.username is blank. To workaround this we use the
    // autofill-event polyfill.
    $('#id_auth_form input').checkAndTriggerAutoFillEvent();


    // ############### Scoped Functions - BEGIN ###############

    self.toggleArrange = function() {
        self.arrange = !self.arrange;
        $rootScope.$emit('nav:arrange', self.arrange);
        $stateParams.arrange = self.arrange;
    };

    self.logout = function() {
        AuthFactory.auth.logout(function() {
            self.theSetUser = undefined;
            self.userIsAuthentic = false;
            $rootScope.$emit('AUTH_EVENT', 'anonymous');
        });
    };

    self.openLoginModal = function() {

        var modalInstance = $modal.open({
            templateUrl: 'views/modals/login.html',
            controller: 'LoginModalCtrl as login',
            scope: $scope
        });

        modalInstance.result.then(function(result) {
            if (result !== 'anonymous') {
                self.userIsAuthentic = true;
                self.theSetUser = result;
                $rootScope.$emit('AUTH_EVENT', result);
            } else {
                self.userIsAuthentic = false;
                self.theSetUser = result;
            }
        });

    };

    // ############### Scoped Functions - END ############### 

    var checkAuthentication = function() {
        // Check if the user is logged in
        console.log('Checking User Authentication...');
        AuthFactory.isAuthenticated()
            .then(function(success) {

                self.theSetUser = success;
                if (success) {
                    self.userIsAuthentic = true;
                } else {
                    self.userIsAuthentic = false;
                }
            }, function(error) {
                $log.error(error);
            });

    };

    init();

}])
.controller('LoginModalCtrl', function($modalInstance, AuthFactory) {
    var self = this;
    console.log('ModalInstance');
    console.log($modalInstance);

    self.userPassInvalid = false;

    var getCredentials = function() {
        return {
            username: self.l2Username,
            password: self.l2Password
        };
    };

    self.login = function() {
        AuthFactory.auth.login(getCredentials())
            .$promise
            .then(function(data) {
                // User/Pass is good
                // self.user = data.username;
                // $modalInstance.close(data.username);
                if (data.code === 0 && data.status === 'active') {
                    AuthFactory.setAuthStatus(data.user);
                    $modalInstance.close(data.user);
                } else if (data.code === 2 && data.status === 'incorrect_password') {
                    self.userPassInvalid = true;
                }
            })
            .catch(function(fail) {
                // Incorrect user/pass
                self.userPassInvalid = true;
                console.log('Login Failure. :( | ', fail);
            });
    };

})
.filter('capitalize', function() {
    // convert string to capitalize
    return function(input) {
        if (input) {
            return input.charAt(0).toUpperCase() + input.slice(1);
        } else {
            return input;
        }
    };
})
// ############### Authentication Section - BEGIN ############### 
.factory('AuthFactory', function($resource, $q) {
    var self = this,
        pub = {};

    self.isLoggedIn = undefined; 

    function add_auth_header(data, headersGetter) {
        // Credentials must be base64 encoded per HTTP spec
        var headers = headersGetter();
        headers['Authorization'] = ('Basic ' + btoa(data.username + ':' + data.password));
    }

    // Here be the endpoints to call.
    // We need to escape trailing dashes.  Angular strips unescaped trailing slashes.
    // Django redirects URL's to ending slashes for SEO reasons. Auth Post can not be
    // sent with a redirect.  We want Angular to keep the slashes.
    pub = {
        auth: $resource('/api/auth\\/', {}, {
            login: {
                method: 'POST',
                transformRequest: add_auth_header
            },
            logout: {
                method: 'DELETE'
            },
            checkAuthentication: {
                method: 'GET'
            }
        }),
        users: $resource('/api/users\\/', {}, {
            create: {
                method: 'POST'
            }
        }),
        isAuthenticated: function() {
            var d = $q.defer();

            // First we check if we have called this API already,
            // and use the values returned.  Otherwise call the api.
            if (self.isLoggedIn) {
                if (self.isLoggedIn !== 'anonymous') {
                    d.resolve(self.isLoggedIn);
                } else {
                    d.resolve(false);
                }
            } else {
                pub.auth.checkAuthentication()
                    .$promise
                    .then(function(data) {
                        if (data.user !== 'anonymous') {
                            d.resolve(data.user);
                        } else {
                            d.resolve(false);
                        }
                    }, function(error) {
                        d.reject('Error retreiving Auth Status: ', error);
                    });
            }
            return d.promise;

        },
        setAuthStatus: function(_isAuth) {
            self.isLoggedIn = _isAuth;
        }
    };

    return pub;

});
// ############### Authentication Section - END ############### 

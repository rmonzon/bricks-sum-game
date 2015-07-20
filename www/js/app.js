// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'controllers', 'services', 'pascalprecht.translate', 'ngCordova', 'ngCordovaOauth'])

.config(['$ionicConfigProvider', function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom'); // other values: top
    $ionicConfigProvider.views.maxCache(0);
}])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    //$cordovaPlugin.someFunction().then(success, error);
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('home', {
      url: "/home",
      public: true,
      templateUrl: "templates/home.html",
      controller: 'LoginController',
      resolve: {
        factoryInitialized: function (mainFactory) {
          return mainFactory.initApp();
        }
      }
    })

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })
    .state('register', {
      url: "/register",
      public: true,
      templateUrl: "templates/register.html",
      controller: 'RegisterController',
      resolve: {
        factoryInitialized: function (mainFactory) {
          return mainFactory.initApp();
        }
      }
    })
    .state('help', {
      url: "/help",
      public: true,
      templateUrl: "templates/help.html",
      controller: 'HelpController',
      resolve: {
        factoryInitialized: function (mainFactory) {
          return mainFactory.initApp();
        }
      }
    })
    .state('ranking', {
      url: "/ranking",
      public: true,
      templateUrl: "templates/ranking.html",
      controller: 'RankingController',
      resolve: {
        factoryInitialized: function (mainFactory) {
          return mainFactory.initApp();
        }
      }
    })
    .state('badges', {
      url: "/badges",
      public: true,
      templateUrl: "templates/badges.html",
      controller: 'BadgesController',
      resolve: {
        factoryInitialized: function (mainFactory) {
          return mainFactory.initApp();
        }
      }
    })
    .state('game', {
      url: "/game",
      public: true,
      templateUrl: "templates/game.html",
      controller: 'GameController',
      resolve: {
        factoryInitialized: function (mainFactory) {
          return mainFactory.initApp();
        }
      }
    })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/dashboard.html',
        controller: 'MainController'
      }
    },
    resolve: {
      factoryInitialized: function (mainFactory) {
        return mainFactory.initApp();
      }
    }
  })
    .state('tab.settings', {
      url: '/settings',
      views: {
        'tab-settings': {
          templateUrl: 'templates/settings.html',
          controller: 'SettingsController'
        }
      },
      resolve: {
        factoryInitialized: function (mainFactory) {
          return mainFactory.initApp();
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');

});

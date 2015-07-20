/**
 * Created by Raul Rivero on 7/7/2015.
 */

angular.module('controllers').service('GenericController', function($state, $timeout, $ionicPopup, $ionicLoading, mainFactory) {

  var $scope = null;

  this.init = function (_$scope) {
    $scope = _$scope;
    $scope.modelGUI = {};
    $scope.backgroundMusic = null;
    $scope.cellClick = null;
    $scope.wrongSum = null;
    $scope.correctSum = null;
    $scope.my_media = null;
    $scope.userLogged = {};
    $scope.showMessage = false;
    $scope.messageClass = "";

    $scope.loadAudioFiles = function () {
      $scope.cellClick = document.getElementById('cellClick');
      $scope.wrongSum = document.getElementById('wrongSum');
      $scope.correctSum = document.getElementById('correctSum');
      $scope.backgroundMusic = document.getElementById('gameMusic');

      //only for Android
      var url = $scope.cellClick.getAttribute('src');
      $scope.cellClick = new Media('/android_asset/www/' + url, function () { console.log("Audio Success"); }, function (err) { console.log("Audio Error: " + err); });

      url = $scope.wrongSum.getAttribute('src');
      $scope.wrongSum = new Media('/android_asset/www/' + url, function () { console.log("Audio Success"); }, function (err) { console.log("Audio Error: " + err); });

      url = $scope.correctSum.getAttribute('src');
      $scope.correctSum = new Media('/android_asset/www/' + url, function () { console.log("Audio Success"); }, function (err) { console.log("Audio Error: " + err); });

      //iOS playback indefinitely
      //$scope.backgroundMusic.play({ numberOfLoops: 9999999 });

      //Android
      var loop = function (status) {
        if (status === Media.MEDIA_STOPPED) {
          $scope.backgroundMusic.play();
        }
      };

      url = $scope.backgroundMusic.getAttribute('src');
      $scope.backgroundMusic = new Media('/android_asset/www/' + url, function () { console.log("Audio Success"); }, function (err) { console.log("Audio Error: " + err); }, loop);

    };

    $scope.validateNumbers = function (event) {
      var charCode = (event.which) ? event.which : event.keyCode;
      if ((charCode < 48 || charCode > 57) && charCode !== 8) {
        $ionicLoading.show({
          template: 'Invalid character!'
        });
        $timeout(function () {
          $ionicLoading.hide();
        }, 1000);
        event.preventDefault();
      }
    };

    $scope.showMessage = function (message) {
      $ionicLoading.show({
        template: message
      });
    };

    $scope.hideMessage = function (time) {
      $timeout(function () {
        $ionicLoading.hide();
      }, time);
    };

    $scope.goToPage = function (name) {
      $state.go(name);
    };

    $scope.UpdateUserLoggedInfo = function () {
      $scope.userLogged = JSON.parse(mainFactory.getUserFromStorage() || '{}');
      if (typeof $scope.userLogged.user_bricksgame_settings == "string") {
        $scope.userLogged.user_bricksgame_settings = JSON.parse($scope.userLogged.user_bricksgame_settings);
      }
    };

    $scope.UpdateUserLoggedInfo();
  };
});
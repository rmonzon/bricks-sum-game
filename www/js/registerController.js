/**
 * Created by Raul Rivero on 7/10/2015.
 */

angular.module('controllers').controller('RegisterController', function($scope, $state, $timeout, $ionicPopup, $ionicLoading, mainFactory, GenericController) {

  //AdMob.hideBanner();
  function init() {
    $scope.emptyPlayerId = false;
    $scope.emptyPin = false;
    $scope.emptyName = false;
    $scope.wrongPin = false;
    GenericController.init($scope);
  }

  $scope.validateAge = function () {
    if ($scope.modelGUI.age > 100) {
      $scope.showMessage("Dinosaurs disappeared long time ago, so please enter a valid age!");
      $scope.hideMessage(3000);
      $scope.modelGUI.age = "";
    }
  };

  $scope.registerUser = function () {
    if (!$scope.modelGUI.name) {
      $scope.emptyName = true;
      return;
    }
    if (!$scope.modelGUI.username) {
      $scope.emptyPlayerId = true;
      return;
    }
    if (!$scope.modelGUI.pin) {
      $scope.emptyPin = true;
      return;
    }
    if ($scope.modelGUI.pin.toString().length < 4 || $scope.modelGUI.pin.toString().length > 8) {
      $scope.showMessage("PIN number does not meet the security requirements! Read field description below.");
      $scope.wrongPin = true;
      $scope.hideMessage(2500);
      return;
    }
    $scope.modelGUI.settings = '{ "gameMusic": true, "gameSounds": true, "spanish": false }';
    $scope.modelGUI.age = $scope.modelGUI.age === undefined ? null : $scope.modelGUI.age;
    $scope.showMessage("Registering new player...");
    mainFactory.registerUser($scope.modelGUI).then(function () {
      //window.analytics.trackEvent('New user', 'Register User');
      $scope.hideMessage(0);
      showMessageSuccess();
    })
    .catch(function () {
      $scope.hideMessage(0);
      requestError("There is no internet connection! We're unable to contact our servers.");
    });
  };

  $scope.checkPlayerIdExist = function () {
    if ($scope.modelGUI.username) {
      mainFactory.getUsers().then(function (resp) {
        for (var i = 0; i < resp.data.length; i++) {
          if (resp.data[i].user_bricksgame_playerid === $scope.modelGUI.username) {
            $scope.hideMessage(0);
            showMessageError();
            $scope.modelGUI.username = "";
            return;
          }
        }
      });
    }
  };

  function requestError (msg) {
    var alertPopup = $ionicPopup.alert({
      title: 'Request error!',
      template: msg
    });
    alertPopup.then(function (res) {

    });
  }

  function showMessageError () {
    var alertPopup = $ionicPopup.alert({
      title: 'Error',
      template: "Player ID <b>" + $scope.modelGUI.username + "</b> is taken by another user. Please select a different one."
    });
    alertPopup.then(function (res) {
    });
  }

  function showMessageSuccess () {
    var alertPopup = $ionicPopup.alert({
      title: 'Confirmation',
      template: "New player <b>" + $scope.modelGUI.username + "</b> has been created succesfully!"
    });
    alertPopup.then(function (res) {
      $state.go('home');
    });
  }

  init();
});
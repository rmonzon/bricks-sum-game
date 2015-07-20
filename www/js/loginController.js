/**
 * Created by Raul Rivero on 7/6/2015.
 */

angular.module('controllers').controller('LoginController', function($scope, $state, $timeout, $ionicPopup, $ionicLoading, $cordovaOauth, mainFactory, GenericController) {

  $scope.showHelp = false;
  $scope.emptyPlayerId = false;
  $scope.emptyPin = false;
  $scope.wrongCredentials = false;

  function init() {
    GenericController.init($scope);
    $scope.UpdateLoginInfo();
  }

  $scope.loginFacebook = function () {
    $cordovaOauth.facebook("655409174603961", ["email"]).then(function (result) {
      mainFactory.getUserDataFromFacebook(result.access_token)
        .then(function (result) {
          $scope.profileData = result.data;
          alert($scope.profileData);
          $state.go('tab.dash');
        }, function (error) {
          alert(error);
        });
      }, function (error) {
        alert(error);
      });
  };

  $scope.loginUser = function () {
    if (!$scope.modelGUI.playerId) {
      $scope.emptyPlayerId = true;
      return;
    }
    if (!$scope.modelGUI.pin) {
      $scope.emptyPin = true;
      return;
    }
    $scope.showMessage("Verifying credentials...");
    mainFactory.getUsers()
      .success(function (data) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].user_bricksgame_playerid == $scope.modelGUI.playerId && data[i].user_bricksgame_pin == $scope.modelGUI.pin) {
            data[i].user_bricksgame_badges = data[i].user_bricksgame_badges ? data[i].user_bricksgame_badges.split(',') : [];
            mainFactory.setUserToStorage(JSON.stringify(data[i]));
            if ($scope.modelGUI.rememberMe) {
              var obj = {"playerId": "" + $scope.modelGUI.playerId + ""};
              mainFactory.setUserToLocalStorage(JSON.stringify(obj));
            }
            else {
              window.localStorage.removeItem('playerID');
            }
            $scope.hideMessage(0);
            $state.go('tab.dash');
            return;
          }
        }
        $scope.showMessage("Player ID and PIN combination is not correct! This system is case sensitive.");
        $scope.hideMessage(3000);
      })
      .error(function () {
        $scope.hideMessage(0);
        requestError("Something was wrong trying to contact our servers. Check your internet connection.");
      })
  };

  function requestError (msg) {
    var alertPopup = $ionicPopup.alert({
      title: 'Ohh noo!',
      template: msg
    });
    alertPopup.then(function (res) {

    });
  }

  $scope.showHelpText = function () {
    $scope.showHelp = !$scope.showHelp;
  };

  $scope.UpdateLoginInfo = function () {
    var obj = JSON.parse(mainFactory.getUserFromLocalStorage() || '{}');
    if (obj.playerId) {
      $scope.modelGUI.playerId = obj.playerId;
      /*
       var ini = obj.playerId.substr(0, 3);
       var end = obj.playerId.substr(3, obj.playerId.length);
       $scope.modelGUI.playerIdEncoded = ini + replaceAllByAsterisks(end);
       */
      $scope.modelGUI.rememberMe = true;
    }
  };

  function replaceAllByAsterisks (str) {
    var res = '';
    for (var i = 0; i < str.length; ++i) {
      res += '*';
    }
    return res;
  }

  init();
});
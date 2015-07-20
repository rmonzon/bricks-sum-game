/**
 * Created by Raul Rivero on 7/6/2015.
 */

angular.module('controllers').controller('SettingsController', function($scope, $state, $timeout, $ionicPopup, $ionicLoading, mainFactory, GenericController) {

  function init() {
    GenericController.init($scope);
    $scope.UpdateUserLoggedInfo();
    $scope.loadAudioFiles();

    $scope.modelGUI.gameSounds = $scope.userLogged.user_bricksgame_settings.gameSounds != undefined ? $scope.userLogged.user_bricksgame_settings.gameSounds : true;
    $scope.modelGUI.gameMusic = $scope.userLogged.user_bricksgame_settings.gameMusic != undefined ? $scope.userLogged.user_bricksgame_settings.gameMusic : true;
    $scope.modelGUI.enableSpanish = $scope.userLogged.user_bricksgame_settings.spanish != undefined ? $scope.userLogged.user_bricksgame_settings.spanish : false;
  }

  $scope.gameSoundsChanged = function () {
    $scope.userLogged.user_bricksgame_settings.gameSounds = $scope.modelGUI.gameSounds;
    mainFactory.setUserToStorage(JSON.stringify($scope.userLogged));
    mainFactory.setPlayerSettings($scope.userLogged.user_bricksgame_id, JSON.stringify($scope.userLogged.user_bricksgame_settings));
  };

  $scope.gameMusicChanged = function () {
    $scope.userLogged.user_bricksgame_settings.gameMusic = $scope.modelGUI.gameMusic;
    mainFactory.setUserToStorage(JSON.stringify($scope.userLogged));
    mainFactory.setPlayerSettings($scope.userLogged.user_bricksgame_id, JSON.stringify($scope.userLogged.user_bricksgame_settings));
    if ($scope.userLogged.user_bricksgame_settings.gameMusic) {
      $scope.backgroundMusic.play();
    }
    else {
      $scope.backgroundMusic.pause();
    }
  };

  $scope.languageChanged = function () {
    $scope.userLogged.user_bricksgame_settings.spanish = $scope.modelGUI.enableSpanish;
    mainFactory.setUserToStorage(JSON.stringify($scope.userLogged));
  };

  init();
});
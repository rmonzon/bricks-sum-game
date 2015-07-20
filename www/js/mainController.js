
angular.module('controllers', []).controller('MainController', function($scope, $state, mainFactory, GenericController, VERSION) {

  function init () {
    GenericController.init($scope);
    checkForUpdates();
    $scope.UpdateUserLoggedInfo();
    $scope.loadAudioFiles();

    if (!$scope.userLogged.user_bricksgame_settings.gameMusic) {
      $scope.backgroundMusic.pause();
    }
  }

  function checkForUpdates () {
    mainFactory.getAppVersion().success(function (data) {
      $scope.updateRequired = data[0].info_mathgame_version != VERSION.version;
    });
  }

  $scope.logout = function() {
    window.sessionStorage.removeItem('user');
    $state.go('home');
  };

  init();
});

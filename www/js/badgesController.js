/**
 * Created by Raul Rivero on 7/16/2015.
 */

angular.module('controllers').controller('BadgesController', function($scope, $state, $timeout, $ionicPopup, $ionicLoading, mainFactory, GenericController) {

  $scope.user_badges_img = [];

  function init () {
    GenericController.init($scope);
    $scope.UpdateUserLoggedInfo();
    $scope.loadAudioFiles();
    getBadges();
  }

  function getBadges () {
    mainFactory.getAllBadges().success(function (data) {
      if ($scope.userLogged.user_bricksgame_badges) {
        for (var i = 0; i < 9; ++i) {
          //$scope.user_badges_img.push('img/' + data[i].badge_img);
          if (i == $scope.userLogged.user_bricksgame_badges[i] - 1) {
            $scope.user_badges_img.push('img/' + data[i].badge_bricksgame_img);
          }
          else {
            $scope.user_badges_img.push('img/locked-badge.png');
          }
        }
      }
    });
  }

  init();
});
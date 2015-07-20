/**
 * Created by Raul Rivero on 7/7/2015.
 */

angular.module('controllers').controller('HelpController', function($scope, $state, $timeout, $ionicPopup, $ionicLoading, $ionicSlideBoxDelegate) {

  $scope.pos = 0;
  $scope.helpTexts = [
    'By clicking the cells you have to find the sequence of numbers whose sum is equal to the number inside the orange circle.',
    'Might be several correct cell sequences per level, the more cells you use to find the sum, the more points you\'ll get.',
    'If the sum of your selected cells is greater than the one you have to find, it\'ll be a wrong attempt, you\'ll have 3 wrong attempts per game.'];

  $scope.navSlide = function(index) {
    $scope.pos = index;
    $ionicSlideBoxDelegate.slide(index, 500);
  };
});
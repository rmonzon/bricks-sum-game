/**
 * Created by Raul Rivero on 7/7/2015.
 */

angular.module('controllers').controller('GameController', function($scope, $rootScope, $state, $interval, $timeout, $ionicPopup, mainFactory, GenericController) {

  var stop;

  function init () {
    $scope.rows = [];
    $scope.cols = [];
    $scope.board = [];
    $scope.boardSize = { rows: 0, cols: 0 };
    $scope.brickClass = "";
    $scope.brickNumClass = "";
    $scope.timeUpClass = "";
    $scope.timeupProgressBar = "";
    $scope.gameTime = 0;
    $scope.currentTime = 0;
    $scope.gamesPlayed = 0;
    $scope.level = 0;
    $scope.score = 0;
    $scope.wrongAttempts = 0;
    $scope.difficulty = {};
    $scope.answer = 0;
    $scope.numCorrectCells = 0;
    $scope.currentSum = 0;
    $scope.selectedCells = [];
    $scope.badges = [];
    $scope.messageCorrect = "";
    $scope.leaveGame = false;
    $scope.difficultyColors = ['easy-level-memory', 'medium-level-memory', 'hard-level-memory'];
    $scope.wonGame = false;

    GenericController.init($scope);
    $scope.UpdateUserLoggedInfo();
    getAllBadges();
    $scope.loadAudioFiles();
    $scope.play();
  }

  $scope.play = function () {
    $scope.wonGame = false;
    $scope.gameStarted = true;
    $scope.gameTimeout = false;
    setGameParams();
    generateAnswer();
    startTimer();
  };

  function hasMoreMoves () {
    for (var i = 0; i < $scope.boardSize.rows; ++i) {
      for (var j = 0; j < $scope.boardSize.cols; ++j) {
        if (!$scope.board[i][j].visited) {
          if ($scope.currentSum + $scope.board[i][j].value <= $scope.answer) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function getAllBadges () {
    mainFactory.getAllBadges().success(function (data) {
      $scope.badges = data;
    });
  }

  $scope.onClickCell = function (r, c) {
    if (!$scope.board[r][c].visited && !$scope.wonGame) {
      $scope.board[r][c].visited = true;
      $scope.currentSum += $scope.board[r][c].value;
      if ($scope.currentSum < $scope.answer) {
        $scope.selectedCells.push({ row: r, col: c });
        if (hasMoreMoves()) {
          if ($scope.userLogged.user_bricksgame_settings.gameSounds) {
            $scope.cellClick.play();
          }
          $scope.board[r][c].class = 'button-balanced shake-cell shake-cell-slow';
        }
        else {
          if ($scope.userLogged.user_bricksgame_settings.gameSounds) {
            $scope.wrongSum.play();
          }
          $scope.board[r][c].class = 'button-balanced shake-cell shake-cell-slow';
          $scope.messageCorrect = "No moves!";
          $scope.messageClass = "animated tada";
          $scope.wrongAttempts++;
          if ($scope.wrongAttempts == 3) {
            $scope.timeUpClass = "";
            $scope.timeupProgressBar = "";
            openDialogGameOver();
          }
          else {
            $timeout(function () {
              $scope.messageClass = "animated bounceOutUp";
              for (var i = 0; i < $scope.selectedCells.length; ++i) {
                $scope.board[$scope.selectedCells[i].row][$scope.selectedCells[i].col].class = '';
                $scope.board[$scope.selectedCells[i].row][$scope.selectedCells[i].col].visited = false;
              }
              $scope.selectedCells = [];
              $scope.currentSum = 0;
            }, 1000);
          }
        }
      }

      if ($scope.currentSum === $scope.answer) {
        $scope.wonGame = true;
        var percent = (parseInt($scope.seconds) * 100) / $scope.gameTime;
        $scope.score = $scope.score + Math.round(((($scope.selectedCells.length + 1) - $scope.wrongAttempts) * $scope.level) + (percent / 10));
        $scope.wrongAttempts = 0;
        $scope.gamesPlayed++;
        if ($scope.userLogged.user_bricksgame_settings.gameSounds) {
          $scope.correctSum.play();
        }
        $scope.stopInterval();
        $scope.board[r][c].class = 'button-balanced shake-cell shake-cell-slow';
        $scope.showMessage = true;
        var nextLevel = getNextLevel();
        var bIndex = getIndexBadgeEarned(nextLevel);
        if (bIndex === -1) {
          if ($scope.level != nextLevel) {
            $scope.messageCorrect = "Level " + $scope.level + " completed!";
            $scope.messageClass = "new-level-label animated tada";
          }
          else {
            $scope.messageCorrect = "Great Job!";
            $scope.messageClass = "animated tada";
          }
          $timeout(function () {
            $scope.messageClass = "animated bounceOutUp";
            for (var i = 0; i < $scope.boardSize.rows; ++i) {
              for (var j = 0; j < $scope.boardSize.cols; ++j) {
                $scope.board[i][j].class = 'animated bounceOut';
                $scope.board[i][j].visible = false;
              }
            }
            $timeout($scope.play, 1200);
          }, 1200);
        }
        else {
          $scope.userLogged.user_bricksgame_badges.push("" + bIndex + "");
          mainFactory.setUserToStorage(JSON.stringify($scope.userLogged));
          mainFactory.addBadgeToPlayer($scope.userLogged);
          openDialogNewBadge($scope.badges[bIndex - 1], nextLevel);
        }
        $scope.currentSum = 0;
        $scope.selectedCells = [];
      }

      if ($scope.currentSum > $scope.answer) {
        $scope.wrongAttempts++;
        if ($scope.wrongAttempts == 3) {
          $scope.timeUpClass = "";
          $scope.timeupProgressBar = "";
          openDialogGameOver();
        }
        else {
          if ($scope.userLogged.user_bricksgame_settings.gameSounds) {
            $scope.wrongSum.play();
          }
          $scope.board[r][c].class = 'button-assertive';
          $scope.selectedCells.push({ row: r, col: c });
          $timeout(function () {
            for (var i = 0; i < $scope.selectedCells.length; ++i) {
              $scope.board[$scope.selectedCells[i].row][$scope.selectedCells[i].col].class = '';
              $scope.board[$scope.selectedCells[i].row][$scope.selectedCells[i].col].visited = false;
            }
            $scope.selectedCells = [];
            $scope.currentSum = 0;
          }, 500);
        }
      }
    }
  };

  function rebuildGameBoard () {
    $scope.rows = [];
    $scope.cols = [];
    for (var i = 0; i < $scope.boardSize.rows; ++i) {
      $scope.rows.push(i);
      $scope.board.push([]);
    }
    for (i = 0; i < $scope.boardSize.cols; ++i) {
      $scope.cols.push(i);
    }
    for (i = 0; i < $scope.boardSize.rows; ++i) {
      for (var j = 0; j < $scope.boardSize.cols; ++j) {
        $scope.board[i][j] = { value: -1, visible: true, class: '', visited: false };
        $scope.board[i][j].value = Math.floor(Math.random() * ($scope.boardSize.rows * $scope.boardSize.cols) + 1);
      }
    }
  }

  function generateAnswer () {
    var auxArr = [];
    $scope.answer = 0;
    for (var i = 0; i < $scope.numCorrectCells; ++i) {
      var pos = Math.floor(Math.random() * ($scope.boardSize.rows * $scope.boardSize.cols));
      if (auxArr.indexOf(pos) == -1) {
        auxArr.push(pos);
        var x = Math.floor(pos / $scope.boardSize.cols), y = pos - (x * $scope.boardSize.cols);
        $scope.answer += $scope.board[x][y].value;
      }
      else {
        --i;
      }
    }
  }

  function setGameParams () {
    if ($scope.gamesPlayed < 2) {
      $scope.level = 1;
      $scope.gameTime = 20;
      $scope.currentTime = 20;
      $scope.difficulty = { id: 0, name: "Easy"};
      $scope.widthClass = "col-33";
      $scope.brickClass = "bricks-3-cols";
      $scope.brickNumClass = "brick-num-3-cols";
      $scope.numCorrectCells = 4;
      $scope.boardSize.rows = 3;
      $scope.boardSize.cols = 3;
      rebuildGameBoard();
      return;
    }
    if ($scope.gamesPlayed >= 2 && $scope.gamesPlayed < 4) {
      $scope.level = 2;
      $scope.gameTime = 20;
      $scope.currentTime = 20;
      $scope.difficulty = { id: 0, name: "Easy"};
      $scope.numCorrectCells = 5;
      $scope.widthClass = "col-33";
      $scope.brickClass = "bricks-3-cols";
      $scope.brickNumClass = "brick-num-3-cols";
      $scope.boardSize.rows = 3;
      $scope.boardSize.cols = 3;
      rebuildGameBoard();
      return;
    }
    if ($scope.gamesPlayed >= 4 && $scope.gamesPlayed < 7) {
      $scope.level = 3;
      $scope.gameTime = 20;
      $scope.currentTime = 20;
      $scope.difficulty = { id: 0, name: "Easy"};
      $scope.numCorrectCells = 6;
      $scope.widthClass = "col-33";
      $scope.brickClass = "bricks-3-cols";
      $scope.brickNumClass = "brick-num-3-cols";
      $scope.boardSize.rows = 4;
      $scope.boardSize.cols = 3;
      rebuildGameBoard();
      return;
    }
    if ($scope.gamesPlayed >= 7 && $scope.gamesPlayed < 9) {
      $scope.level = 3;
      $scope.gameTime = 25;
      $scope.currentTime = 25;
      $scope.difficulty = { id: 0, name: "Easy"};
      $scope.numCorrectCells = 7;
      $scope.widthClass = "col-33";
      $scope.brickClass = "bricks-3-cols";
      $scope.brickNumClass = "brick-num-3-cols";
      $scope.boardSize.rows = 4;
      $scope.boardSize.cols = 3;
      rebuildGameBoard();
      return;
    }
    if ($scope.gamesPlayed >= 9 && $scope.gamesPlayed < 12) {
      $scope.level = 4;
      $scope.gameTime = 30;
      $scope.currentTime = 30;
      $scope.difficulty = { id: 1, name: "Medium"};
      $scope.numCorrectCells = 8;
      $scope.widthClass = "col-25";
      $scope.brickClass = "bricks-4-cols";
      $scope.brickNumClass = "brick-num-4-cols";
      $scope.boardSize.rows = 4;
      $scope.boardSize.cols = 4;
      rebuildGameBoard();
      return;
    }
    if ($scope.gamesPlayed >= 12 && $scope.gamesPlayed < 14) {
      $scope.level = 5;
      $scope.gameTime = 30;
      $scope.currentTime = 30;
      $scope.difficulty = { id: 1, name: "Medium"};
      $scope.numCorrectCells = 9;
      $scope.widthClass = "col-25";
      $scope.brickClass = "bricks-4-cols";
      $scope.brickNumClass = "brick-num-4-cols";
      $scope.boardSize.rows = 4;
      $scope.boardSize.cols = 4;
      rebuildGameBoard();
      return;
    }
    if ($scope.gamesPlayed >= 14 && $scope.gamesPlayed < 18) {
      $scope.level = 5;
      $scope.gameTime = 35;
      $scope.currentTime = 35;
      $scope.difficulty = { id: 1, name: "Medium"};
      $scope.numCorrectCells = 10;
      $scope.widthClass = "col-25";
      $scope.brickClass = "bricks-4-cols";
      $scope.brickNumClass = "brick-num-4-cols";
      $scope.boardSize.rows = 5;
      $scope.boardSize.cols = 4;
      rebuildGameBoard();
      return;
    }
    if ($scope.gamesPlayed >= 18 && $scope.gamesPlayed < 23) {
      $scope.level = 6;
      $scope.gameTime = 40;
      $scope.currentTime = 40;
      $scope.difficulty = { id: 1, name: "Medium"};
      $scope.numCorrectCells = 12;
      $scope.widthClass = "col-25";
      $scope.brickClass = "bricks-4-cols";
      $scope.brickNumClass = "brick-num-4-cols";
      $scope.boardSize.rows = 5;
      $scope.boardSize.cols = 4;
      rebuildGameBoard();
      return;
    }
    if ($scope.gamesPlayed >= 23 && $scope.gamesPlayed < 26) {
      $scope.level = 7;
      $scope.gameTime = 50;
      $scope.currentTime = 50;
      $scope.difficulty = { id: 2, name: "Hard"};
      $scope.numCorrectCells = 14;
      $scope.widthClass = "col-20";
      $scope.brickClass = "bricks-5-cols";
      $scope.brickNumClass = "brick-num-5-cols";
      $scope.boardSize.rows = 5;
      $scope.boardSize.cols = 5;
      rebuildGameBoard();
      return;
    }
    if ($scope.gamesPlayed >= 26 && $scope.gamesPlayed < 30) {
      $scope.level = 7;
      $scope.gameTime = 55;
      $scope.currentTime = 55;
      $scope.difficulty = { id: 2, name: "Hard"};
      $scope.numCorrectCells = 15;
      $scope.widthClass = "col-20";
      $scope.brickClass = "bricks-5-cols";
      $scope.brickNumClass = "brick-num-5-cols";
      $scope.boardSize.rows = 5;
      $scope.boardSize.cols = 5;
      rebuildGameBoard();
      return;
    }
    if ($scope.gamesPlayed >= 30 && $scope.gamesPlayed < 35) {
      $scope.level = 8;
      $scope.gameTime = 60;
      $scope.currentTime = 60;
      $scope.difficulty = { id: 2, name: "Hard"};
      $scope.numCorrectCells = 16;
      $scope.widthClass = "col-20";
      $scope.brickClass = "bricks-5-cols";
      $scope.brickNumClass = "brick-num-5-cols";
      $scope.boardSize.rows = 5;
      $scope.boardSize.cols = 5;
      rebuildGameBoard();
      return;
    }
    if ($scope.gamesPlayed >= 35 && $scope.gamesPlayed < 40) {
      $scope.level = 9;
      $scope.gameTime = 60;
      $scope.currentTime = 60;
      $scope.difficulty = { id: 2, name: "Hard"};
      $scope.numCorrectCells = 18;
      $scope.widthClass = "col-20";
      $scope.brickClass = "bricks-5-cols";
      $scope.brickNumClass = "brick-num-5-cols";
      $scope.boardSize.rows = 6;
      $scope.boardSize.cols = 5;
      rebuildGameBoard();
      return;
    }
    if ($scope.gamesPlayed >= 40) {
      $scope.level = 10;
      $scope.gameTime = 60;
      $scope.currentTime = 60;
      $scope.difficulty = { id: 2, name: "Hard"};
      $scope.numCorrectCells = 19;
      $scope.widthClass = "col-20";
      $scope.brickClass = "bricks-5-cols";
      $scope.brickNumClass = "brick-num-5-cols";
      $scope.boardSize.rows = 6;
      $scope.boardSize.cols = 5;
      rebuildGameBoard();
    }
  }

  /**
   * Returns -1 if the user already has a badge, otherwise returns its index
   * @param level
   * @returns {number}
   */
  function getIndexBadgeEarned (level) {
    var index;
    switch (level) {
      case 2:
        index = $scope.userLogged.user_bricksgame_badges.indexOf('1');
        return index === -1 ? 1 : -1;
      case 3:
        index = $scope.userLogged.user_bricksgame_badges.indexOf('2');
        return index === -1 ? 2 : -1;
      case 4:
        index = $scope.userLogged.user_bricksgame_badges.indexOf('3');
        return index === -1 ? 3 : -1;
      case 5:
        index = $scope.userLogged.user_bricksgame_badges.indexOf('4');
        return index === -1 ? 4 : -1;
      case 7:
        index = $scope.userLogged.user_bricksgame_badges.indexOf('5');
        return index === -1 ? 5 : -1;
      case 8:
        index = $scope.userLogged.user_bricksgame_badges.indexOf('6');
        return index === -1 ? 6 : -1;
      case 9:
        index = $scope.userLogged.user_bricksgame_badges.indexOf('7');
        return index === -1 ? 7 : -1;
      case 10:
        index = $scope.userLogged.user_bricksgame_badges.indexOf('8');
        return index === -1 ? 8 : -1;
      default :
        return -1;
    }
  }

  function getNextLevel () {
    if ($scope.gamesPlayed >= 0 && $scope.gamesPlayed < 2) {
      return 1;
    }
    if ($scope.gamesPlayed >= 2 && $scope.gamesPlayed < 4) {
      return 2;
    }
    if ($scope.gamesPlayed >= 4 && $scope.gamesPlayed < 9) {
      return 3;
    }
    if ($scope.gamesPlayed >= 9 && $scope.gamesPlayed < 12) {
      return 4;
    }
    if ($scope.gamesPlayed >= 12 && $scope.gamesPlayed < 18) {
      return 5;
    }
    if ($scope.gamesPlayed >= 18 && $scope.gamesPlayed < 23) {
      return 6;
    }
    if ($scope.gamesPlayed >= 23 && $scope.gamesPlayed < 30) {
      return 7;
    }
    if ($scope.gamesPlayed >= 30 && $scope.gamesPlayed < 35) {
      return 8;
    }
    if ($scope.gamesPlayed >= 35 && $scope.gamesPlayed < 40) {
      return 9;
    }
    if ($scope.gamesPlayed >= 40) {
      return 10;
    }
  }

  function startTimer () {
    $scope.seconds = $scope.currentTime;
    $scope.timeUpClass = "";
    $scope.timeupProgressBar = "";
    var secs = $scope.currentTime, mili = 10, percent = $scope.currentTime < 20 ? 100 - ($scope.currentTime * 100 / $scope.gameTime) : 0;
    stop = $interval(function () {
      percent += 10 / $scope.gameTime;
      document.getElementById("progressbar-progress").style.width = percent + "%";
      mili--;
      if (mili === 0) {
        mili = 10;
        secs--;
        $scope.seconds = secs < 10 ? padZero(secs) : secs;
        if (secs == 5) {
          $scope.timeUpClass = "animated infinite bounceIn time-animation-secs-labels";
          $scope.timeupProgressBar = "timeup-progress-bar";
        }
        if ($scope.seconds == '00') {
          $scope.timeUpClass = "";
          $scope.timeupProgressBar = "";
          openDialogGameOver();
        }
      }
    }, 100, $scope.currentTime * 10);
  }

  function padZero (num) {
    return '0' + num;
  }

  function openDialogNewBadge (badge, nextLevel) {
    var alertPopup = $ionicPopup.alert({
      title: 'New badge!',
      template: '' +
      '<div class="row">' +
        '<div class="col col-25">' +
          '<img class="badge-image" src="img/' + badge.badge_bricksgame_img + '" />' +
        '</div>' +
        '<div class="col col-75">Congrats! You\'ve earned the <b>' + badge.badge_bricksgame_name + '</b> badge.</div>' +
      '</div>'
    });
    alertPopup.then(function (res) {
      if ($scope.level != nextLevel) {
        $scope.messageCorrect = "Level " + $scope.level + " completed!";
        $scope.messageClass = "new-level-label animated tada";
      }
      else {
        $scope.messageCorrect = "Great Job!";
        $scope.messageClass = "animated tada";
      }
      $timeout(function () {
        $scope.messageClass = "animated bounceOutUp";
        for (var i = 0; i < $scope.boardSize.rows; ++i) {
          for (var j = 0; j < $scope.boardSize.cols; ++j) {
            $scope.board[i][j].class = 'animated bounceOut';
            $scope.board[i][j].visible = false;
          }
        }
        $timeout($scope.play, 1200);
      }, 1200);
    });
  }

  function openDialogGameOver () {
    var max = $scope.userLogged.user_bricksgame_maxscore;
    var alertPopup = $ionicPopup.alert({
      title: 'Game over!',
      template: max < $scope.score ? 'You\'ve increased your overall score to <b>' + $scope.score + '</b> points!' : 'You didn\'t increase your overall score in this game.'
    });
    alertPopup.then(function (res) {
      if (max < $scope.score) {
        mainFactory.setPlayerMaxScore($scope.userLogged, $scope.score).success(function () {
          $scope.userLogged.user_bricksgame_maxscore = $scope.score;
          mainFactory.setUserToStorage(JSON.stringify($scope.userLogged));
        });
      }
      $scope.leaveGame = true;
      $scope.gameStarted = false;
      $scope.goToPage('tab.dash');
    });
  }

  $scope.exitGame = function () {
    $scope.secs = 5;
    var closed = false;
    $interval(function () {
      $scope.secs--;
    }, 1000, 5);
    var max = $scope.userLogged.user_bricksgame_maxscore;
    var timeLeft = $scope.seconds;
    $scope.stopInterval();
    var alertPopup = $ionicPopup.show({
      template: '<span>This game will close in <b>{{ secs }}</b> seconds.</span>',
      title: 'Warning!',
      scope: $scope,
      buttons: [
        {
          text: 'Cancel',
          onTap: function (e) {
            closed = true;
            alertPopup.close();
            $scope.currentTime = timeLeft;
            startTimer();
          }
        },
        {
          text: '<b>Exit</b>',
          type: 'button-positive',
          onTap: function(e) {
            alertPopup.close();
            closed = true;
            $scope.leaveGame = true;
            if (max < $scope.score) {
              mainFactory.setPlayerMaxScore($scope.userLogged, $scope.score).success(function () {
                $scope.userLogged.user_bricksgame_maxscore = $scope.score;
                mainFactory.setUserToStorage(JSON.stringify($scope.userLogged));
              });
            }
            //AdMob.hideBanner();
            $state.go('tab.dash');
          }
        }
      ]
    });
    $timeout(function() {
      if (!closed) {
        alertPopup.close();
        $scope.leaveGame = true;
        if (max < $scope.score) {
          mainFactory.setPlayerMaxScore($scope.userLogged, $scope.score).success(function () {
            $scope.userLogged.user_bricksgame_maxscore = $scope.score;
            mainFactory.setUserToStorage(JSON.stringify($scope.userLogged));
          });
        }
        //AdMob.hideBanner();
        $state.go('tab.dash');
      }
    }, 5000);
  };

  $scope.stopInterval = function() {
    if (angular.isDefined(stop)) {
      $interval.cancel(stop);
      stop = undefined;
    }
  };

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (!$scope.leaveGame) {
      event.preventDefault();
      $scope.exitGame();
    }
  });

  $scope.$on('$destroy', function() {
    $scope.stopInterval();
  });

  init();
});
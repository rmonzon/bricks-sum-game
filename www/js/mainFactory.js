
angular.module('services', []).factory('mainFactory', function($http, $q, $window) {
  var factory = { initFactory: false, connectionStr: "", url: "" };
  var apiDefer = null, apiUrl = null, proxy = null;
  factory.initApp = function () {
    // create a promise
    var deferred = $q.defer();
    var promise = deferred.promise;
    if (!factory.initFactory) {
      factory.initFactory = true;
      //factory.connectionStr = "http://192.168.1.127:5800/api/sql";
      //factory.url = "http://192.168.1.127:5800/api";
      factory.connectionStr = "http://intense-dawn-9976.herokuapp.com/api/sql";
      factory.url = "http://intense-dawn-9976.herokuapp.com/api";
      deferred.resolve(factory.initFactory);
    }
    else {
      deferred.resolve(factory.initFactory);
    }
    return promise;
  };

  factory.getAppVersion = function () {
    var request = {query: "SELECT info_mathgame_version FROM info" };
    return $http.post(factory.connectionStr, request);
  };

  factory.addBadgeToPlayer = function (user) {
    var request = {query: "UPDATE user_bricksgame SET user_bricksgame_badges = '" + user.user_bricksgame_badges.join(',') + "' WHERE user_bricksgame_id = " + user.user_bricksgame_id };
    return $http.post(factory.connectionStr, request);
  };

  factory.setPlayerMaxScore = function (user, score) {
    var request = {query: "UPDATE user_bricksgame SET user_bricksgame_maxscore = " + score + " WHERE user_bricksgame_id = " + user.user_bricksgame_id };
    return $http.post(factory.connectionStr, request);
  };

  factory.setPlayerSettings = function (userId, settings) {
    var request = {query: "UPDATE user_bricksgame SET user_bricksgame_settings = '" + settings + "' WHERE user_bricksgame_id = " + userId };
    return $http.post(factory.connectionStr, request);
  };

  factory.getAllBadges = function () {
    var request = {query: "SELECT * FROM badge_bricksgame ORDER BY badge_bricksgame_id"};
    return $http.post(factory.connectionStr, request);
  };

  factory.getUserDataFromFacebook = function (token) {
    return $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: token, fields: "id,name,gender,location,website,picture", format: "json" }});
  };

  factory.getUsers = function () {
    var request = {query: "SELECT * FROM user_bricksgame ORDER BY user_bricksgame.user_bricksgame_id"};
    return $http.post(factory.connectionStr, request);
  };

  factory.registerUser = function (user) {
    var request = {query: "INSERT INTO user_bricksgame (user_bricksgame_playerid, user_bricksgame_pin, user_bricksgame_maxscore, user_bricksgame_realname, user_bricksgame_age, user_bricksgame_settings, user_bricksgame_badges) VALUES ('" + user.username + "', " + user.pin + ", 0, '" + user.name + "', " + user.age + ", '" + user.settings + "', '')"};
    return $http.post(factory.connectionStr, request);
  };

  factory.getAllUsersOrderedByScore = function () {
    var request = {query: "SELECT * FROM user_bricksgame ORDER BY user_bricksgame.user_bricksgame_maxscore DESC"};
    return $http.post(factory.connectionStr, request);
  };

  factory.getRankingByPlayerId = function (id) {
    var request = {query: "SELECT * FROM user_bricksgame WHERE user_bricksgame_id >= " + id + " - 5 AND user_bricksgame_id <= " + id + " + 15 ORDER BY user_bricksgame.user_bricksgame_maxscore DESC limit 20"};
    return $http.post(factory.connectionStr, request);
  };

  /*** Store user's info in session store, it'll be removed when log out ***/

  factory.setUserToStorage = function (user) {
    $window.sessionStorage && $window.sessionStorage.setItem('user', user);
    return this;
  };

  factory.getUserFromStorage = function () {
    return $window.sessionStorage && $window.sessionStorage.getItem('user');
  };

  /*** Store playerID in local storage if user checked that option  ***/

  factory.setUserToLocalStorage = function (id) {
    $window.localStorage && $window.localStorage.setItem('playerID', id);
    return this;
  };

  factory.getUserFromLocalStorage = function () {
    return $window.localStorage && $window.localStorage.getItem('playerID');
  };

  return factory;
});
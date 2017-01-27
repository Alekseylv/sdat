'use strict';

/**
 * @ngdoc overview
 * @name sdatApp
 * @description
 * # sdatApp
 *
 * Main module of the application.
 */
angular.module('sdatApp', [
   'ngAnimate',
   'ngCookies',
   'ngResource',
   'ngRoute',
   'ngSanitize',
   'ngTouch',
   'xeditable'
]).config(function ($routeProvider) {
   $routeProvider
      .when('/', {
         templateUrl: 'views/main.html',
         controller: 'MainCtrl',
         controllerAs: 'main'
      })
      .otherwise({
         redirectTo: '/'
      });
}).directive('visNetwork', function () {
   return {
      restrict: 'E',
      require: '^ngModel',
      scope: {
         ngModel: '=',
         onSelect: '&',
         options: '='
      },
      link: function ($scope, $element) {
         var network = new vis.Network($element[0], $scope.ngModel, $scope.options || {});

         var onSelect = $scope.onSelect() || function () {};
         network.on('select', function (properties) {
            onSelect(properties);
         });
      }
   };
}).directive('editableTable', function () {
   return {
      restrict: 'E',
      templateUrl: 'views/editable-table.html',
      require: '^nodes',
      scope: {
         nodes: '=',
         onUpdate: '&',
         onDelete: '&',
         onCreate: '&'
      },
      controller: function ($scope) {
         $scope.saveNode = function (data, id) {
            var node = _.extend(data, {id: id});
            $scope.onUpdate({node: node});
            $scope.nodes[_.findIndex($scope.nodes, function (n) {return n.id === id;})] = node;
         };

         $scope.removeNode = function (index) {
            var node = $scope.nodes[index];
            $scope.nodes.splice(index, 1);
            $scope.onDelete({node: node});

         };

         $scope.addNode = function () {
            $scope.inserted = {
               id: $scope.nodes[$scope.nodes.length - 1].id + 1,
               label: ''
            };
            $scope.nodes.push($scope.inserted);
            $scope.onCreate({node: $scope.inserted});
         };
      }
   };
});




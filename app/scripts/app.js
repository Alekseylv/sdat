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
   'xeditable',
   'ui.bootstrap'
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
      scope: {
         nodes: '=',
         edges: '=',
         onSelect: '&',
         options: '='
      },
      link: function ($scope, $element) {
         var network = new vis.Network($element[0], {nodes: $scope.nodes, edges: $scope.edges}, $scope.options || {});

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
         onCreate: '&',
         preCreate: '&'
      },
      controller: function ($scope) {
         $scope.saveNode = function (data, id) {
            var index = _.findIndex($scope.nodes, function (n) {return n.id === id;});
            var node = _.extend($scope.nodes[index], data);
            $scope.onUpdate({node: node});
            $scope.nodes[index] = node;
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
            var result = $scope.preCreate({node: $scope.inserted});
            if (result !== undefined) {
               $scope.inserted = result;
            }
            $scope.nodes.push($scope.inserted);
            $scope.onCreate({node: $scope.inserted});
         };
      }
   };
});




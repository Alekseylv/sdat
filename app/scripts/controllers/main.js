'use strict';

angular.module('sdatApp').controller('MainCtrl', function ($scope) {
   this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
   ];

   $scope.nodes = [
      {id: 0, label: 'd0'},
      {id: 1, label: 'd1'},
      {id: 2, label: 'd2'},
      {id: 3, label: 'd3'},
      {id: 4, label: 'd4'}
   ];

   $scope.nodeDataSet = new vis.DataSet($scope.nodes);

   $scope.requirements = [
      {id: 0, label: 'req1'}
   ];

   $scope.extendRequirement = function (req) {
      req.edgeDataSet = new vis.DataSet([]);
      req.edges = _.map($scope.nodes, function () {return [];});

      return req;
   };

   $scope.requirements = _.map($scope.requirements, $scope.extendRequirement);

   $scope.ticked = function (from, to, req) {
      var edge = {id: from + '-' + to, from: parseInt(from), to: to};

      if (req.edges[from][to]) {
         req.edgeDataSet.add(edge);
      } else {
         req.edgeDataSet.remove(edge);
      }
   };

   $scope.networkOptions = {
      edges: {
         arrows: 'to'
      },
      height: '500'
   };

})
;

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

   $scope.edges = _.map($scope.nodes, function () {return [];});

   $scope.ticked = function (from, to) {
      var edge = {id: from + '-' + to, from: parseInt(from), to: to};

      if ($scope.edges[from][to]) {
         $scope.networkData.edges.add(edge);
      } else {
         $scope.networkData.edges.remove(edge);
      }
   };

   $scope.networkData = {
      nodes: new vis.DataSet($scope.nodes),
      edges: new vis.DataSet([])
   };

   $scope.networkOptions = {
      edges: {
         arrows: 'to'
      },
      height: '500'
   };

})
;

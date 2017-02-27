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

   $scope.networkOptions = {
      edges: {
         arrows: 'to'
      },
      height: '500'
   };

   $scope.requirements = [
      {id: 0, label: 'req1'}
   ];

   $scope.extendRequirement = function (req) {
      req.edgeDataSet = new vis.DataSet([]);
      req.nodeDataSet = new vis.DataSet([]);
      req.edges = _.map($scope.nodes, function () {return [];});
      return req;
   };

   $scope.requirements = _.map($scope.requirements, $scope.extendRequirement);

   $scope.ticked = function (from, to, req) {
      var edge = {id: from + '-' + to, from: parseInt(from), to: to};

      console.log(req.nodeDataSet);
      console.log(req.nodeDataSet._data);


      if (req.edges[from][to]) {
         addIfNeeded(req, from);
         addIfNeeded(req, to);
         req.edgeDataSet.add(edge);
      } else {
         req.edgeDataSet.remove(edge);
         removeIfNeeded(req, from);
         removeIfNeeded(req, to);
      }
   };
   
   var removeIfNeeded = function (req, nodeId) {
      if (getEdgesOfNode(req, nodeId).length === 0) {
         req.nodeDataSet.remove(nodeId);
      }
   };

   var addIfNeeded = function (req, nodeId) {
      if (req.nodeDataSet.get(nodeId) === null) {
         req.nodeDataSet.add($scope.nodes[nodeId]);
      }
   };

   var getEdgesOfNode = function(req, nodeId) {
      return req.edgeDataSet.get().filter(function (edge) {
         return edge.from === nodeId || edge.to === nodeId;
      });
   };

})
;

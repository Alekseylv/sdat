'use strict';

angular.module('sdatApp').controller('MainCtrl', function ($scope) {

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
        req.matrix = [];
        req.reachabilityMatrix = [];
        req.precedentSet = [];
        req.reachabilitySet = [];
        req.edges = _.map($scope.nodes, function () {
            return [];
        });
        return req;
    };

    $scope.requirements = _.map($scope.requirements, $scope.extendRequirement);

    $scope.ticked = function (from, to, req) {
        recomputeEdgesAndNodes(req, from, to);
        req.matrix = computeMatrix(req);
        req.reachabilityMatrix = computeReachabilityMatrix(req);
        req.reachabilitySet = computeReachabilitySet(req);
        req.precedentSet = computePrecedentSet(req);
    };

    var recomputeEdgesAndNodes = function (req, from, to) {
        var edge = {id: from + '-' + to, from: parseInt(from), to: to};

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

    var computeMatrix = function (req) {
        var originalMatrix = [];
        _.forEach(req.nodeDataSet._data, function (node1) {
            originalMatrix.push([]);
            _.forEach(req.nodeDataSet._data, function (node2) {
                originalMatrix[originalMatrix.length - 1].push(req.edges[node1.id][node2.id] ? 1 : 0);
            });
        });
        return originalMatrix;
    };

    var computeReachabilityMatrix = function (req) {
        const nodeCount = req.nodeDataSet.get().length;
        const originalMatrix = math.matrix(computeMatrix(req));
        const matrices = [];

        var matrix = originalMatrix;
        var iterationCount = 0;

        while (!isEmptyMatrix(matrix) && math.max(matrix) > 0) {
            matrices.push(matrix);
            matrix = math.multiply(matrix, originalMatrix);
            if (iterationCount++ > nodeCount) {
                break;
            }
        }

        if (isEmptyMatrix(matrix)) {
            return [];
        }

        return math.sign(_.reduce(matrices, function (memo, num) {
            return math.add(memo, num);
        }))._data;
    };


    var computeReachabilitySet = function (req) {
        return computeSet(req, req.reachabilityMatrix);
    };

    var computePrecedentSet = function (req) {
        return computeSet(req, math.transpose(req.reachabilityMatrix));
    };

    var computeSet = function (req, matrix) {
        return _.map(req.nodeDataSet.get(), function (node, index) {
            return _.chain(matrix[index]).map(function (x, i) {
                return {reachable: x > 0, label: req.nodeDataSet.get()[i].label};
            }).filter(function (x) {
                return x.reachable;
            }).map(function (x) {
                return x.label;
            }).value();
        });
    };

    // var printMatrix = function (matrix) {
    //     console.log('matrix');
    //     _.forEach(matrix._data, function (x) {
    //         console.log(x);
    //     });
    // };

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

    var getEdgesOfNode = function (req, nodeId) {
        return req.edgeDataSet.get().filter(function (edge) {
            return edge.from === nodeId || edge.to === nodeId;
        });
    };

    var isEmptyMatrix = function (matrix) {
        return matrix.size(matrix).length <= 1;
    };

});

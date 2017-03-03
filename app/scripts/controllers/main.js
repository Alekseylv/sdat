'use strict';

angular.module('sdatApp').controller('MainCtrl', function ($scope) {

    $scope._ = _;

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

    var populateInitialData = function () {
        _.forEach([[0, 2], [2, 2], [1, 3], [2, 4]], function (tuple) {
            $scope.requirements[0].edges[tuple[0]][tuple[1]] = true;
            recomputeEdgesAndNodes($scope.requirements[0], tuple[0], tuple[1]);
        });
        recomputeRequirement($scope.requirements[0]);
    };

    $scope.ticked = function (from, to, req) {
        recomputeEdgesAndNodes(req, from, to);
        recomputeRequirement(req);
    };

    var recomputeRequirement = function (req) {
        req.matrix = computeMatrix(req);
        req.reachabilityMatrix = computeReachabilityMatrix(req);

        req.reachabilitySet = computeReachabilitySet(req);
        req.precedentSet = computePrecedentSet(req);
        req.formattedReachabilitySet = _.map(req.reachabilitySet, forEachGetLabel);
        req.formattedPrecedentSet = _.map(req.precedentSet, forEachGetLabel);

        req.informationalElements = computeInformationalElements(req);
        req.informationalGroups = computeInformationalGroups(req);
        req.formattedInformationalElements = _.map(req.informationalElements, _.property('label'));
        req.formattedInformationalGroups = _.map(req.informationalGroups, _.property('label'));

        req.groupLevels = computeGroupLevels(req);
        req.informationalStructure = computeInformationalStructure(req);
    };

    var recomputeEdgesAndNodes = function (req, from, to) {
        var edge = {id: from + '-' + to, from: parseInt(from), to: to};

        if (req.edges[from][to]) {
            addNodeIfNeeded(req, from);
            addNodeIfNeeded(req, to);
            req.edgeDataSet.add(edge);
        } else {
            req.edgeDataSet.remove(edge);
            removeNodeIfNeeded(req, from);
            removeNodeIfNeeded(req, to);
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

        var isEmptyMatrix = function (matrix) {
            return matrix.size(matrix).length <= 1;
        };

        while (!isEmptyMatrix(matrix) && math.max(matrix) > 0) {
            matrices.push(matrix);
            matrix = math.multiply(matrix, originalMatrix);
            if (iterationCount++ > nodeCount) {
                break;
            }
        }

        return isEmptyMatrix(matrix) ? [] : math.sign(_.reduce(matrices, function (memo, num) {
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
                return {reachable: x > 0, node: req.nodeDataSet.get()[i]};
            }).filter(_.property('reachable'))
                .map(_.property('node')).value();
        });
    };

    var computeInformationalElements = function (req) {
        return computeInformation(req, _.property('isEmpty'));
    };

    var computeInformationalGroups = function (req) {
        return computeInformation(req, _.negate(_.property('isEmpty')));
    };

    var computeInformation = function (req, predicate) {
        return _.chain(req.nodeDataSet.get()).map(function (node, index) {
            node[nodeIndex(req)] = index; // used in computing group levels
            return {isEmpty: _.isEmpty(req.precedentSet[index]), node: node};
        }).filter(predicate).map(_.property('node')).value();
    };

    var computeGroupLevels = function (req) {

        var groups = req.informationalGroups;
        var maxLevels = req.informationalGroups.length * 2;
        var levels = [];

        var areIdsEqual = function (id) {
            return function (node) {
                return node.id === id;
            };
        };

        var computeSet = function (setToCompute) {
            return function (group) {
                return _.uniq(setToCompute[group[nodeIndex(req)]].concat([group]), false, _.property('id'));
            };
        };

        var filterLevels = function (setToFilter) {
            return _.filter(setToFilter, function (node) {
                return -1 === _.findIndex(levels, areIdsEqual(node.id));
            });
        };

        var nodeExists = function (setToCheck) {
            return function (node) {
                return -1 !== _.findIndex(setToCheck, areIdsEqual(node.id));
            };
        };

        var setCurrentLevel = function (currentLevel) {
            return function (x) {
                return _.extend(x, {level: currentLevel});
            };
        };

        var groupsAtCurrentLevel = function (reachables, precedents) {
            return function (g, i) {
                return _.all(reachables[i], nodeExists(precedents[i]));
            };
        };

        //actual algorithm starts

        var reachables = _.map(groups, computeSet(req.reachabilitySet));
        var precedents = _.map(groups, computeSet(req.precedentSet));

        var currentLevel = 0;
        while (!_.isEmpty(groups)) {

            var currentLevelNodes = _.filter(groups, groupsAtCurrentLevel(reachables, precedents));

            levels = levels.concat(_.map(currentLevelNodes, setCurrentLevel(currentLevel)));

            groups = _.filter(groups, _.negate(nodeExists(currentLevelNodes)));

            reachables = _.map(groups, _.compose(filterLevels, computeSet(req.reachabilitySet)));
            precedents = _.map(groups, _.compose(filterLevels, computeSet(req.precedentSet)));

            if (currentLevel > maxLevels) {
                break;
            }

            currentLevel++;
        }

        return _.sortBy(levels, _.property('id'));
    };

    var computeInformationalStructure = function (req) {
        const groupIds = _.indexBy(req.informationalGroups, 'id');
        return _.map(req.informationalGroups, function (node) {
            return _.filter(req.precedentSet[node.id], function (otherNode) {
                return !_.has(groupIds, otherNode.id);
            });
        });
    };

    // var printMatrix = function (matrix) {
    //     console.log('matrix');
    //     _.forEach(matrix._data, function (x) {
    //         console.log(x);
    //     });
    // };

    var removeNodeIfNeeded = function (req, nodeId) {
        if (getEdgesOfNode(req, nodeId).length === 0) {
            req.nodeDataSet.remove(nodeId);
        }
    };

    var addNodeIfNeeded = function (req, nodeId) {
        if (req.nodeDataSet.get(nodeId) === null) {
            req.nodeDataSet.add($scope.nodes[nodeId]);
        }
    };

    var getEdgesOfNode = function (req, nodeId) {
        return req.edgeDataSet.get().filter(function (edge) {
            return edge.from === nodeId || edge.to === nodeId;
        });
    };

    var forEachGetLabel = function (arr) {
        return _.map(arr, _.property('label'));
    };

    var nodeIndex = function (req) {
        return 'index' + req.id + '';
    };

    populateInitialData();
});

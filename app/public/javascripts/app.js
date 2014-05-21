var app = angular.module('ngrv', [ 'remoteValidation' ]);

app.controller('testCtrl', [ '$scope', '$http', function( $scope, $http ) {
	$scope.user = {};
}] );
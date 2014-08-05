angular.module('HomeCtrl', []).controller('HomeController', function($scope,$http) {

	$scope.tagline = 'To the moon and back!';	
	$scope.twit = function() {
		console.log("twitter button clicked");
		$http.get("/auth/twitter")
		.success(function (data) {
			console.log(data);
		})
		//$window.location.href = '/auth/twitter';
	}
});
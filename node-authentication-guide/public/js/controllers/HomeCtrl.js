angular.module('HomeCtrl', []).controller('HomeController', function($scope,$http,$window) {

	$scope.tagline = 'To the moon and back!';	
	$scope.twit = function() {
		console.log("twitter button clicked");
		var config = {headers:  {
		        'Access-Control-Allow-Origin': '*',
		        "X-Testing" : "testing"
		    }
		};
		$http.get("/auth/twitter",config)
		.success(function (data) {
			console.log(data);
		})
		// $window.location.href = '/auth/twitter';
	}
});
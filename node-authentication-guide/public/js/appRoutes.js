angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/geeks', {
			templateUrl: 'views/geek.html',
			controller: 'GeekController'	
		})
		
		.when('/favorite', {
					templateUrl: 'views/favorite.html',
					controller: 'FavoriteController'
		});
		
		

	$locationProvider.html5Mode(true);

}]);
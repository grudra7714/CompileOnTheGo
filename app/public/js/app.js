'use strict'	;

var compileApp = angular.module('compileApp', ['ui.router', 'ngToast']);

  compileApp.config(['ngToastProvider', function(ngToast) {
    ngToast.configure({
      verticalPosition: 'top',
      horizontalPosition: 'center',
      maxNumber: 3
    });
  }]);

compileApp.config(function ($stateProvider, $urlRouterProvider, $locationProvider){

	$urlRouterProvider.otherwise('/');

	$locationProvider.html5Mode(true);

	$stateProvider

		.state('home',{
			url: '/',
			//templateUrl: '/CodeArea/index.html',
			templateUrl: 'login/index.html',
			controller: 'homeCtrl'
		})

		.state("addUser", {
			url: '/addUser',
			templateUrl: '/api/user/addUser'
		})

		.state("codeArea",{
			url: '/codearea/new/:id',
			templateUrl: '/CodeArea/index.html',
			controller: 'profileCtrl'
		})

		.state("emailConfirm",{
			url: '/new/user/email/:confirmID',
			ctrl: 'emailCtrl'
		})
})
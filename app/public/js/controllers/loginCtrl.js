'use strict';

angular.module('compileApp')
	.controller('homeCtrl',['$scope', '$location', 'customHttp', function($scope, $location, customHttp){
		$scope.email = "abc@abc.com";
		$scope.message = "Welcome to Compile On The Go";
		$scope.mmatch = '';
		var mob = $scope.mobile ;
		$scope.username = '';
		$scope.$watch("mobile", function (newValue, oldValue){
			console.log("inside $watch function;")
			console.log($scope.mobile);
			if(newValue.length > 10 || newValue.length < 10){
				$scope.mmatch = " Invalild phone number"; 
			}else{
				$scope.mmatch = " Now thats a valild phone number"; 
			}
		})

		$scope.blur = function (){
			console.log("Inside blur function ");
			console.log ($scope.password + ": " + $scope.cpass);
			if( $scope.password	 == $scope.cpass){
				$scope.pmatch = " Password Matches ";
			}else{
				$scope.pmatch = " Password doesn't matches";
			}
		}

		$scope.login = function (){
			console.log("Inside login function");

			var params = {};

			params.email = $scope.luser.trim();
			params.password = $scope.lpass.trim();


			console.log("user:" + params.email);
			console.log("password:" + params.password);

			var details = "params=" + JSON.stringify(params);
			console.log("Details:"+details);
			customHttp.request(details, '/api/user/loginUser', "POST", function(str){
				console.log("str: " + JSON.stringify(str));
				console.log("Name: " + str['fname']);
				$scope.username = str['fname'];
				$location.path("/codearea/new/"+str['_id']);
			})
		}

		$scope.signup = function (){
			console.log("Inside signup function");

			var params = {};

			params.email = $scope.email;
			params.fname = $scope.fname;
			params.lname = $scope.lname;
			params.password = $scope.password;
			params.mobile = $scope.mobile;

			var details = "params=" + JSON.stringify(params);
			console.log("Params: " + details);

			customHttp.request(details, "/api/user/addUser", "POST", function (str){
				console.log(str);
			})
		}
	}])

.controller("emailCtrl",['$stateParams', '$scope', '$location', 'customHttp', function($stateparams, $scope, $location, customHttp){
	console.log("Confirm ID: " + $stateparams.confirmID);
}])

.controller("profileCtrl", ['$stateParams', '$scope', '$location', 'customHttp', 'ngToast', function($stateparams, $scope, $location, customHttp, ngToast){
	//console.log("Confirm ID: " + $stateparams.confirmID);

		var editor = ace.edit("editor");
		editor.setTheme("ace/theme/twilight");
		editor.session.setMode("ace/mode/c_cpp");
		editor.setOptions({
			fontSize: "15pt"
		});

		var params = {};
		params._id = $stateparams.id;
		$scope.username = '';
		var details = "params="+JSON.stringify(params);
		var query = {};
			customHttp.request(details, '/api/user/getData', "POST", function(str){
				query = str;
				console.log("str: " + JSON.stringify(str));
				console.log("Name: " + str['fname']);
				$scope.username = str['fname'];
			})

			$scope.codeSave = function(){
				console.log("Inside Code Save function");
				var code = editor.getValue();

				params = {};
				params._id = $stateparams.id;
				params.data = code;
				params.language = 'c';

				details = "params="+JSON.stringify(params);
				customHttp.request(details, "/api/user/saveCode", "POST", function (str){
					ngToast.create({
					  className: 'success',
					  content: 'Code Saved',
					  horizontalPosition: 'center'
					});
				})
					//console.log(editor.getValue());
			}

			$scope.public = function(){
				console.log("Inside public function");
				var pub = {}
				pub.id = query._id;
				pub.email = query.email;
				pub.fname = query.fname;
				pub.lname = query.lname;

				details = "params="+JSON.stringify(pub);
				customHttp.request(details, "/api/user/shareCode", "POST", function (str){
					ngToast.create({
					  className: 'success',
					  content: 'Code Shared. Check out shared public page',
					  horizontalPosition: 'center'
					});
				})
			}
}])
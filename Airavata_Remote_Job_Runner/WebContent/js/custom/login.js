$(function(){

	errornotice = $("#error");
	$("#login-form").submit(function(){
		result = true;
		if($.trim($('#j_username').val()) == ""){
			errornotice.html("Enter username.");
			errornotice.fadeIn(750);
			result = false;
		}else{
			if($.trim($('#j_password').val()) == ""){
				errornotice.html("Enter password.");
				errornotice.fadeIn(750);
				result = false;
			}
		}
		if(result){
			errornotice.html("");
			$('#j_password').val(calcMD5($('#j_password').val()));
		}
		return result;
	});

	$('#j_username').focus();

//	if(msg == "597"){
//		errornotice.html("Invalid Username or Password.");
//		errornotice.fadeIn(750);
//	} else if(msg == '596'){
//		errornotice.html("Your Session has expired.");
//		errornotice.fadeIn(750);
//	}
});

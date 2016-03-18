$(function(){

	errornotice = $("#error");
	$("#registration-form").submit(function(){
		result = true;
		if($.trim($('#username').val()) == ""){
			errornotice.html("Enter username.");
			errornotice.fadeIn(750);
			result = false;
		}else{
			if($.trim($('#password').val()) == ""){
				errornotice.html("Enter password.");
				errornotice.fadeIn(750);
				result = false;
			}else{
				if($.trim($('#password').val()) != $.trim($('#passwordR').val())){
					errornotice.html("Passwords do not match.");
					errornotice.fadeIn(750);
					result = false;
				}
			}
		}
		
		if(result){
			errornotice.html("");
			$('#password').val(calcMD5($('#password').val()));
		}
		return result;
	});

	$('#username').focus();

//	if(msg == "597"){
//		errornotice.html("Invalid Username or Password.");
//		errornotice.fadeIn(750);
//	} else if(msg == '596'){
//		errornotice.html("Your Session has expired.");
//		errornotice.fadeIn(750);
//	}
});

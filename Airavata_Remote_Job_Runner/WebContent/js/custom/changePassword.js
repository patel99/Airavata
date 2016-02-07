/**
 * changePassword.js
 * 
 * Below script performs following activities:
 * 		Validates change password form.
 * 		Makes AJAX request to back-end to change user password.
 * 		Renders error/success messages occurred in change password process.
 */
var oldPass = null;
var newPass = null;
var confirmPass = null;
$(document).ready(function (e) {
	
	$("#changePasswordView").closest('li').addClass("active");
	 
	$('#changePasswordBtn').click(function(){
		
		var validateFields =  true; 
		
		// Remove error/success message styles
		$("#changePasswordError").removeClass("error");
		$("#changePasswordError").removeClass("success");
		
		required = ["currentPassword", "newPassword", "confirmPassword"];
		
		// Validate change password form
		if($('#currentPassword').val().length == 0 || $('#newPassword').val().length == 0 || $('#confirmPassword').val().length == 0  ){
			document.getElementById("changePasswordError").innerHTML = "Password(s) field can't be blank";
			$('#confirmPassword').val('');
			$('#newPassword').val('');
			$('#currentPassword').val('');
			$("#changePasswordError").addClass("error");
			validateFields =  false;
		}else if( $('#newPassword').val() == $('#currentPassword').val() ){
			document.getElementById("changePasswordError").innerHTML = "New Password and current password should not be the same.";
			$('#confirmPassword').val('');
			$('#newPassword').val('');
			$('#currentPassword').val('');
			$("#changePasswordError").addClass("error");
			validateFields = false;
		}
		else if($('#confirmPassword').val() != $('#newPassword').val()){
			document.getElementById("changePasswordError").innerHTML = "Confirm password doesn't match new password";
			$('#confirmPassword').val('');
			$('#newPassword').val('');
			$('#currentPassword').val('');
			$("#changePasswordError").addClass("error");
			validateFields =  false;
		}
		else{
			for (var i=1;i<required.length;i++) {
				var input = $('#'+required[i]);
				if (!/^.*(?=.{8,14}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.*\s).*$/.test(input.val())|| /\s/.test(input.val())) {
					document.getElementById("changePasswordError").innerHTML = "Password should be of 8 to 14 characters and should contain atleast one capital character, one digit and one special character";
					$('#confirmPassword').val('');
					$('#newPassword').val('');
					$('#currentPassword').val('');
					$("#changePasswordError").addClass("error");
					validateFields =  false;
				}
			}
		}
		
		if(validateFields) {
		// Make AJAX request to back-end to change user password
			oldPass = calcMD5($("#currentPassword").val());
			newPass = calcMD5($( "#newPassword" ).val());
			confirmPass = calcMD5($("#confirmPassword").val());
		
			$.ajax({
				url: 'change-password.htm',
				type: 'POST',
				data: {currentPassword : oldPass,
					newPassword : newPass,
					confirmPassword : confirmPass},
				dataType: 'json',
				contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			    mimeType: 'application/json',
				error: function(xhr, textStatus, thrownError) {
					if(xhr.status == 599){
						window.location.href = "login.htm?error=sessionExpired";
					} else if(xhr.status == 500){
						window.location.href = "system-error.htm";
					}
				},
				success : function(data) {
					$('#confirmPassword').val('');
					$('#newPassword').val('');
					$('#currentPassword').val('');
					$("#changePasswordError").removeClass("error");
					$("#changePasswordError").removeClass("success");
					if(!data.isError){
						$("#changePasswordError").addClass("success");
						$("#changePasswordError").html(data.message);
					}
					else{
						$("#changePasswordError").addClass("error");
						$("#changePasswordError").html(data.message);
					}				
				}

		    });
		}
	});

});
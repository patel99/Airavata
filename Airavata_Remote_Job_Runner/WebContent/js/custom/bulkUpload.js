
var regex = /[0-9]|\./;
var regex_time =/^\d{1,}:(?:[0-5]\d):(?:[0-5]\d)$/;
var msg;
$(document).ready(function(){
	
//	$("#file").click(function(){
//		$(".template-upload").remove();
//	});
	
	$("#btn-add").click(function(){
		if($("#downloadLink").attr("onClick") == undefined || !($("#downloadLink").attr("onClick") == "return false")){
			$(".records").removeClass("hide");
			$(".upload-popup").addClass("hide");
		}
	});
	
	$("#btn-bulk-upload").click(function(){
		$(".files").html("");
		$(".records").addClass("hide");
		$(".container").css('z-index','0');
		$(".container").removeClass("hide");
		$(".upload-popup").removeClass("hide");
	});
	
	
	$("#noOfNodes").keypress(function(e){
		  var key = e.keyCode || e.which;
		  key = String.fromCharCode( key );
		  
		  if( !regex.test(key) ) {
		    e.returnValue = false;
		    if(e.preventDefault) e.preventDefault();
		  }
	});
	
	$("#procPerNode").keypress(function(e){
		  var key = e.keyCode || e.which;
		  key = String.fromCharCode( key );
		  
		  if( !regex.test(key) ) {
		    e.returnValue = false;
		    if(e.preventDefault) e.preventDefault();
		  }
	});
	
	$(".validation-field").keypress(function(e){
		  $(".validation-message").addClass("hide");
	});
	
	
	$("#submit").click(function(e){
		  if(!validate()){
			  e.returnValue = false;
			  if(e.preventDefault) e.preventDefault();
			  $(".validation-message").removeClass("hide");
			  $(".validation-message").html(msg);
		  }else{
			  e.returnValue = true;
			  return true;
		  }
	});

	
	$("#closeButton").click(function(){
		$(".container").css('z-index','1132');
		$(".container").addClass("hide");
		$(".upload-popup").addClass("hide");
	});
});
function bulkUploadFormat(){
	window.location.href="bulkUploadFormat.htm?fileType=" + $("#fileType").val();
}

//Session timeout handling(call from fail function in jquery.fileupload-ui.js)
function fileUploadFailed(status){
	if(status == 599){
		window.location.href = "login.htm?error=sessionExpired";
	}
}

function validate() {
	msg = "";
	isValid = true;
	$(".validation-message").addClass("hide");
	  if($("#noOfNodes").val().trim() == ""){
		  msg = "* Please enter number of nodes.";
		  isValid = false;
	  }else if( !regex_time.test($("#wallTime").val()) ) {
			    				    
			    msg = "* Please enter valid wall time.";
			    isValid = false;				    
			  }
	  else if($("#jobType").val() == null){
		  msg = "* Please select job type.";
		  isValid = false;	
	  }
	  else if($("#hostType").val() == null){
		  msg = "* Please select job type.";
		  isValid = false;	
	  }
	  return isValid;
}

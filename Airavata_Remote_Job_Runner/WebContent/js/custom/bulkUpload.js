$(document).ready(function(){
	
	$("#file").click(function(){
		$(".template-upload").remove();
	});
	
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
	
	$("#closeButton").click(function(){
		$(".container").css('z-index','1132');
		$(".container").addClass("hide");
		$(".upload-popup").addClass("hide");
	});
	
//	$("#closeButton").click(function(){
//		dtTable.fnStandingRedraw();
//	});
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

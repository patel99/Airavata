$(document).ready(function () {
	
	$(".app").click(function(){
		
		var headerText = " FILE NAME FORMAT";
		var applicationName = $(this).attr("id").toUpperCase();
		var id = $(this).attr("id");
		
		headerText = applicationName + headerText;
		$("#application_name_title").text(headerText);
		$("#example").text("Eg : " +id+"_test.txt");
		$("#application_name").text(id);
		$("#formatDiv").removeClass("hide");
	});
	
});
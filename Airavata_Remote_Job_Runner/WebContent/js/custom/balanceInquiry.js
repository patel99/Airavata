var ajaxCall = null;
$(document).ready(function(){

	$("#checkBalance").attr("disabled","disabled");
	$("#leftPanelBtn").addClass("hide");
	$.ajax({
		url: 'getAccountList.htm',
		type: 'GET',
		
			dataType: 'json',
			error: function(xhr, textStatus, thrownError, data) {
				unblockUI();
				$("#page-alert").removeClass("hide");
				$("#page-alert").show();
				$("#page-alert").addClass("alert-danger");
				$("#page-alert").removeClass("alert-success");
				$(".page-message").html("Failed to fetch accounts !!");
				$("#page-alert").fadeOut(7000);
				if(xhr.status == 599){
					window.location.href = "login.htm?error=sessionExpired";
				} else if(xhr.status == 500){
					window.location.href = "system-error.htm";
				}
			},
			success : function(data) {
				
				unblockUI();
				if(!data.isError) {
					var accountList = data.data[0].split(",");
					for(var i=0; i< accountList.length;i++)
					$("#account").append("<option value='"+accountList[i]+"'>"+accountList[i]+"</option>");
					$("#accountDiv").addClass("hide");
				} 
			}
	});
	
	
	$("#checkBalance").click(function(){
		var account = $("#account").val();
		$("#checkBalance").val("Checking Balance...");
		$("#checkBalance").attr("disabled","disabled");
		$("#accountDiv").addClass("hide");
		$('#abortCall').removeClass('hide');
		
		ajaxCall = $.ajax({
			url: 'balanceInquiryRequest.htm',
			type: 'POST',
			data: {accountNumber : account},
				dataType: 'json',
				error: function(xhr, textStatus, thrownError, data) {
					
					$('#abortCall').addClass('hide');
					unblockUI();
					
					if(xhr.status == 599){
						window.location.href = "login.htm?error=sessionExpired";
					} else if(xhr.status == 500){
						window.location.href = "system-error.htm";
					}
				},
				success : function(data) {
					
					$('#abortCall').addClass('hide');
					unblockUI();
					
					$("#checkBalance").val("Check Balance");
					$("#checkBalance").removeAttr("disabled");
					if(!data.isError) {
						$("#accBal").val(data.data.accountBalance);
						$("#availBal").val(data.data.availableBalance);
						$("#accountDiv").removeClass("hide");	
					}
					else {
						$("#accountError").text(data.message);
						$("#accountError").css("display","table-cell");
					}
				}
		});	
	});
	
	$('#abortCall').click(function(){
		ajaxCall.abort();
		$('#abortCall').addClass('hide');
		$("#checkBalance").val("Check Balance");
		$("#checkBalance").attr("disabled",false);
	});
	
	$("#account").change(function() {
		if($("#account").val() == -1) {
			$("#accountDiv").addClass("hide");
			$("#checkBalance").attr("disabled","disabled");
		}
		else {
			$("#checkBalance").removeAttr("disabled");
		}
	});
});
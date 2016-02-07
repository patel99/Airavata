var regex = /^[A-Za-z0-9 ]{1,100}$/;
var solIdRegex = /^[A-Za-z0-9]{1,100}$/;
var pName = "";
var pSolId = "";
var pSlfitNumber = "";
var pEmailId = "";
var vId = "";
var vName = "";
var vSolId = "";
var vSlfitNumber = "";
var vEmailId = "";
var suspendedStatusId = "";
var numberOfValidFields = 0;
var vResult;
var dtTable = null;
var randomKey = "";

var emailPattern = /^(?!\.)(?!.*\.{2})([a-zA-Z0-9_(\.)\-])+([a-zA-Z0-9])+\@((([a-zA-Z0-9\-])+\.){1}([a-zA-Z]{2,4})){1,2}$/;
var showUpdateButton = false;

$(document).ready(function(){
	
	if (window.history && window.history.pushState) {

	    window.history.pushState('forward', "asdf");
	    $(window).on('popstate', function() {
	    	window.history.pushState('forward', "asdf");
	    });
	  }
	
	$(document).keyup(function(e) {
	    if ($("#upload-file-div").hasClass("hide") && e.keyCode == 27) {
	    	hideBranchPopup();
	    }
	});
	
	//Header events end
	
	//Scroll Buttons Start
	$(".scroll-right").on('click' ,function(){
		$(".dataTables_wrapper").animate({scrollLeft:'+=300px'});
	});
	
	$(".scroll-left").on('click' ,function(){
		$(".dataTables_wrapper").animate({scrollLeft:'-=300px'});
	});

	$( ".table-hover" ).mousemove(function( event ) {
		  $(".scroll-right").animate({top:event.pageY - $( ".table-hover" ).offset().top},{duration:50,queue:false});
		  $(".scroll-left").animate({top:event.pageY - $( ".table-hover" ).offset().top},{duration:50,queue:false});
		});
	$(".content").hover(function(){
		if($(".dataTables_wrapper").width() < $(".dataTable").width()){
			$(".scroll-right").removeClass("hide");
			$(".scroll-left").removeClass("hide");
		}
	},
	function(){
		$(".scroll-right").addClass("hide");
		$(".scroll-left").addClass("hide");
	});
	//Scroll Buttons End
	
	$("#branchView").closest('li').addClass("active");
	$("#fileType").val("ROLE_BRANCH");
	
	var tblColumns = [ {"mDataProp": null, sDefaultContent: "", "bSortable": false},
	                   {"mDataProp": "id", sDefaultContent: "", "sClass": "hide-column", "aTargets": [  ]},
		               {"mDataProp": "name", sDefaultContent: ""}, 
		               {"mDataProp": "solId", sDefaultContent: "", "sClass": "sol-id"},
		               {"mDataProp": "slfitNumber", sDefaultContent: "", "sClass": "hide-column"},
		               {"mDataProp": "emailId", sDefaultContent: ""},
		               {"mDataProp": "status.status", sDefaultContent: ""},
		               {"mDataProp": null, sDefaultContent: "", "bSortable": false}
		               ];
	
	//Validations Start
	
	$(".validation-field").keyup(function(){
	 	vResult = true;
		var curUsedRegex = "";
		$(".message").html("");
		if(($(this).attr("id") == "branch_name") || ($(this).attr("id") == "slf_it_number")){
			curUsedRegex = regex;
		
		}else if($(this).attr("id") == "sol_id"){
			curUsedRegex = solIdRegex;
		
		}else if($(this).attr("id") == "email_id"){
			curUsedRegex = emailPattern;
		
		}
		
		if(!$.trim($(this).val()).match(curUsedRegex)){
			
			vResult = false;	
		}
		
		if(vResult){
		
			$(this).nextAll('span:first').hide();
			$(this).addClass("validation-success");
			$(this).removeClass("validation-error");
			numberOfValidFields ++;
		
		}else{
		
			$(this).nextAll('span:first').show();
			$(this).removeClass("validation-success");
			$(this).addClass("validation-error");
			numberOfValidFields --;
		}
	});
	
	$(".validation-field").click(function(){
		$(this).trigger("keyup");
	});	
	
	//Validations end
	
	//validate search criteria start
	function isValidSearchCriteria(){
		var isValid = true;
		var errorMessage = "";
		if((!($.trim($("#branchName").val()) == "")) && !($.trim($("#branchName").val()).match(regex))){
			isValid = false;
			errorMessage = "Please enter valid branch name.";	
		}
		if((!($.trim($("#solId").val()) == "")) && !($.trim($("#solId").val()).match(regex))){
			isValid = false;
			errorMessage = "Please enter valid SOL ID.";	
		}
		if(!isValid){
			$("#page-alert").removeClass("hide");
			$("#page-alert").show();
			$("#page-alert").addClass("alert-danger");
		    $("#page-alert").removeClass("alert-success");
		    $(".page-message").html(errorMessage);
		    $("#page-alert").fadeOut(5000);
		}
		return isValid;		
	}
	//validate search criteria end
	
	populateBranch();
	
	function populateBranch(){
		
		var branchName = $("#branchName").val().trim();
		var solId =  $("#solId").val();

		 dtTable = $('#branchList').dataTable({
			"bDestroy":true,
			"bAutoWidth": false,
			"bServerSide": true,
			"sAjaxSource": "getBranches.htm",
			"bPaginate": true,
			"bLengthChange":false,
			"iDisplayLength" : 10,
			"bFilter":false,
			"aoColumns": tblColumns,
			"fnServerParams": function ( aoData ) {
				blockUI();
				randomKey = Math.random();
			    aoData.push({name:"randomKey", value:randomKey});
				aoData.push({name:"direction", value:"next"});
				if(branchName != ""){
					aoData.push({name:"branchName", value:branchName});
	 		    }
				if(solId != ""){
					aoData.push({name:"solId", value:solId});
	 		    }
			},
			"fnRowCallback" : function(nRow, aData, iDisplayIndex){
				
				var oSettings = dtTable.fnSettings();
				$("td:first", nRow).html(oSettings._iDisplayStart+iDisplayIndex +1);
				var buttonHtml = '<div>';		
				var row = $("td:first", nRow).closest('tr');
				$("td:first", nRow).closest('tr').attr("id", "row_update_" + iDisplayIndex);
				if(!(aData.status.id == suspendedStatusId)){
					buttonHtml += '<a onclick="update('+$("td:first", nRow).closest('tr').attr("id")+')"><button type="button" class="btn btn-primary info btn-action-margin-left" title="Update"><i class="fa fa-pencil-square-o"></i></button></a>';					
				}  				
				if(!(aData.status.id == suspendedStatusId)){
					buttonHtml += '<a onclick="suspend('+row.find("td:eq(1)").html()+')"><button type="button" class="btn btn-danger info btn-action-margin-left" title="Suspend"><i class="fa fa-lock"></i></button></a>';
				}else{
					buttonHtml += '<a onclick="activate('+row.find("td:eq(1)").html()+')"><button type="button" class="btn btn-success info btn-action-margin-left" title="Activate"><i class="fa fa-unlock"></i></button></a>';
				}
				buttonHtml += '</div>';
				$("td:eq(7)", nRow).html(buttonHtml);
				return nRow;		
			},
			"fnServerData": function ( sSource, aoData, fnCallback ) {
				$.get( sSource, aoData, function (json) {
					unblockUI();
					var obj = JSON.parse(json);
					if(typeof obj.isError != 'undefined'){
						$("#page-alert").removeClass("hide");
						$("#page-alert").show();
						$("#page-alert").addClass("alert-danger");
					    $("#page-alert").removeClass("alert-success");
					    $(".page-message").html(obj.errorMessage);
					    $("#page-alert").fadeOut(7000);
					}
					suspendedStatusId = obj.suspendedStatusId;
					fnCallback(obj);
	            }).fail(function(jqXHR, e){
	            	unblockUI();
					if(jqXHR.status == 599){
						window.location.href = "login.htm?error=sessionExpired";
					} else if(jqXHR.status == 500){
						window.location.href = "system-error.htm";
					}
	            });
			}			
		 }); 
	}
	
	$("#searchBranch").click(function(){
		if(!isValidSearchCriteria()){
			return;
		}
		populateBranch();
	});
	
	$("#addBranch").click(function(){
		
		showUpdateButton = false;
		
		clearValidation();
		
		showBranchPopup();
		
		$("#branch_id").val("");
		$("#branch_name").val("");
		$("#sol_id").val("");
		$("#slf_it_number").val("");
		$("#email_id").val("");
		
		$(".message").html("");
		
		$("#btn-bulk-upload").removeClass("hide");
		$("#modal_header").html("Add Branch");
		
		$(".template-upload").remove();
		
		$("#add_branch").show();
		$("#update_branch").hide();
	});
	
	
	
	$("#update_branch").click(function(){
		vId = $("#branch_id").val();
		vName = $.trim($("#branch_name").val());
		vSolId = $.trim($("#sol_id").val());
		vSlfitNumber = $.trim($("#branch_name").val());
		vEmailId = $.trim($("#email_id").val());
		
		numberOfValidFields = 0;
		$(".validation-field").trigger('keyup');
		if(numberOfValidFields != 3){			
			return;
		}
		
		if(!isChanged()){
			return;
		}
		
		if(pName == vName){
			vName = undefined;
		}
		if(pSolId == vSolId){
			vSolId = undefined;
		}
		
		blockUI();
		randomKey = Math.random();
		
		$.ajax({
			url: 'updateBranch.htm',
			type: 'POST',
			data: {id : vId,
				   name : vName,
				   solId : vSolId,
				   slfitNumber : vSlfitNumber,
				   randomKey : randomKey,
				   emailId : vEmailId},
			dataType: 'json',
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		    mimeType: 'application/json',
			error: function(xhr, textStatus, thrownError) {
				unblockUI();
				if(xhr.status == 599){
					window.location.href = "login.htm?error=sessionExpired";
				} else if(xhr.status == 500){
					window.location.href = "system-error.htm";
				}
			},
			success : function(data) {
				unblockUI();
				if(!data.isError){
					var rows = dtTable.fnGetNodes();
					for(var i=0;i<rows.length;i++)
			        {
						if($(rows[i]).find("td:eq(1)").html() == $("#branch_id").val()){
			               // Get HTML of 3rd column (for example)
							$(rows[i]).find("td:eq(2)").html($("#branch_name").val());
							$(rows[i]).find("td:eq(3)").html($("#sol_id").val());
							$(rows[i]).find("td:eq(2)").html($("#slf_it_number").val());
							$(rows[i]).find("td:eq(5)").html($("#email_id").val());
							$(".message").removeClass("error");
							$(".message").addClass("success");
							$(".message").html(data.message);
							$(".message").show();
							$("#update_branch").hide();
							pName = $("#branch_name").val();
							pSolId = $("#sol_id").val();
							pSlfitNumber = $("#branch_name").val();
							pEmailId = $("#email_id").val();
							break;
						}						
			        }
					dtTable.fnStandingRedraw();
				}
				else{
					$(".message").removeClass("success");
					$(".message").addClass("error");
					$(".message").html(data.message);
					$(".message").show();
				}				
			}

		});
	}); 
	
	$("#add_branch").click(function(){
		vName = $.trim($("#branch_name").val());
		vEmailId = $.trim($("#email_id").val());
		vSolId = $.trim($("#sol_id").val());
		vSlfitNumber = $.trim($("#branch_name").val());
		
		numberOfValidFields = 0;
		$(".validation-field").trigger('keyup');
		if(numberOfValidFields != 3){			
			return;
		}
		blockUI();
		showLoadingPage();
		randomKey = Math.random();
		$.ajax({
			url: 'addBranch.htm',
			type: 'POST',
			data: {name : vName,
				   solId : vSolId,
				   slfitNumber : vSlfitNumber,
				   randomKey : randomKey,
				   emailId : vEmailId},
			dataType: 'json',
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
		    mimeType: 'application/json',
			error: function(xhr, textStatus, thrownError) {
				unblockUI();
				if(xhr.status == 599){
					window.location.href = "login.htm?error=sessionExpired";
				} else if(xhr.status == 500){
					window.location.href = "system-error.htm";
				}
			},
			success : function(data) {
				unblockUI();
				$(".loading").addClass("hide");
				if(!data.isError){
					dtTable.fnStandingRedraw();
					hideBranchPopup();
					$("#page-alert").removeClass("hide");
					$("#page-alert").show();
					$("#page-alert").removeClass("alert-danger");
				    $("#page-alert").addClass("alert-success");
				    $(".page-message").html(data.message);
				    $("#page-alert").fadeOut(7000);
				}
				else{
				    $(".message").removeClass("success");
					$(".message").addClass("error");
					$(".message").html(data.message);
					$(".message").show();
				}				
			}
		});
	}); 
	
	
	$('.container').click(function(){
		if($(".upload-popup").hasClass("hide")){
			$('.container').addClass("hide");
			$('.records').addClass("hide");
			$(".pdf-view").hide();
			$(".loading").hide();
		}
	});
	
	$(".close-popup-btn").click(function(){			
		hideBranchPopup();
	});
	
	fileType = "ROLE_BRANCH";
});

function update(rowId){
	
	showUpdateButton = true;
	row  = $(rowId);
	$(".message").html("");
	$("#btn-bulk-upload").addClass("hide");
	$("#modal_header").html("Update Branch");
	
	clearValidation();
	
	$("#add_branch").hide();
	$("#update_branch").show();
	 $("#branch_id").val(row.find('td:eq(1)').html());
	 $("#branch_name").val(row.find('td:eq(2)').text());
	 $("#sol_id").val(row.find('td:eq(3)').html());
	 $("#slf_it_number").val(row.find('td:eq(2)').html());
	 $("#email_id").val(row.find('td:eq(5)').html());
	 
	 pName = $("#branch_name").val();
	 pSolId = $("#sol_id").val();
	 pSlfitNumber = $("#branch_name").val();
	 pEmailId = $("#email_id").val();
	 
	showBranchPopup();
}

function activate(id){
	$("#branch_id").val(id);				
	$.confirm({
        text: "Are you sure, you want to activate this branch?",
        confirm: function(button) {
        	blockUI();
        	randomKey = Math.random();
        	$.ajax({
				url: 'activateBranch.htm',
				type: 'POST',
				data: {id : $("#branch_id").val(),
						randomKey: randomKey},
				dataType: 'json',
				contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			    mimeType: 'application/json',
				error: function(xhr, textStatus, thrownError) {
					unblockUI();
					if(xhr.status == 599){
 						window.location.href = "login.htm?error=sessionExpired";
 					} else if(xhr.status == 500){
 						window.location.href = "system-error.htm";
 					}
				},
				success : function(data) {
					unblockUI();
					if(!data.isError){
						dtTable.fnStandingRedraw();
						  $("#page-alert").removeClass("hide");	
						  $("#page-alert").show();
						  $("#page-alert").removeClass("alert-danger");
					      $("#page-alert").addClass("alert-success");
					      $(".page-message").html(data.message);
					      $("#page-alert").fadeOut(7000);
					}
					else{
						  $("#page-alert").removeClass("hide");
						  $("#page-alert").show();
					      $("#page-alert").removeClass("alert-success");
					      $("#page-alert").addClass("alert-danger");
					      $(".page-message").html(data.message);
					      $("#page-alert").fadeOut(7000);
					}				
				}
			});
        },
        cancel: function(button) {
           return false;
        }
    });
}

function suspend(id){
	$("#branch_id").val(id);				
	$.confirm({
        text: "Are you sure, you want to suspend this branch?",
        confirm: function(button) {
        	blockUI();
        	randomKey = Math.random();
        	$.ajax({
				url: 'suspendBranch.htm',
				type: 'POST',
				data: {id : $("#branch_id").val(),
					randomKey : randomKey},
				dataType: 'json',
				contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			    mimeType: 'application/json',
				error: function(xhr, textStatus, thrownError) {
					unblockUI();
 					if(xhr.status == 599){
 						window.location.href = "login.htm?error=sessionExpired";
 					} else if(xhr.status == 500){
 						window.location.href = "system-error.htm";
 					}
				},
				success : function(data) {
					unblockUI();
					if(!data.isError){
						dtTable.fnStandingRedraw();
						  $("#page-alert").removeClass("hide");	
						  $("#page-alert").show();
						  $("#page-alert").removeClass("alert-danger");
					      $("#page-alert").addClass("alert-success");
					      $(".page-message").html(data.message);
					      $("#page-alert").fadeOut(7000);
					}
					else{
						  $("#page-alert").removeClass("hide");
						  $("#page-alert").show();
					      $("#page-alert").removeClass("alert-success");
					      $("#page-alert").addClass("alert-danger");
					      $(".page-message").html(data.message);
					      $("#page-alert").fadeOut(7000);
					}				
				}
			});
        },
        cancel: function(button) {
           return false;
        }
    });
}

function hideBranchPopup(){
	$(".container").addClass("hide");
	$(".records").addClass("hide");
	$(".upload-popup").addClass("hide");
}

function showBranchPopup(){
	$(".container").removeClass("hide");
	$(".records").removeClass("hide");
}

function showLoadingPage(){
	$(".container").removeClass("hide");
	$(".loading").removeClass("hide");
}

function hideLoadingPage(){
	$(".container").addClass("hide");
	$(".loading").addClass("hide");
	$(".upload-popup").addClass("hide");
}

function isChanged(){
	var cResult = true;
	if(vName == pName && vSolId == pSolId && vSlfitNumber == pSlfitNumber && vEmailId == pEmailId){
		$(".message").removeClass("success");
		$(".message").addClass("error");
		$(".message").html("No change has been made");
		$(".message").show();
		cResult = false;
	}
	return cResult;
}

function clearValidation(){
	$( ".validation-field" ).each(function() {
		$(this).removeClass("validation-success");
		$(this).removeClass("validation-error");
		$(this).nextAll('span:first').hide();
	});
}

$(".validation-field").click(function() {
	$(".message").hide();
	if(showUpdateButton) {
		$("#update_branch").show();	
	}
});
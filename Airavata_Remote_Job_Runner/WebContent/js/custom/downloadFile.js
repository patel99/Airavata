var dtTable;
var regexEmailPattern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,4})+$/;
var regex = /^.{1,}$/;
var regexTotalRecords = /^[0-9]{1,9}$/;
var regexAmount = /^[0-9]{1,100}$/;
var regexNumber = /^[0-9]{1,}$/;
var regexSINumber = /^[A-Za-z0-9]{1,50}$/;
var regexComment = /^[A-Za-z0-9.;, \n]{1,250}$/;
var filenameRegex = /^([0-9a-zA-Z\^\&\'\@\{\}\[\]\,\$\=\!\-\#\(\)\.\%\+\~\_ ]{1,150})+$/;
var usernameRegex = /^[A-Za-z0-9]{1,100}$/;
var dateFormat = 'ddd MMM DD YYYY HH:mm:ss UTC+0530';
var vResult;
var numberOfValidFields = 0;
var currentDate = new Date();
var randomKey;

$(document).ready(function(){
	
	$(document).keyup(function(e) {
	    if (e.keyCode == 27) {
	    	hideLoadingPage();
	    	hideUpdatePopUp();
	    }	    
	});
	
	$(".container, .close-popup-btn").click(function(){
		hideLoadingPage();
    	hideUpdatePopUp();
	});
	
	$('#total_records, #amount').on('input', function (event) { 
	    this.value = this.value.replace(/[^0-9]/g, '');
	});
	
	$(".validation-field").on("click", function(){
		$(this).trigger("keyup");
	});
	
	$(".validation-field").on("keyup", function(){
	
		vResult = true;
		var curUsedRegex = "";
		var curElement = $(this);
		var curElementId = $(this).attr("id");
	
		$(".message").html("");
		
		if(curElementId == "total_records"){
			curUsedRegex = regexTotalRecords;
		
		}else if(curElementId == "amount"){
			curUsedRegex = regexAmount;
		
		}else if(curElementId == "start_date" || curElementId == "end_date"){
			curUsedRegex = regex;
		
		}else if(curElementId == "si_number"){
			curUsedRegex = regexSINumber;
		
		}else if(curElementId == "email_id"){
			curUsedRegex = regexEmailPattern;
		
		}else if(curElementId == "comment"){
			curUsedRegex = regexComment;
		}
		
		if(!$.trim(curElement.val()).match(curUsedRegex)){
			
			vResult = false;	
		}

		if(vResult){
			if(curElementId == "start_date" || curElementId == "end_date"){
				curElement.parent().nextAll('span:first').hide();
			}else{
				curElement.nextAll('span:first').hide();
			}
			curElement.addClass("validation-success");
			curElement.removeClass("validation-error");
			numberOfValidFields ++;
		
		}else{
			
			if(curElementId == "start_date" || curElementId == "end_date"){
				curElement.parent().nextAll('span:first').show();
			}else{
				curElement.nextAll('span:first').show();
			}
			curElement.removeClass("validation-success");
			curElement.addClass("validation-error");
			numberOfValidFields --;
		}
	});
	$("#DownloadFilePageView").addClass("sidebar-selected");

	//Date range picker
    $('#reservation').daterangepicker({
    	format: 'DD/MM/YYYY'
    });
    
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
	
	var startts = "";
	var endts = "";
	var userName = "";
	var corporateId = "";
	var fileName = "";
	var status = "";
	var transferMode = "";
	var corporateName = "";
	var tblColumns = [ {"mDataProp": null, sDefaultContent: "", "bSortable": false},
	                   {"mDataProp": "id", sDefaultContent: "", "sClass": "hide-column", "aTargets": [  ]},
		               {"mDataProp": "name", sDefaultContent: ""}, 
		               {"mDataProp": "user.username", sDefaultContent: ""},
		               {"mDataProp": "user.roles.roleName", sDefaultContent: ""},
		               {"mDataProp": "user.corporate.name",sDefaultContent: ""},
		               {"mDataProp": "status.status", sDefaultContent: ""},
		               {"mDataProp": "remark", sDefaultContent: ""},
		               {"mDataProp": "createdTimestamp", sDefaultContent: ""},
		               {"mDataProp": null, "bSortable": false, sDefaultContent: ""}
	               ];

populateFileSummary();
var corpNames = new Array();
var corpIds = new Object();
randomKey = Math.random();
$.ajax({
	url: 'getCorporates.htm',
	type: 'GET',
	data: {isRequestFromAutocompleter : true,
		isActiveCorpRequired: false,
		randomKey : randomKey},
	dataType: 'json',
	success : function(data) {
		if(!data.isError){
			for ( var i = 0; i < data.aaData.length; i++) {
				corpNames.push( data.aaData[i].name );
				corpIds[data.aaData[i].name] = data.aaData[i].id;
			}
		}
		else{
			dtTable.fnStandingRedraw();
			$("#page-alert").removeClass("hide");
			$("#page-alert").show();
			$("#page-alert").addClass("alert-danger");
		    $("#page-alert").removeClass("alert-success");
		    $(".page-message").html(data.errorMessage);
		    $("#page-alert").fadeOut(7000);
		}
		$( '#autoCompleteCorporates' ).typeahead( { source:corpNames } );
	}
});

//validate search criteria start
function isValidSearchCriteria(){
	var isValid = true;
	var errorMessage = "";
	if((!($.trim($("#fileName").val()) == "")) && !($.trim($("#fileName").val()).match(filenameRegex))){
		isValid = false;
		errorMessage = "Please enter valid file name.";	
	}
	if((!($.trim($("#userName").val()) == "")) && !($.trim($("#userName").val()).match(usernameRegex))){
		isValid = false;
		errorMessage = "Enter valid user name.";
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

function populateFileSummary(){	
	startts = "";
	endts = "";
	corporateId = 0;
	if($("#reservation").val().split("-")[1] !== undefined){ 
		startts = $("#reservation").val().split("-")[0];
		endts = $("#reservation").val().split("-")[1];	
	}
	userName = $.trim($('#userName').val());
	if(( $("#autoCompleteCorporates").val() != null && $('#autoCompleteCorporates' ).val() != "")){
		if(undefined != corpIds[$( '#autoCompleteCorporates' ).val()]){
	       corporateId = corpIds[$( '#autoCompleteCorporates' ).val()];
	       corporateName = $( '#autoCompleteCorporates' ).val();
		}
		else{
			corporateName = "";
			  $("#page-alert").removeClass("hide");	
			  $("#page-alert").show();
			  $("#page-alert").removeClass("alert-success");
		      $("#page-alert").addClass("alert-danger");
		      $(".page-message").html("Please select valid corporate name");
		      $("#page-alert").fadeOut(7000);
			return;
		}
	}else{
		corporateName = "";
		corporateId = 0;
	}
	fileName =$.trim($('#fileName').val());
	transferMode = $( "#transferMode option:selected" ).val();
	
	 dtTable = $('#downloadFileTable').dataTable({
		"bDestroy":true,
		"bAutoWidth": false,
		"bServerSide": true,
		"sAjaxSource": "DownloadFilePage.htm",
		"bPaginate": true,
		"bLengthChange":false,
		"iDisplayLength" : 10,
		"bFilter":false,
		"aoColumns": tblColumns,
		"fnRowCallback" : function(nRow, aData, iDisplayIndex){
			var oSettings = dtTable.fnSettings();
			$("td:first", nRow).html(oSettings._iDisplayStart+iDisplayIndex +1);
			if(aData.user.isDirect == false){
				$("td:eq(4)", nRow).html("InDirect");
			}else if(aData.user.isDirect == true){
				$("td:eq(4)", nRow).html("Direct");
			}
						
			if(aRole == 'ROLE_ADMIN'){
				$("td:eq(9)", nRow).html('<div>' +                        
                            	'<a href="downloadFile.htm?fileId='+ aData.id + '"><button type="button" class="btn btn-success info btn-action-margin-left" title="Download"><i class="fa fa-download"></i></button></a>' +
                            	'<a onclick="updateFile('+$("td:eq(1)", nRow).html()+')"><button type="button" class="btn btn-primary info btn-action-margin-left" title="Update"><i class="fa fa-pencil-square-o"></i></button></a>' +
                    '</div>');
				} else if(aRole == 'ROLE_SUPER_ADMIN'){
					$("td:eq(9)", nRow).html('<div class="show-records span12"><button class="btn btn-primary">Mark For Download</button></div>').click(function(){
						var row = $(this).closest('tr');
						var id = row.find('td:eq(1)').html();
						$.confirm({
					        text: "Are you sure, you want to mark this file for download?",
					        confirm: function(button) {
					        	blockUI();
					        	randomKey = Math.random();
					        	$.ajax({
									url: 'markForDownload.htm',
									type: 'POST',
									data: {id : id,
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
					
					});
				}
			return nRow;
		},
		"fnServerParams": function ( aoData ) {
			blockUI();
			randomKey = Math.random();
 		      aoData.push( {name:"userName", value : userName});
 		      aoData.push( {name:"corporateId", value: corporateId});
 		      aoData.push( {name:"startDate", value : startts});
		      aoData.push( {name:"endDate", value: endts});
		      aoData.push( {name:"fileName", value : fileName});
 		      aoData.push( {name:"transferMode", value : transferMode });
 		     aoData.push( {name:"randomKey", value : randomKey });
 		},
 		"fnServerData": function ( sSource, aoData, fnCallback ) {
 			unblockUI();
			$.get( sSource, aoData, function (json) {
				if($(".records").hasClass("hide")){
				hideLoadingPage();
				}else{
					$(".loading").addClass("hide");
				}
				var obj = JSON.parse(json);
				if(typeof obj.isError != 'undefined'){
						$("#page-alert").removeClass("hide");
						$("#page-alert").show();
						$("#page-alert").addClass("alert-danger");
					    $("#page-alert").removeClass("alert-success");
					    $(".page-message").html(obj.errorMessage);
					    $("#page-alert").fadeOut(7000);
					}
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

$("#searchFiles").click(function(){
	if(!isValidSearchCriteria()){
		return;
	}
	populateFileSummary();
});

$('#start_date, #end_date').daterangepicker({ 
	singleDatePicker: true,
	timePicker: true,
	timePickerIncrement: 5,
	startDate: currentDate,
	maxDate: currentDate,
	format: 'DD/MM/YYYY h:mm A'
});

$('.daterange').on('apply.daterangepicker', function(ev, picker) {
	  $(this).trigger("keyup");
	  if($(this).attr("id") == "start_date"){
		  $('#end_date').daterangepicker({
				singleDatePicker: true,
				timePicker: true,
				timePickerIncrement: 5,
				startDate: currentDate,
				maxDate: currentDate,
				format: 'DD/MM/YYYY h:mm A',
				minDate: $(this).val()
			});
		  if($("#end_date").val() != ""){
			  var sdt = moment($(this).val(), "DD/MM/YYYY HH:mm a");
			  var edt =  moment($("#end_date").val(), "DD/MM/YYYY HH:mm a");
			  if(sdt >= edt){
				  $("#end_date").val($(this).val());
			  }
		  }
		  $('.daterange').on('apply.daterangepicker', function(ev, picker) {
			  $(this).trigger("keyup");
		  });
	    }
	});

//Update file
$("#update").click(function(){
	var interactionId = $.trim($("#interaction_id").val());
	var startDate = moment($.trim($("#start_date").val()), "DD/MM/YYYY HH:mm a").format(dateFormat);
	var endDate = moment($.trim($("#end_date").val()), "DD/MM/YYYY HH:mm a").format(dateFormat);
	var status = $.trim($("#status").val());
	var totalRecords = $.trim($("#total_records").val());
	var amount = $.trim($("#amount").val());
	var sino = $.trim($("#si_number").val());
	var comment = $.trim($("#comment").val());
	var emailId = $.trim($("#email_id").val());
	var data = "{'intid':'" + interactionId +
	"','starttime':'" + startDate +
	"','endtime':'" + endDate +
	"','status':'" + status + 
	"','totalrecords':" + totalRecords + 
	",'amount':'" + amount + 
	"','sino':'" + sino + 
	"','comments':'" + comment + 
	"','email':'" + emailId + "'}";
	
	numberOfValidFields = 0;
	
	$(".validation-field").trigger("keyup");
	
	if(numberOfValidFields != 7){
		return;
	}		
	$.confirm({
        text: "Are you sure, you want to update this file?",
        confirm: function(button) {
        	blockUI();
        	showLoadingPage();
        	randomKey = Math.random();
        	$.ajax({
    			url: 'updateFusionStatus.htm',
    			type: 'POST',
    			data: {status : data,
    				isFromAdmin : true,
    				randomKey : randomKey},
    			error: function(xhr, textStatus, thrownError) {
    				unblockUI();
    				$(".loading").addClass("hide");
					$(".message").removeClass("success");
					$(".message").addClass("error");
					$(".message").html("Failed to update file.");
    				if(xhr.status == 599){
    					window.location.href = "fileListing.htm?rUserId=";
    				} else if(xhr.status == 500){
    					window.location.href = "system-error.htm";
    				}
    			},
    			success : function(data) {
    				unblockUI();
    				$(".loading").addClass("hide");
    				if(data != null && data.toLowerCase() == "success"){	    
    					dtTable.fnStandingRedraw();
    					$(".message").removeClass("error");
						$(".message").addClass("success");
						$(".message").html("File has been successfully updated.");
						$("#update").hide();
    				}
    				else{    
    					var obj = JSON.parse(data);
    					$(".message").removeClass("success");
    					$(".message").addClass("error");
    					$(".message").html(obj.message);
    				}				
    			}

    		});
        },
        cancel: function(button) {
           return false;
        }
    });
}); 

});
function updateFile(interactionId){
	resetUpdateFields();
	showUpdatePopUp();
	$("#interaction_id").val(interactionId);
	
	$(".records").css("position","fixed");
	$(".records").css("top","50%");	
	//Get top offset for the position fixed
	var offset = $(".records").offset().top;
	//change position to absolute
	$(".records").css("position","absolute");
	//assign top offset
	$(".records").css("top", offset + 240);
}

function showLoadingPage(){
	$(".container").removeClass("hide");
	$(".loading").removeClass("hide");
}

function hideLoadingPage(){
	$(".container").addClass("hide");
	$(".loading").addClass("hide");
}

function showUpdatePopUp(){
	$(".container").removeClass("hide");
	$(".records").removeClass("hide");
}

function hideUpdatePopUp(){
	$(".container").addClass("hide");
	$(".records").addClass("hide");
}

function resetUpdateFields(){
	$(".message").html("");
	$("#interaction_id").val("");
	$("#status").val("SUCCESS");
	$("#total_records").val("");
	$("#amount").val("");
	$("#si_number").val("");
	$("#comment").val("");
	$("#email_id").val("");
	$(".validation-field").each(function(){
		$(this).nextAll('span:first').hide();
		$(this).removeClass("validation-success");
		$(this).removeClass("validation-error");
	});
	$('#start_date, #end_date').val("");
	$("#update").show();
	
}

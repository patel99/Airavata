var dtTable3;
var fileDataTable;
var selectedDate;
var regExForRejectionReason = /^[A-Za-z0-9\.;, \n]{1,255}$/;
var filenameRegex = /^[a-zA-Z0-9\-\._ ]+/;
var transactionIdRegex = /^[A-Za-z0-9 s]{1,100}$/;
var rejectReasonRegex=/^[A-Za-z0-9,\. '"\n]{1,255}$/g;
var vResult;
var isValidDate;
var isValidRejectionReason;
var randomKey;
var rejectionReason="";
var rejectFile;
var corpNames = null;
var corpIds = null;
var flag = false;
var tblColumns3;
var fileIdForProcess = null;
var otpId = null;
var attempts = null;
var fileRecords = [];
var isReferenceFile = false;
var id;
var authBtn;//overlay AUTHORIZE buttons corresponding to action AUTHORIZE buttons of the row
var rejBtn;//overlay REJECT buttons corresponding to action REJECT buttons of the row
var otpAttempts;
var isPayementFileViewed = false;
var pdfViewTag='<object id="object-pdf" standby="LOADING....." class="pdf-view hide" data="" type="application/pdf"></object>';

var tblColumns3 = [{"mDataProp": null, sDefaultContent: "", "bSortable": false, "sClass": "sr-no"},
                   {"mDataProp": "id", sDefaultContent: "", "sClass": "hide-column"}];

var tblColumns2 = [{"mDataProp": null, sDefaultContent: "", "bSortable": false, "sClass": "sr-no all"},
	               {"mDataProp": "name", sDefaultContent: "", "aTargets": [  ], "sClass":"all file-name" },
	               {"mDataProp": "totalAmount", sDefaultContent: "", "sClass":"all file-amount"},
	               {"mDataProp": "status.status", sDefaultContent: "", "sClass":"all status"},
	               {"mDataProp": "debitAccNo", sDefaultContent: "",},
	               {"mDataProp": "uploadedBy.userId", sDefaultContent: ""},		               
	               {"mDataProp": "transactionCount",sDefaultContent: ""},		               
	               {"mDataProp": "insts", sDefaultContent: ""},
	               {"mDataProp": null, sDefaultContent: "", "sClass": "all btn-action", "bSortable": false},			               
	               ];

$(document).ready(function (e) {
	
	if (window.history && window.history.pushState) {

	    window.history.pushState('forward', "asdf");
	    $(window).on('popstate', function() {
	    	if(!$('.overlay-body').hasClass('hide')){
	    		hidePopup();		
	    	}
	    	window.history.pushState('forward', "asdf");
	    });
	  }
	
	
	$( window ).unload(function() {
		  return "Handler for .unload() called.";
		});
		
	$("#fileAuthView").closest('li').addClass("active");
	
	if(!jQuery.browser.mobile){
		//Scroll Buttons
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
	}else{
		$("#transactionView").closest("li").remove();
	}
	////////////////////////

	//Date range picker
	$('#reservation').daterangepicker();

	var isHold;

	$(document).keyup(function(e) {
		if (e.keyCode == 27) {
			if($('#fileAuthDetailsModal').css('display') != 'block'){
				$("#submit").show();
				$(".pdf-view").addClass("hide");
				if(!$('.container').hasClass("hide")){
					$('.container').addClass("hide");
				}
				if(!$('.records').hasClass("hide")){
					$('.records').addClass("hide");
				}
				if(!$(".overlay").hasClass('hide')){
					hidePopup();
				}
				if(isReferenceFile) {
					viewFileBtnVisibility();
					isReferenceFile = false;
				}
			}
		}	    
	});

	$(".overlay").click(function(){
		hidePopup();
	});
	
	$('.container').click(function(){
		$('.container').addClass("hide");
		$('.records').addClass("hide");
		$(".pdf-view").hide();
		$(".loading").hide();
		if(isReferenceFile) {
			viewFileBtnVisibility();
			isReferenceFile = false;
		}
	});

	corpNames = new Array();
	corpIds = new Object();
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
					$("#page-alert").removeClass("hide");
					$("#page-alert").show();
					$("#page-alert").addClass("alert-danger");
					$("#page-alert").removeClass("alert-success");
					$(".page-message").html(data.errorMessage);
					$("#page-alert").fadeOut(7000);
				}
				$( '#autoComplete' ).typeahead( { source:corpNames } );
			}
	});

	//Validations for transaction Id Start

	$("#transaction_id").keyup(function(){
		vResult = true;
		var curUsedRegex = "";
		$(".message").html("");
		if($(this).attr("id") == "transaction_id"){
			curUsedRegex = transactionIdRegex;

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
	$("#transaction_id").click(function(){
		$(this).trigger("keyup");
	});	

	//Validations for transaction Id end

	//validate search criteria start
	function isValidSearchCriteria(){
		var isValid = true;
		var errorMessage = "";
		if((!($.trim($("#fileName").val()) == "")) && !($.trim($("#fileName").val()).match(filenameRegex))){
			isValid = false;
			errorMessage = "Please enter valid file name.";	
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

	fileLisingDataTable();
	$(".loading").hide();

	$("#search-fileLogs").click(function(){
		if(!isValidSearchCriteria()){
			return;
		}
		fileLisingDataTable();
	});	

	$(".close-popup-btn").click(function(){			
		hidePopup();
	});

	//Update file
	$("#update").click(function(){
		if($("#transaction_id").val() == ""){
			$(".message").html("Please enter transaction id");
			$(".message").removeClass("success");
			$(".message").addClass("error");
			return;			
		}
		if($("#btn-hold-yes").hasClass("btn-primary")){
			isHold = true;
		}
		var transactionId = $("#transaction_id").val();
		numberOfValidFields = 0;
		$("#transaction_id").trigger('keyup');
		if(numberOfValidFields != 1){			
			return;
		}
		$.confirm({
			text: "Are you sure, you want to update transaction details?",
			confirm: function(button) {
				blockUI();
				randomKey = Math.random();
				$.ajax({
					url: 'updateTransactionLog.htm',
					type: 'POST',
					data: {fileId : $("#id").val(),
						narration : $( "#narration option:selected" ).text(),
						randomKey : randomKey,
						transactionId : transactionId},
						dataType: 'json',
						contentType: 'application/x-www-form-urlencoded; charset=utf-8',
						mimeType: 'application/json',
						error: function(xhr, textStatus, thrownError) {	    				
							if(xhr.status == 599){
								window.location.href = "fileListing.htm";
							} else if(xhr.status == 500){
								window.location.href = "system-error.htm";
							}
						},
						success : function(data) {
							unblockUI();
							if(!data.isError){
								$('#fileTransmissionLogs').dataTable().fnStandingRedraw();
								$(".message").removeClass("error");
								$(".message").addClass("success");
								$(".message").html(data.message);
								$("#update").hide();	
								$("#hold-release").hide();
								$("#reject").hide();
								$("#reject-interim").hide();
							}
							else{
								$(".message").removeClass("success");
								$(".message").addClass("error");
								$(".message").html(data.message);
							}				
						}

				});
			},
			cancel: function(button) {
				return false;
			}
		});
	}); 

	$("#reject-interim").click(function(){
		$("#reject-interim").addClass("hide");
		$("#reject").show();
		$("#reject").removeClass("hide");
		$("#rejection-reason-div").removeClass("hide");
		$("#cancel-reject").removeClass("hide");
		$("#hold-release").addClass("hide");
		$("#update").addClass("hide");
		$(".validation-field").removeClass("validation-success");
		$(".validation-field").removeClass("validation-error");
		$(".validation-field").nextAll('span:first').hide();
	});

	$("#cancel-reject").click(function(){
		$("#rejection-reason").val("");
		$("#reject-interim").removeClass("hide");
		$("#reject").addClass("hide");
		$("#rejection-reason-div").addClass("hide");
		$("#cancel-reject").addClass("hide");
		$("#hold-release").removeClass("hide");
		$("#update").removeClass("hide");
	});

	//Reject file
	$("#reject").click(function(){

		$(".validation-field").trigger("keyup");
		if(!isValidRejectionReason){
			return;
		}		
		$.confirm({
			text: "Are you sure, you want to reject this file?",
			confirm: function(button) {
				randomKey = Math.random();
				blockUI();
				$.ajax({
					url: 'rejectTransactionLog.htm',
					type: 'POST',
					data: {fileId : $("#id").val(),
						randomKey: randomKey,
						rejectionReason : $.trim($("#rejection-reason").val())},
						dataType: 'json',
						contentType: 'application/x-www-form-urlencoded; charset=utf-8',
						mimeType: 'application/json',
						error: function(xhr, textStatus, thrownError) {
							if(xhr.status == 599){
								window.location.href = "fileListing.htm";
							} else if(xhr.status == 500){
								window.location.href = "system-error.htm";
							}
						},
						success : function(data) {
							unblockUI();
							$("#cancel-reject").addClass("hide");
							if(!data.isError){	    					
								$('#fileTransmissionLogs').dataTable().fnStandingRedraw();	    					
								$(".message").removeClass("error");
								$(".message").addClass("success");
								$(".message").html(data.message);
								$("#update").hide();
								$("#hold-release").hide();
								$("#reject").hide();							
							}
							else{
								$(".message").removeClass("success");
								$(".message").addClass("error");
								$(".message").html(data.message);
							}				
						}

				});
			},
			cancel: function(button) {
				return false;
			}
		});
	}); 


	$('#fileTransmissionLogs').on("click",'.popupMarker',function(fileName) {
		
		$('#fileAuthDetailsOvelay').addClass('hide');
		$('#fileDetailsOverlayDiv').addClass('hide');
		$('#fileAndRefFileViewDiv').removeClass('hide');
		$('#overlayFileName').html($(this).html());
		$('.file-name-header').width('80%');
		showPopup();
		
		var rowIndex = $('#fileTransmissionLogs').DataTable().page.info().start + $(this).closest("tr").index();
		
		if($(this).closest('td').attr('has-reference') == "true"){
			$('.refernce-file-div').removeClass('hide');
			referenceFiles(rowIndex);
		}else{
			$('.refernce-file-div').addClass('hide');
		}
		
		fileIdForProcess = fileRecords[rowIndex].id;
		
		$('#reject').attr('onclick', 'rejectFileFunction(' + rowIndex + ')');
		$('#authorize').attr('onclick', 'authorizeFile(' + rowIndex + ')');
		var randomKey = Math.random();		
		verifySession(fileIdForProcess, randomKey);
		
	});
	
	$('#btnFileContent').click(function(){

		var randomKey = Math.random();
		//if payement file is being viewed 
		//do not get file details again on button click
		if(!isPayementFileViewed){
			verifySession(fileIdForProcess, randomKey);
		}
	});
	
	$('#fileTransmissionLogs').on("click",'.popupMarkerMob',function(fileName) {
		$(".container").removeClass("hide");
		$(".loading").show();
		$('.file-name-header').width('100%');
		
		var rowIndex = $('#fileTransmissionLogs').DataTable().page.info().start + $(this).closest("tr").index();
		
		$('#reject').attr('onclick', 'rejectFileFunction(' + rowIndex + ')');
		$('#authorize').attr('onclick', 'authorizeFile(' + rowIndex + ')');
	});


	$('.btn-toggle').click(function() {
		$(this).find('.btn').toggleClass('active');  	    
		if ($(this).find('.btn-primary').size()>0) {
			$(this).find('.btn').toggleClass('btn-primary');
		}	    	    
		$(this).find('.btn').toggleClass('btn-default');

	});
	
	$(".shedule-date-dropdown > ul").click(function(){
		return false;
	});

	$('#scheduledDate').on('input', function (event) { 
		this.value = this.value.replace(/[^0-9]/g, '');
	});

	$(".validation-field").keyup(function(){
		vResult = true;
		if($(this).attr("id") == "comment"){
			if(!$.trim($(this).val()).match(regExForRejectionReason)){
				vResult = false;
			}
			isValidRejectionReason = vResult;
		}else{
			var dayOfMonth = $("#scheduledDate").val();			
			if(dayOfMonth == "" || parseInt(dayOfMonth, 10) > 30 || parseInt(dayOfMonth, 10) < 1){
				vResult = false;				
			}
			isValidDate = vResult;
		}
		if(vResult){

			$(this).nextAll('span:first').hide();
			$(this).addClass("validation-success");
			$(this).removeClass("validation-error");

		}else{			
			$(this).nextAll('span:first').show();
			$(this).removeClass("validation-success");
			$(this).addClass("validation-error");
		}
	});

	$("#chk-last-day").click(function() {

		if($(this).hasClass("checked")){			
			$(this).removeClass("checked");
			$("#scheduledDate").val("");
			$("#scheduledDate").removeAttr("disabled");
		}else{			
			$(this).addClass("checked");
			$("#scheduledDate").val("");
			$("#scheduledDate").attr("disabled", "disabled");
			$(".validation-field").removeClass("validation-success");
			$(".validation-field").removeClass("validation-error");
			$(".validation-field").nextAll('span:first').hide();
		}
	});

	$(".validation-field").click(function(){
		$(this).trigger("keyup");
	});
	
	$("#alertOkBtn").on("click", function(e) {
        $("#alertModal").modal('hide');     // dismiss the dialog
        $(".modal-backdrop").hide()
        $("body, html").css("overflow","auto");
    });

    $("#alertModal").on("hide", function() {    // remove the event listeners when the dialog is dismissed
        $("#alertModal a.btn").off("click");
    });
    
    $("#alertModal").on("hidden", function() {  // remove the actual elements from the DOM when fully hidden
        $("#alertModal").remove();
    });
   
	$('#fileAuthDetailsModal').change(function(){
			$('#fileAndRefFileViewDiv').css('margin-top', 0);
	});
});

function showFileAuthrizationDetails(btn){

	$('.ovelay-header').html("File Status Timeline");
	$('.overlay-action-btn').addClass('hide');
	var rowIndex = $('#fileTransmissionLogs').DataTable().page.info().start + btn.closest("tr").index();
	fileIdForProcess = fileRecords[rowIndex].id;
	
	randomKey=Math.random();
	$.ajax({
		url: 'getFileAuthTimeline.htm',
		type: 'GET',
		data: {fileId : fileIdForProcess,
			randomKey:randomKey},
		dataType: 'json',
		error: function(xhr, textStatus, thrownError) {
			hideLoadingPage();
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			} else if(xhr.status == 404){
				window.location.href = "resource-not-found.htm";
			}
		},
		success : function(data) {
			
			if(!data.isError){	    
				
				$('#fileAndRefFileViewDiv').addClass('hide');
				$('#fileDetailsOvelay').addClass('hide');
				$('#fileAuthDetailsOvelay').removeClass('hide');
				showPopup();
				timeLineStr = "";
				typeOfAuthorizationInTimeline = -1;
				if(data.fileAuthTimeline.length > 0){
					for(var i=0; i<data.fileAuthTimeline.length; i++){
						
						//if status is pending with no pending authorizations
						//move on without considering that authorization type
						
						switch (data.fileAuthTimeline[i].authorizationTypeId.toString()) {
						case AUTH_TYPE_INTRA_CORP:
							if(typeOfAuthorizationInTimeline != AUTH_TYPE_INTRA_CORP){
								if((data.fileAuthTimeline[i].status == STATUS_NAME_PENDING && data.fileAuthTimeline[i].pendingNoofAuthorizations != 0)
										|| data.fileAuthTimeline[i].status != STATUS_NAME_PENDING){
									typeOfAuthorizationInTimeline=AUTH_TYPE_INTRA_CORP;
									timeLineStr += '<li onclick="toggleList($(this), ' + typeOfAuthorizationInTimeline + ')" class="time-label auth-type ' + typeOfAuthorizationInTimeline + '"><span class="bg-aqua"> Intra Corporate Authorization</span></li>'
								}
							}
							break;
						case AUTH_TYPE_INTER_CORP:
							if(typeOfAuthorizationInTimeline != AUTH_TYPE_INTER_CORP){
								if((data.fileAuthTimeline[i].status == STATUS_NAME_PENDING && data.fileAuthTimeline[i].pendingNoofAuthorizations != 0)
										|| data.fileAuthTimeline[i].status != STATUS_NAME_PENDING){
									typeOfAuthorizationInTimeline=AUTH_TYPE_INTER_CORP;
									timeLineStr += '<li onclick="toggleList($(this), ' + typeOfAuthorizationInTimeline + ')" class="time-label auth-type ' + typeOfAuthorizationInTimeline + '"><span class="bg-aqua">Inter Corporate Authorization</span></li>'
								}
							}					
							break;
						case AUTH_TYPE_BRANCH:
							if(typeOfAuthorizationInTimeline != AUTH_TYPE_BRANCH){
								if((data.fileAuthTimeline[i].status == STATUS_NAME_PENDING && data.fileAuthTimeline[i].pendingNoofAuthorizations != 0)
										|| data.fileAuthTimeline[i].status != STATUS_NAME_PENDING){
									typeOfAuthorizationInTimeline=AUTH_TYPE_BRANCH;
									timeLineStr += '<li onclick="toggleList($(this), ' + typeOfAuthorizationInTimeline + ')" class="time-label auth-type ' + typeOfAuthorizationInTimeline + '"><span class="bg-aqua">Branch Authorization</span></li>'
								}
							}
							break;
						
						default:
							
							break;
						}
						
						if(data.fileAuthTimeline[i].status == STATUS_NAME_AUTHORIZED){
							timeLineStr += "<!-- /.timeline-label -->" +
									"<li class=" + typeOfAuthorizationInTimeline + "><i class='fa  fa-check bg-green'></i><div class='timeline-item'>" +
									"<h3 class='timeline-header no-border'><a>" +
									data.fileAuthTimeline[i].userId + "</a> from " + data.fileAuthTimeline[i].group + " " 
									+ data.fileAuthTimeline[i].status.toLowerCase() +" file on " + data.fileAuthTimeline[i].insts + "</h3>" +
									"</div></li>";	
						}else if(data.fileAuthTimeline[i].status == STATUS_NAME_REJECTED){
							timeLineStr += "<!-- /.timeline-label -->" +
									"<li class=" + typeOfAuthorizationInTimeline + "><i class='fa fa-times bg-red'></i><div class='timeline-item'>" +
									"<h3 class='timeline-header'><a>" +
									data.fileAuthTimeline[i].userId + "</a> from " + data.fileAuthTimeline[i].group + " " 
									+ data.fileAuthTimeline[i].status.toLowerCase() +" file on " + data.fileAuthTimeline[i].insts + "</h3>" +
									"<div class='timeline-body'>" + data.fileAuthTimeline[i].rejectionReason + "</div>" +
									"</div></li>";	
						}else{							
							for(var j=0; j<data.fileAuthTimeline[i].pendingNoofAuthorizations; j++){
								timeLineStr += "<!-- /.timeline-label -->" +
								"<li class=" + typeOfAuthorizationInTimeline + "><i class='fa fa-minus-square bg-yellow'></i><div class='timeline-item'>" +
								"<h3 class='timeline-header no-border'><a>Pending " +
								"</a>authorization from "+ data.fileAuthTimeline[i].group +" authorizer</h3>" +
								"</div></li>";	
							}
						}
					}
				}else{
					if(btn)
					timeLineStr += "<li><i class='fa  fa-check bg-green'></i><div class='timeline-item'>" +
					"<h3 class='timeline-header no-border'><a>The file was processed without authorization.</a></h3>" +
					"</div></li>";	
				}
				
				timeLineStr += "<li><i class='fa fa-stop color-red bg-gray'></i></li>";
				
				$('#overlayFileName').html(btn.closest("tr").find('.file-name > div').attr('id'));
				
				$('.timeline > li').remove();
				$('.timeline').append(timeLineStr);
				
			}
			else{
				$('#alertMsg').html(data.message);
				$("#alertModal").modal();
			}	
		}
	});	
}

function openOverlay(btn){
	
	$('#fileDetailsOverlayDiv').removeClass('hide');
	$('#fileAndRefFileViewDiv').addClass('hide');
	$('.ovelay-header').html("File Details");
	$('.overlay-action-btn').removeClass('hide');
	$('#loadingRecords').removeClass('hide');
	$('#loadingRecords').addClass('overlay-file-name-div');
	$('.file-name-header').width('95%');
	var rowIndex = $('#fileTransmissionLogs').DataTable().page.info().start + btn.closest("tr").index();
	fileIdForProcess = fileRecords[rowIndex].id;
	
	$('#fileAuthDetailsOvelay').addClass('hide');
	$('#fileRecordsMenu').html('<li><a onclick="authorizeFile('+rowIndex+')"></a></li>'
	+ '<li><a onclick="rejectFileFunction('+rowIndex+')">Reject</a></li>');
	
	$(".overlay-body,.overlay").removeClass("hide");
	$(".overlay-body").animate({left:'0%'});
	$(".overlay-body").css("width","100%");
	$(".overlay").fadeIn();
	$(".tab-close").fadeIn();
	$("body, html").css("overflow-x","");
	$("body, html").css("overflow","hidden");
	
	$('#overlayFileName').html(btn.closest("tr").find('.file-name > div').attr('id'));
	
	randomKey=Math.random();
	$.ajax({
		url: 'getFileProperties.htm',
		type: 'GET',
		data: {applicationId : fileRecords[rowIndex].applicationConstant,
			randomKey:randomKey},
		dataType: 'json',
		error: function(xhr, textStatus, thrownError) {
			hideLoadingPage();
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			} else if(xhr.status == 404){
				window.location.href = "resource-not-found.htm";
			}
		},
		success : function(data) {
			
			if(data.data != null) {
				var propData = data.data;
				$("#individualFileView thead tr .remove").remove();				
				while(tblColumns3.length !=2) {
					tblColumns3.pop();
				}
				for(var i=0;i<propData.length;i++) {
					$("#individualFileView thead tr").append("<th class='remove "+propData[i]+"'>"+propData[i]+"</th>");
					tblColumns3.push({"mDataProp": propData[i], sDefaultContent: "", "sClass": propData[i]});
				}
				createFileDetailView();
				authBtn = btn.closest('tr').find('.auth-btn');
				rejBtn = btn.closest('tr').find('.reject-btn');
				$('#loadingRecords').addClass('hide');
				$('#loadingRecords').removeClass('overlay-file-name-div');
				unblockUI();
			}
		}
	});
	
	function createFileDetailView() {
				
		fileDataTable = $("#individualFileView").dataTable({
			"bDestroy":true,
			"bAutoWidth": false,
			"bServerSide": true, 
			"sAjaxSource": "getFileData.htm",
			"bPaginate": true,
			"bLengthChange":false,
			"iDisplayLength" : 10,
			"bFilter":false,
			"aoColumns": tblColumns3,
			"fnServerParams": function ( aoData ) {
				blockUI();
				randomKey = Math.random();
				aoData.push({name:"randomKey", value:randomKey});
				aoData.push({name:"direction", value:"next"});
				aoData.push({name:"applicationId", value:fileRecords[rowIndex].applicationConstant});
				aoData.push({name:"fileId", value:fileRecords[rowIndex].id});
			},
			"fnRowCallback" : function(nRow, aData, iDisplayIndex){								
							  	var dSettings = fileDataTable.fnSettings();
							  	$("td:eq(0)", nRow).html(dSettings._iDisplayStart+iDisplayIndex +1);
							  	return nRow;
			},
			"fnServerData": function ( sSource, aoData, fnCallback ) {
				unblockUI();
				$.get( sSource, aoData, function (json) {
					var obj = JSON.parse(json);
					fnCallback(obj);	               
				}).fail(function(jqXHR, e){
					hideLoadingPage();
					if(jqXHR.status == 599){
						window.location.href = "fileListing.htm";
					} else if(jqXHR.status == 500){
						window.location.href = "system-error.htm";
					}
				});
			}
		});
		$('#fileDetailsOvelay').removeClass('hide');
	}
}

function showLoadingPage(){
	$(".container").removeClass("hide");
	$(".loading").removeClass("hide");

}

function hideLoadingPage(){
	$(".container").addClass("hide");
	$(".loading").addClass("hide");
}

function refreshDataTable(){
	dtTable3.fnStandingRedraw();
	setTimeout(refreshDataTable, (10 * 1000));
}
function verifySession(fileIdForProcess, randomKey){
	$.ajax({
		url: 'verifySession.htm',
		type: 'GET',
		data: {randomKey : randomKey},
		dataType: 'json',
		async:false,
		error: function(xhr, textStatus, thrownError) {
			hideLoadingPage();
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			}
		},
		success : function(data) {			
			randomKey = Math.random();
			$(".pdf-view").remove();
			$('.pdf-view-div').append(pdfViewTag);
			$(".pdf-view").attr("data", "getFileView.htm?randomKey="+randomKey+"&fileId=" + fileIdForProcess + "&isRequestFromUploader=false#view=Fit");
			$(".pdf-view").height($('.overlay-body').height()- ($('#fileAndRefFileViewDiv .navbar-form').offset().top + $('#fileAndRefFileViewDiv .navbar-form').height()) - 25);
			$(".pdf-view").removeClass("hide");
			$(".pdf-view").css("display", "");
			$(".loading").hide();
			isPayementFileViewed = true;
		}
	});
	
}

function fileLisingDataTable(){

	var fileName = $("#fileName").val().trim();
	var corporateId = 0; 
	if($("#autoComplete").val() != null && $("#autoComplete").val() != ""){
		if(undefined != corpIds[$('#autoComplete' ).val()]){
			corporateId = corpIds[$('#autoComplete' ).val()];
		}else{
			$("#page-alert").removeClass("hide");	
			$("#page-alert").show();
			$("#page-alert").removeClass("alert-success");
			$("#page-alert").addClass("alert-danger");
			$(".page-message").html("Please select valid corporate name");
			$("#page-alert").fadeOut(7000);
			return;
		}
	}else{
		corporateId = 0;
	}

	var startts = "", endts = "";
	if($("#reservation").val().split("-")[1] !== undefined){ 
		startts = $("#reservation").val().split("-")[0];
		endts = $("#reservation").val().split("-")[1];	
	}

	dtTable3 = $('#fileTransmissionLogs').dataTable({
		"bDestroy":true,
		"bAutoWidth": false,
		"bServerSide": true, 
		"sAjaxSource": "filesToAuthorize.htm",
		"bPaginate": true,
		"bLengthChange":false,
		"iDisplayLength" : 10,
		"bFilter":false,
		"aoColumns": tblColumns2,
		responsive: true,
		"fnServerParams": function ( aoData ) {
			blockUI();
			randomKey = Math.random();
			aoData.push({name:"randomKey", value:randomKey});
			aoData.push({name:"direction", value:"next"});
			if(fileName != ""){
				aoData.push({name:"fileName", value:fileName});
			}
			if(startts != ""){
				aoData.push({name:"startts", value:startts});
			}
			if(endts != ""){
				aoData.push({name:"endts", value:endts});
			}
			if(corporateId != ""){
				aoData.push({name:"corporateId", value:corporateId});
			}
		},"aoColumnDefs":[{"aTargets": [ 1 ], 
			"mRender": function ( rate, type, full )  {
				var fileNameAlert=null;
				var fileName = rate.split(".");
				if(!jQuery.browser.mobile){
					if(full.status.status.toLowerCase() != STATUS_NAME_ERROR.toLowerCase() && full.status.status.toLowerCase() != STATUS_NAME_NO_AUTH_MATRIX_FOUND.toLowerCase()) {
						fileNameAlert= '<div id="'+rate+'" class="popupLink popupMarker">'+rate+'</div>';	
					}
					else {
						fileNameAlert= '<div id="'+rate+'">'+rate+'</div>';	
					}
					$(".clickFileName").removeClass("hide");
				}
				else{
					
					if(full.status.status.toLowerCase() != STATUS_NAME_ERROR.toLowerCase() && full.status.status.toLowerCase() != STATUS_NAME_NO_AUTH_MATRIX_FOUND.toLowerCase()) {
						fileNameAlert= '<div id="'+rate+'" class="popupLink popupMarkerMob" onclick="openOverlay($(this))">'+rate+'</div>';	
					}
					else {
						fileNameAlert= '<div id="'+rate+'">'+rate+'</div>';	
					}
					
				}
				return fileNameAlert;
			}
		},
		{"aTargets": [ 3 ], 
			"mRender": function ( rate, type, full )  {
				if($.trim(rate) != STATUS_NAME_ERROR && $.trim(rate) != STATUS_NAME_NO_AUTH_MATRIX_FOUND){
					statusData= '<div id="'+rate+'" class="popupLink popupFileAuthDetails" onclick="showFileAuthrizationDetails($(this))">'+rate+'</div>';
				}else{
					statusData = rate;
				}
				return statusData;
			}
		}],
		"fnRowCallback" : function(nRow, aData, iDisplayIndex){    
			var oSettings = dtTable3.fnSettings();
			$("td:first", nRow).html(oSettings._iDisplayStart+iDisplayIndex +1);
			var rowIndex = oSettings._iDisplayStart+iDisplayIndex;
			
			
			if(!jQuery.browser.mobile) {
			
				if(aData.hasReferenceFile) {
					$(".file-name", nRow).attr('has-reference', true);
				}else{
					$(".file-name", nRow).attr('has-reference', false);
				}
			}
			
			$(".btn-action", nRow).append('<button onclick="authorizeFile(' + rowIndex +' )" class="btn btn-primary btn-group btn-action-margin-left info auth-btn" data-toggle="tooltip" title="Authorize" ><i class="fa fa-check"></i></button>');
			$(".btn-action", nRow).append('<button onclick="rejectFileFunction(' + rowIndex +' )" class="btn btn-primary btn-danger btn-action-margin-left info reject-btn" data-toggle="tooltip" title="Reject" ><i class="fa fa-ban"></i></button>');
			
			fileRecords[oSettings._iDisplayStart+iDisplayIndex] = aData;
			return nRow;
		},
		"fnServerData": function ( sSource, aoData, fnCallback ) {
			unblockUI();
			fileRecords = [];
			$.get( sSource, aoData, function (json) {
				if($('#object-pdf').hasClass('hide') || ($('#object-pdf').css("display") == "none")){
					if($('#modal').hasClass('hide') || ($('#modal').css("display") == "none")){
						hideLoadingPage();
					} else {
						$(".loading").addClass("hide");
					}	
				} else {
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
				hideLoadingPage();
				if(jqXHR.status == 599){
					window.location.href = "fileListing.htm";
				} else if(jqXHR.status == 500){
					window.location.href = "system-error.htm";
				}
			});
		}
	});

	$(".data-table-expand").on( 'click', function(e){
		if($(this).hasClass("collapsed")){
			$(".toggle-column").removeClass("hide-column");
			$(".data-table-expand").html(" - Collapse table");
			$(this).removeClass("collapsed");	
		}else{
			$(".toggle-column").addClass("hide-column");
			$(".data-table-expand").html(" + Expand table");
			$(this).addClass("collapsed");		
		}
	});

	$("#fileTransmissionLogs").removeAttr("style");
}


$('#authOtpValue').keyup(function(){
	otp = $.trim($('#authOtpValue').val());

	if(otp != "") {
		$('.popup-message').hide();
		$('.authorize').removeAttr('disabled');
	}
	else {
		$('.authorize').attr('disabled','disabled');
		$('.popup-message').addClass('error');
		$('.popup-message').removeClass('success');
		$('.popup-message').html("*Please enter OTP value");
		$('.popup-message').show();
	}
});

$(".authorize").click(function() {
	
	$('#authorizeModal').find('.btn').attr('disabled', 'disabled');
	$('.popup-message').removeClass('error');
	$('.popup-message').addClass('success');
	$('.popup-message').html("Authorizing file.....");
	$('.popup-message').show();
	
	if (otp.length > 0) {
		otp = otp.toLowerCase();
		var hash = CryptoJS.SHA256(otp);
		var hashValue = hash.toString(CryptoJS.enc.Base64);
	}
	
	randomKey=Math.random();
	
	$.ajax({
		url: 'authorizeFile.htm',
		type: 'POST',
		data: {fileId : id,
			otpId : otpId,
			otpValue : hashValue,
			randomKey : randomKey},
			dataType: 'json',
			error: function(xhr, textStatus, thrownError, data) {
				unblockUI();
				$('#authorizeModal').find('.exit').removeAttr('disabled');
				$("#page-alert").removeClass("hide");
				$("#page-alert").show();
				$("#page-alert").addClass("alert-danger");
				$("#page-alert").removeClass("alert-success");
				$(".page-message").html("Failed to authorize file !!");
				$("#page-alert").fadeOut(7000);
				if(xhr.status == 599){
					window.location.href = "login.htm?error=sessionExpired";
				} else if(xhr.status == 500){
					window.location.href = "system-error.htm";
				}
			},
			success : function(data) {
				unblockUI();				
				if(data.isError) {
					if(data.isValidationFailure) {
						otpAttempts--;
						if(otpAttempts == 0){
							$('#authorizeModal').find('.exit').removeAttr('disabled');
							$('#authorizeModal').find('.exit').click();
							$('#alertMsg').html("OTP expired, please try again.");
							$('#alertModal').modal();
						}else{
							$('.popup-message').addClass('error');
							$('.popup-message').removeClass('success');
							$('.popup-message').html(data.message);
							$('.popup-message').show();
						}						
						$('#authOtpValue').val('');
						$('#authAttemptsMsg').html("Attempts left " + otpAttempts)
					}
					else {
						$('#authorizeModal').find('.exit').removeAttr('disabled');
						$('#authorizeModal').find('.exit').click();
						$('#alertMsg').html(data.message);
						$('#alertModal').modal();
					}
					
				}
				else {
					$('#authorizeModal').find('.exit').removeAttr('disabled');
					$('#authorizeModal').find('.exit').click();
					$('#alertMsg').html(data.message);
					$('#alertModal').modal();
				}				
				$(".container").addClass("hide");
				$(".overlay-body").addClass("hide");
				$(".overlay").addClass("hide");
				dtTable3.fnStandingRedraw();
			}
	});
});


$(".resend").click(function() {	

	$('#authorizeModal').find('.btn').attr('disabled', 'disabled');
	$('.popup-message').removeClass('error');
	$('.popup-message').addClass('success');
	$('.popup-message').html("Sending OTP.....");
	$('.popup-message').show();
	
	randomKey=Math.random();
	$.ajax({
		url: 'sendOTP.htm',
		type: 'POST',
		data: {userId : userId,
			randomKey : randomKey},
		dataType: 'json',
		error: function(xhr, textStatus, thrownError, data) {
			unblockUI();
			$('.popup-message').addClass('error');
			$('.popup-message').removeClass('success');
			$('.popup-message').html("Failed to authorize file !!");
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			}
		},
		success : function(data) {
			$('#authorizeModal').find('.btn').removeAttr('disabled');
			$('#authOtpValue').trigger('keyup');
			unblockUI();
			otpId = data.otpId;
			attempts = data.attempts;
			if(data.status == "SUCCESS") {
				$('.popup-message').removeClass('error');
				$('.popup-message').addClass('success');
				$('.popup-message').text("OTP generated successfully");
				$('.popup-message').show();
				otpAttempts = data.attempts;
			}
			else {
				$('.popup-message').removeClass('success');
				$('.popup-message').addClass('error');
				$('.popup-message').html(data.message);
				$('.popup-message').show();
			}			
			$(".container").addClass("hide");
			$(".overlay-body").addClass("hide");
			$(".overlay").addClass("hide");
		}
	});
});

$('#confirmAuth').click(function(){
	$('#authOtpValue').val('');
	$('#fileAuthDetailsModal .popup-message').html("Sending OTP.....");
	$('#fileAuthDetailsModal').find('.btn').attr('disabled', 'disabled');
	
	randomKey=Math.random();
	$.ajax({
		url: 'sendOTP.htm',
		type: 'POST',
		data: {randomKey : randomKey},
			dataType: 'json',
			error: function(xhr, textStatus, thrownError, data) {				
				unblockUI();
				$('#fileAuthDetailsModal').find('.btn').removeAttr('disabled');
				$('.popup-message').addClass('error');
				$('.popup-message').removeClass('success');
				$('.popup-message').html("Failed to generate OTP !!");
				if(xhr.status == 599){
					window.location.href = "login.htm?error=sessionExpired";
				} else if(xhr.status == 500){
					window.location.href = "system-error.htm";
				}
			},
			success : function(data) {
				unblockUI();
				$('#fileAuthDetailsModal').find('.btn').removeAttr('disabled');
				if(!data.isError){
					$('#authOtpId').val(data.otpId);
					$('#authAttemptsMsg').html("Attempts left " + data.attempts)
					$('.popup-message').addClass('error');
					$('.popup-message').removeClass('success');
					$('.popup-message').html("*Please enter OTP value");
					$('.popup-message').hide();
					$('.authorize').attr('disabled','disabled');
					$('#fileAuthDetailsModal').find('.exit').click();
					$('body').css('overflow-y', 'hidden');
					$('#authorizeModal').modal({backdrop:"static"});
					setTimeout(moveFileViewOnSecondModal, 200);
					$('body').css('overflow-y', 'scroll');
					otpId = data.otpId;
					otpAttempts = data.attempts;					
				}else{
					$('#fileAuthDetailsModal .popup-message').html(data.message);
					$('#fileAuthDetailsModal .popup-message').show();
					$('#fileAuthDetailsModal .popup-message').addClass('error');
					$('#fileAuthDetailsModal .popup-message').removeClass('success');
					
				}
				
			}
	});			
});

//get file view to its original place
$('button[data-dismiss="modal"]').click(function(){
	$('#fileAndRefFileViewDiv').css('margin-top', 0);
	$(this).closest('.modal').modal('hide');
})

$("#fileAuthDetailsModal, #fileRejectDetailsModal").click(function(e){
	if(!$(e.target).attr('id') == 'confirmAuth' || !$(e.target).attr('id') == 'confirmReject') {
		$('#fileAndRefFileViewDiv').css('margin-top', 0);	
	}
	
}).children().click(function(e) {
	if(!$(e.target).is('button')){
		return false;
	}
  
});


function authorizeFile(rowIndex){

	var datetime = new Date();
	randomKey = datetime.getMilliseconds();
		
	id = fileRecords[rowIndex].id;
	
	$('.fileNameVal').html(fileRecords[rowIndex].name);
	$('.debitAccNoVal').html(fileRecords[rowIndex].debitAccNo);
	$('.amountVal').html(fileRecords[rowIndex].totalAmount);

	$('#fileAuthDetailsModal').find('.popup-message').text('');
	$('body').css('overflow-y', 'hidden');
	$('#fileAuthDetailsModal').modal();
	setTimeout(moveFileViewOnFirstModal, 200);
	$('body').css('overflow-y', 'scroll');
	
}
	
function moveFileViewOnFirstModal(){
	curModal = null;
	if($('#fileAuthDetailsModal').is(':visible')){
		curModal = $('#fileAuthDetailsModal');
	}else{
		curModal = $('#fileRejectDetailsModal');
	}
	$('#fileAndRefFileViewDiv').css('margin-top', curModal.find('.modal-content').offset().top - $(window).scrollTop() + curModal.find('.modal-dialog').height() - $('.overlay-file-name-div').height() + 60)
}

function moveFileViewOnSecondModal(){
	curModal = null;
	if($('#authorizeModal').is(':visible')){
		curModal = $('#authorizeModal');
	}else{
		curModal = $('#rejectModal');
	}
	$('#fileAndRefFileViewDiv').css('margin-top', curModal.find('.modal-content').offset().top - $(window).scrollTop() + curModal.find('.modal-dialog').height() - $('.overlay-file-name-div').height() + 60);
}

function rejectFileFunction(rowIndex){
	
	var datetime = new Date();
	randomKey = datetime.getMilliseconds();
		
	id = fileRecords[rowIndex].id;
	
	$('.fileNameVal').html(fileRecords[rowIndex].name);
	$('.debitAccNoVal').html(fileRecords[rowIndex].debitAccNo);
	$('.amountVal').html(fileRecords[rowIndex].totalAmount);

	$('#fileRejectDetailsModal').find('.popup-message').text('');
	$('body').css('overflow-y', 'hidden');
	$('#fileRejectDetailsModal').modal();
	setTimeout(moveFileViewOnFirstModal, 200);
	$('body').css('overflow-y', 'scroll');
}

$('#confirmReject').click(function(){
	$('#rejOtpValue').val('');
	$('#rejectModal #comment').val('');
	$('#fileRejectDetailsModal .popup-message').html("Sending OTP.....");
	$('#fileRejectDetailsModal').find('.btn').removeAttr('disabled');
	
	randomKey=Math.random();
	$.ajax({
		url: 'sendOTP.htm',
		type: 'POST',
		data: {randomKey : randomKey},
			dataType: 'json',
			error: function(xhr, textStatus, thrownError, data) {
				unblockUI();
				$('#fileRejectDetailsModal').find('.btn').removeAttr('disabled');
				$(".popup-message").removeClass("hide");
				$(".popup-message").html("Failed to generate OTP");
				$(".popup-message").show();
				if(xhr.status == 599){
					window.location.href = "login.htm?error=sessionExpired";
				} else if(xhr.status == 500){
					window.location.href = "system-error.htm";
				}
			},
			success : function(data) {
				unblockUI();
				$('#fileRejectDetailsModal').find('.btn').removeAttr('disabled');
				if(!data.isError){
					$('#rejOtpId').val(data.otpId);
					$('#rejAttemptsMsg').html("Attempts left " + data.attempts);
					$('.popup-message').addClass('error');
					$('.popup-message').removeClass('success');
					$('.popup-message').html("*Please enter OTP value");
					$('.popup-message').hide();
					$('.reject').attr('disabled','disabled');
					$('#fileRejectDetailsModal').find('.exit').click();
					$('#rejectModal').modal({backdrop:"static"});
					setTimeout(moveFileViewOnSecondModal, 200);
					otpId = data.otpId;
					otpAttempts = data.attempts;
				}else{
					$('#fileRejectDetailsModal .popup-message').html(data.message);
					$('#fileRejectDetailsModal .popup-message').show();
					$('#fileRejectDetailsModal .popup-message').addClass('error');
					$('#fileRejectDetailsModal .popup-message').removeClass('success');
				}
				
			}
	});
});

$('#rejOtpValue, #comment').keyup(function(){
	rejectFileTextValidator();
	
});


$(".reject").click(function() {
	
	$('#rejectModal').find('.btn').attr('disabled', 'disabled');
	
	rejectFileTextValidator();
	
	$('.popup-message').removeClass('error');
	$('.popup-message').addClass('success');
	$('.popup-message').html("Rejecting file.....");
	$('.popup-message').show();	
	
	$('.reject').attr('disabled', 'disabled');
	if (otp.length > 0) {
		otp = otp.toLowerCase();
		var hash = CryptoJS.SHA256(otp);
		var hashValue = hash.toString(CryptoJS.enc.Base64);
	}
	
	var datetime = new Date();
	randomKey = datetime.getMilliseconds();
	
	
	$.ajax({
		url: 'rejectFile.htm',
		type: 'POST',
		data: {fileId : id,
			otpId : otpId,
			otpValue : hashValue,
			comment:reason,
			randomKey : randomKey},
			dataType: 'json',
			error: function(xhr, textStatus, thrownError, data) {
				unblockUI();
				$(".popup-message").removeClass("hide");
				$('.popup-message').removeClass('success');
				$('.popup-message').addClass('error');
				$(".popup-message").html("Failed to reject file.");
				$(".popup-message").show();
				if(xhr.status == 599){
					window.location.href = "login.htm?error=sessionExpired";
				} else if(xhr.status == 500){
					window.location.href = "system-error.htm";
				}
			},
			success : function(data) {
				$(".resend").removeAttr("disabled");
				$(".exit").removeAttr("disabled");
				unblockUI();
				
				if(data.isError) {
					$('.reject').attr('disabled', 'disabled');
					if(data.isValidationFailure) {
						otpAttempts--;						
						if(otpAttempts == 0){
							$('#rejectModal').find('.exit').removeAttr('disabled');
							$('#rejectModal').find('.exit').click();
							$('#alertMsg').html("OTP expired, please try again.");
							$('#alertModal').modal();
						}else{
							$('.popup-message').addClass('error');
							$('.popup-message').removeClass('success');
							$('.popup-message').html(data.message);
							$('.popup-message').show();
						}
						$('#rejOtpValue').val('');
						$('#rejAttemptsMsg').html("Attempts left " + otpAttempts)
					}
					else {
						$('#rejectModal').find('.exit').click();
						$('#alertMsg').html(data.message);
						$('#alertModal').modal();
					}
					
				}
				else {
					$('#rejectModal').find('.exit').removeAttr('disabled');
					$('#rejectModal').find('.exit').click();
					$('#alertMsg').html(data.message);
					$('#alertModal').modal();
				}				
				$(".container").addClass("hide");
				$(".overlay-body").addClass("hide");
				$(".overlay").addClass("hide");
				dtTable3.fnStandingRedraw();
			}
	});
});

function rejectFileTextValidator() {
	otp = $.trim($('#rejOtpValue').val());
	reason = $.trim($('#comment').val());

	if(otp != "" && reason !="") {
		$('.reject').removeAttr('disabled');
		$('.popup-message').hide();
	}
	else if(otp == "" && reason !=""){
		$('.reject').attr('disabled','disabled');
		$('.popup-message').addClass('error');
		$('.popup-message').removeClass('success');
		$('.popup-message').html("*Please enter OTP value");
		$('.popup-message').show();
	}
	else if(otp != "" && reason =="") {
		$('.reject').attr('disabled','disabled');
		$('.popup-message').addClass('error');
		$('.popup-message').removeClass('success');
		$('.popup-message').html("*Please enter rejection reason");
		$('.popup-message').show();
	}
	else {
		$('.reject').attr('disabled','disabled');
		$('.popup-message').addClass('error');
		$('.popup-message').removeClass('success');
		$('.popup-message').html("*Please enter OTP value and rejection reason");
		$('.popup-message').show();
	}
}

function referenceFiles(rowIndex) {
	
	id = fileRecords[rowIndex].id;
	
	var datetime = new Date();
	randomKey = datetime.getMilliseconds();
	
	$.ajax({
		url: 'getReferenceFiles.htm',
		type: 'GET',
		data: {fileId : id,
			randomKey : randomKey},
		dataType: 'json',
		error: function(xhr, textStatus, thrownError, data) {
			unblockUI();
			$(".popup-message").removeClass("hide");
			$(".popup-message").html("Failed to fetch reference files.");
			$(".popup-message").show();
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			}
		},
		success : function(data) {
			$('#referenceDropDown').html('<option value="-1">Select</option>');
			viewFileBtnVisibility();
			if(data.referenceFiles.length > 0) {
				for(var i=0; i< data.referenceFiles.length; i++) {
					$('#referenceDropDown').append('<option value="'+data.referenceFiles[i].id+'">'+data.referenceFiles[i].name+'</option>');
				}
			}
		}
	});
}

$("#viewFile").click(function() {
	
	var datetime = new Date();
	randomKey = datetime.getMilliseconds();
	var referenceFileId = $("#referenceDropDown").val();
	
	$(".pdf-view").remove();
	$('.pdf-view-div').append(pdfViewTag);
	$(".pdf-view").attr("data", "getFileView.htm?randomKey="+randomKey+"&fileId=" + referenceFileId + "#&isRequestFromUploader=falseview=Fit");
	$(".pdf-view").height($('.overlay-body').height()- ($('#fileAndRefFileViewDiv .navbar-form').offset().top + $('#fileAndRefFileViewDiv .navbar-form').height()) - 25);
	$(".pdf-view").removeClass("hide");
	$(".pdf-view").css("display", "");

	isPayementFileViewed = false;
	isReferenceFile = true;
});

$("#referenceDropDown").change(function() {
	
	viewFileBtnVisibility();
});

function viewFileBtnVisibility() {
	
	var value = $("#referenceDropDown").val();
	if(value == -1) {
		$("#viewFile").attr('disabled','disabled');
	}
	else {
		$("#viewFile").removeAttr('disabled');
	}
}
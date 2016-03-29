var dtTable3;
var fileDataTable;
var selectedDate;
var regExForRejectionReason = /^[A-Za-z0-9\.;, \n]{1,250}$/;
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
var otpId;
var id;
var authBtn;//overlay AUTHORIZE buttons corresponding to action AUTHORIZE buttons of the row
var rejBtn;//overlay REJECT buttons corresponding to action REJECT buttons of the row
var pdfViewTag='<object id="object-pdf" standby="LOADING....." class="pdf-view hide" data="" type="application/pdf"></object>';
var dtTable;

var tblColumns = [{"mDataProp": null, sDefaultContent: "", "bSortable": false, "sClass": "sr-no all"},		               
	               {"mDataProp": "jobId", sDefaultContent: "", "aTargets": [  ], "sClass":"all job-id"},
	               {"mDataProp": "user.username", sDefaultContent: "", "sClass":"all user-name"},
	               {"mDataProp": "queueType", sDefaultContent: "", "sClass":"all hide-column queue-type"},
	               {"mDataProp": "jobName", sDefaultContent: "", "sClass":"all hide-column job-name"},
	               {"mDataProp": "sessionId", sDefaultContent: "", "sClass": "session-id"},
	               {"mDataProp": "nodes", sDefaultContent: "", "bSortable": false, "bSortable": false, "sClass": "nodes"},
	               {"mDataProp": "noOfTasks",sDefaultContent: "", "sClass": "no-of-tasks"},
	               {"mDataProp": "host.name",sDefaultContent: "", "sClass": "host-name"},
	               {"mDataProp": "type.name",sDefaultContent: "", "sClass": "type-name"},
	               {"mDataProp": "memory", sDefaultContent: "","sClass": "hide-column memory"},
	               {"mDataProp": "time", sDefaultContent: "", "bSortable": false, "sClass": "time"},
	               {"mDataProp": "status.name", sDefaultContent: "", "sClass": "job-status"},
	               {"mDataProp": "elapTime", sDefaultContent: "", "sClass": "elap-time"},
	               {"mDataProp": "insts", sDefaultContent: "", "sClass": "insts"},
	               {"mDataProp": "updts", sDefaultContent: "", "sClass": "updts"},
	               {"mDataProp": null, sDefaultContent: "", "sClass": "action"},
	               {"mDataProp": "host.id", sDefaultContent: "", "sClass": "hide-column host-id"}
	               ];
	

$(document).ready(function (e) {
	
	$(".open-overlay").click(function(){
		showPopup();
		$(".validation-message").addClass("hide");
	});
	$("#dashboardView").closest('li').addClass("active");
	
	$("#jobType").change(function(){
		if($(this).val() == 1){
			$("#up1").removeClass('hide');
			$("#up2").addClass('hide');
			$("#submit").removeClass('hide');
		}else if($(this).val() == 3){
			$("#up1").removeClass('hide');
			$("#up2").removeClass('hide');
			$("#submit").removeClass('hide');
		}else{
			$("#submit").addClass('hide');
			$("#up1").addClass('hide');
			$("#up2").addClass('hide');
		}
	});
	
	if(!jQuery.browser.mobile){
		//Scroll Buttons
		$(".scroll-right").on('click' ,function(){
			$(".dataTables_wrapper").animate({scrollLeft:'+=300px'});
		});
	
		$(".scroll-left").on('click' ,function(){
			$(".dataTables_wrapper").animate({scrollLeft:'-=300px'});
		});
	
		$( ".table-hover" ).mousemove(function( event ) {
			$(".scroll-right").animate({top:event.pageY - $( ".table-hover" ).offset().top + 30},{duration:50,queue:false});
			$(".scroll-left").animate({top:event.pageY - $( ".table-hover" ).offset().top + 30},{duration:50,queue:false});
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

	fileLisingDataTable();
	$(".loading").hide();

	$("#refreshTable").click(function(){
		fileLisingDataTable();
	});
	
	setInterval(function(){
		fileLisingDataTable();
	}, 1*60*1000);
	$("#search-fileLogs").click(function(){
		if(!isValidSearchCriteria()){
			return;
		}
		fileLisingDataTable();
	});	

	$(".close-popup-btn").click(function(){			
		hidePopup();
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
		
		var randomKey = Math.random();
		verifySession(fileIdForProcess, randomKey);

	});
	
	$('#btnFileContent').click(function(){

		var randomKey = Math.random();
		verifySession(fileIdForProcess, randomKey);
	});
	
	$('#fileTransmissionLogs').on("click",'.popupMarkerMob',function(fileName) {
		$(".container").removeClass("hide");
		$(".loading").show();
	});


	$('.btn-toggle').click(function() {
		$(this).find('.btn').toggleClass('active');  	    
		if ($(this).find('.btn-primary').size()>0) {
			$(this).find('.btn').toggleClass('btn-primary');
		}	    	    
		$(this).find('.btn').toggleClass('btn-default');

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
});



function fileLisingDataTable(){

	 dtTable = $('#jobList').dataTable({
		"bDestroy":true,
		"bAutoWidth": false,
		//"bServerSide": true,
		"sAjaxSource": "getJobs.htm",
		"bPaginate": true,
		"bLengthChange":true,
		"iDisplayLength" : 10,
		"bFilter":true,
		"aoColumns": tblColumns,
		
	
		"fnRowCallback" : function(nRow, aData, iDisplayIndex){
			
			var oSettings = dtTable.fnSettings();
			$("td:first", nRow).html(oSettings._iDisplayStart+iDisplayIndex +1);
			$("td:first", nRow).closest("tr").attr("id", aData.id);
			var buttonHtml = "<div>";
			var jobId = $("td:first", nRow).closest("tr").attr("id");
			var jobStatus = $(".job-status", nRow).html();
            if (aData.status!=null && aData.status.name.toLowerCase() == "completed") {
            	$(".job-status", nRow).html(aData.status.name);
            	buttonHtml +='<a href="getFile.htm?jobName='+$(".job-name", nRow).html()+'&jobId='+ $('.job-id', nRow).html() + '&status='+$(".job-status", nRow).html()+ '&hostType='+$(".host-id", nRow).html()+'"><button type="button" class="btn btn-primary info btn-action-margin-left" title="Download"><i class="fa fa-cloud-download"></i></button></a>' ;
            }if (aData.status!=null && aData.status.name.toLowerCase() == "cancelled"){
            	$(".job-status", nRow).html(aData.status.name);
            }
            if (aData.status!=null && aData.status.value.toLowerCase() == "q"){
                buttonHtml += "<a onclick=cancel('" + $('.job-id', nRow).html() + "','" + $(".host-id", nRow).html()+ "')><button type='button' class='btn btn-danger info btn-action-margin-left' title='Cancel'><i class='fa fa-ban'></i></button></a>";
            }
            buttonHtml += "</div>";
            $(".action", nRow).html(buttonHtml);
			return nRow;		
		},
		"fnServerParams": function ( aoData ) {
			blockUI();
			randomKey = Math.random();
 		},
		"fnServerData": function ( sSource, aoData, fnCallback ) {
			$.get( sSource, aoData, function (json) {
				unblockUI();
				var obj = JSON.parse(json);
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

	$("#fileTransmissionLogs").removeAttr("style");
	
}


function cancel(jobId, hostType){
	console.log(jobId)	
	$.ajax({
		url: 'cancelJob.htm',
		type: 'POST',
		data: {jobId : jobId , hostType : hostType},
		dataType: 'json',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
	    mimeType: 'application/json',
		error: function(xhr, textStatus, thrownError) {
			unblockUI();
		},
		success : function(data) {
			unblockUI();	
			showMessage(data.message,data.isError);
			fileLisingDataTable();
		}

	});
}

function showMessage(message,isError){
	if(isError){
		$('#message').addClass("error");
		$('#message').removeClass("success");
	}else{
		$('#message').addClass("success");
		$('#message').removeClass("error");
	}
	$('#message').removeClass("hide");
	setTimeout(function(){
		  $('#message').addClass("hide");
		}, 5000);
	
	$('#message').html(message);
}

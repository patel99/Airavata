var dtTable;
var randomKey = null;
var filenameRegex = /^([0-9a-zA-Z\^\&\'\@\{\}\[\]\,\$\=\!\-\#\(\)\.\%\+\~\_ ]{1,150})+$/;
var usernameRegex = /^[A-Za-z0-9]{1,100}$/;
$(document).ready(function(){
	
	$("#fileSummary").addClass("sidebar-selected");
	
	$(document).keyup(function(e) {
	    if (e.keyCode == 27) {
	    	$("#submit").show();
	    	$(".pdf-view").addClass("hide");
	    	if(!$('.container').hasClass("hide")){
				$('.container').addClass("hide");
			}
	    }
	});
	
	//Date range picker
    $('#reservation').daterangepicker();
    
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
	
	$('.container').click(function(){
		$('.container').addClass("hide");
		$(".pdf-view").hide();
		$(".loading").hide();
	});
	
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
		               {"mDataProp": "createdTimestamp", sDefaultContent: ""},
		               {"mDataProp": "updatedTimestamp", sDefaultContent: ""},
		               {"mDataProp": "scheduledProcessingDate", "sClass": "toggle-column", sDefaultContent: ""},
		               {"mDataProp": "holdTimestamp", "sClass": "toggle-column", sDefaultContent: ""},
		               {"mDataProp": "rejectTimestamp", "sClass": "toggle-column", sDefaultContent: ""},
		               {"mDataProp": "processingReadyTimestamp", "sClass": "toggle-column", sDefaultContent: ""},
		               {"mDataProp": "processingResponseTimestamp", "sClass": "toggle-column", sDefaultContent: ""},
		               {"mDataProp": "sino", sDefaultContent: ""},
		               {"mDataProp": "remark", sDefaultContent: ""}
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
		randomKey: randomKey},
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

setTimeout(refreshDataTable, (30 * 1000));

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
	status = $( "#statusList option:selected" ).val();
	transferMode = $( "#transferMode option:selected" ).val();
	randomKey = Math.random();
	 dtTable = $('#fileSummaryTable').dataTable({
		"bDestroy":true,
		"bAutoWidth": false,
		"bServerSide": true,
		"sAjaxSource": "getFileSummary.htm",
		"bPaginate": true,
		"bLengthChange":false,
		"iDisplayLength" : 10,
		"bFilter":false,
		"aoColumns": tblColumns,
		"aoColumnDefs":[{"aTargets": [ 2 ], 
			"mRender": function ( rate, type, full )  {
				return '<div id="'+rate+'" class="popupMarker">'+rate+'</div>';
			}
		}],
		"fnRowCallback" : function(nRow, aData, iDisplayIndex){
			var oSettings = dtTable.fnSettings();
			$("td:first", nRow).html(oSettings._iDisplayStart+iDisplayIndex +1);
			if(aData.user.isDirect == false){
				$("td:eq(4)", nRow).html("InDirect");
			}else if(aData.user.isDirect == true){
				$("td:eq(4)", nRow).html("Direct");
			}
			if($(".data-table-expand").hasClass("collapsed")){
				$('td:eq(9),td:eq(10),td:eq(11),td:eq(12),td:eq(13)', nRow).addClass("hide-column");
			}
			return nRow;
		},
		"fnServerParams": function ( aoData ) {
				
			if($('#object-pdf').hasClass('hide') || ($('#object-pdf').css("display") == "none")){
				blockUI();
			}else{
				showLoadingPage();
			}			
 		      aoData.push( {name:"userName", value : userName});
 		      aoData.push( {name:"corporateId", value: corporateId});
 		      aoData.push( {name:"startDate", value : startts});
		      aoData.push( {name:"endDate", value: endts});
		      aoData.push( {name:"fileName", value : fileName});
 		      aoData.push( {name:"status", value: status});
 		      aoData.push( {name:"transferMode", value : transferMode });
 		      aoData.push( {name:"randomKey", value:randomKey}); 		      
 		},
 		"fnServerData": function ( sSource, aoData, fnCallback ) {
			$.get( sSource, aoData, function (json) {
				if($('#object-pdf').hasClass('hide') || ($('#object-pdf').css("display") == "none")){
					unblockUI();
				} else {
					$(".loading").addClass("hide");
				}
				var obj = JSON.parse(json);
				if(obj.aaData.length < 1){
					$("#exportSummary").prop("disabled", true);
				}else{
					$("#exportSummary").prop("disabled", false);
				}
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

$("#searchFiles").click(function(){
	if(!isValidSearchCriteria()){
		return;
	}
	populateFileSummary();
});

$("#exportSummary").click(function(e){
	
	showLoadingPage();
	e.preventDefault();
	
	if($.trim(startts) != ""){
		$("#reservation").val(startts + "-" + endts);
	}else{
		$("#reservation").val("");
	}
	$('#userName').val(userName);
	
	if($.trim(corporateName) != ""){
		$( '#autoCompleteCorporates' ).val(corporateName);
	}else{
		$( '#autoCompleteCorporates' ).val("");
	}
	
	$('#fileName').val(fileName);
	$( "#statusList" ).val(status);
	$( "#transferMode" ).val(transferMode);
	randomKey = Math.random();
	window.location.href = contextPath + "/exportFileSummary.htm?userName="+userName+
	"&corporateId="+corporateId+"&startDate="+startts+"&endDate="+endts+"&fileName="+fileName+"&status="+status+"&transferMode="+transferMode+"&corporateName="+corporateName+"&randomKey="+randomKey;
	hideLoadingPage();
 });

	$('#fileSummaryTable').on("click",'.popupMarker',function(fileName) {
		$(".container").removeClass("hide");
		$(".loading").show();
		var srcFilename = fileName.currentTarget.innerHTML;
		randomKey = Math.random();
		verifySession(srcFilename,randomKey);
		
	});

});
randomKey = Math.random();

/*$.ajax({
	url: 'getStatus.htm',
	type: 'GET',
	data: {randomKey: randomKey},
	dataType: 'json',
	success : function(data) {
		
		for ( var i = 0; i < data.statusList.length; i++) {
			$("#statusList").append('<option value = "' + data.statusList[i].statusValue + '">'+data.statusList[i].status+'</option>');	
		}
	}

});*/

function showLoadingPage(){
	$(".container").removeClass("hide");
	$(".loading").removeClass("hide");
}

function hideLoadingPage(){
	$(".container").addClass("hide");
	$(".loading").addClass("hide");
}

function refreshDataTable(){
	dtTable.fnStandingRedraw();
	setTimeout(refreshDataTable, (30 * 1000));
}
function verifySession(srcFilename,randomKey){
	$.ajax({
		url: 'verifySession.htm',
		type: 'GET',
		data: 'data',
		dataType: 'json',
		error: function(xhr, textStatus, thrownError) {
			hideLoadingPage();
				if(xhr.status == 599){
					window.location.href = "login.htm?error=sessionExpired";
				} else if(xhr.status == 500){
					window.location.href = "system-error.htm";
				}
		},
		success : function(data) {
			$(".pdf-view").attr("data","getFileView.htm?randomKey="+randomKey+"&filename=" + srcFilename + "#view=Fit");
			$(".pdf-view").removeClass("hide");
			$(".pdf-view").css("display", "");
			$(".loading").hide();
		}
	});
}
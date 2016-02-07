var addTransactionRow;
var row = null;
var numberOfValidFields = 0;

// Validation Regex
//use for both debit and benificiary account
var accNoRegex = /^[0-9]{9,15}$/;
var ifscRegex =/^[a-zA-Z]{4}[0-9]{7}$/;
//used for bank name and benificiary name
var regex =/^[A-Za-z0-9,:?+( )\./-]{1,35}$/; 
var amountRegex = /^\d{1,11}?((.){0}$|(\.+\d{1,2})$)/;
var amountRegexRTGS = /^\d{6,11}?((.){0}$|(\.+\d{1,2})$)/;
var transactionRefNo=/^[A-Za-z0-9]{1,16}$/;
var regexRemitter = /^[A-Za-z0-9,:?+( )\./-]{1,35}$/;
var senderToReceiverInfo = /^[A-Za-z0-9,:?+( )\./-]{1,27}$/;
var isUpdate;
var updatedRowId;
var updatedRowIndex;
var transactionRow;


$(document).ready(function(){
	
	$("#transactionView").closest('li').addClass("active");
	$('header .sidebar-toggle').remove();
	
	// To Set Current Date in date field.
	Date.prototype.ddmmyyyy = function() {         
           
        var yyyy = this.getFullYear().toString();                                    
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
        var dd  = this.getDate().toString();             
                            
        return (dd[1]?dd:"0"+dd[0]) + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + yyyy;
	};

	// To Open Overlay
	$('.addTransaction').click(function(){
		
		$('.box-title').html("Add Transaction");
		$("#saveTransaction").show();
		$("#updateTransaction").hide();
		$('#debitAccNo').val("-1");
		clearTransactionDetail();
		showPopup(40);
		//openOverlay();
		
	});
	
	// To Close Overlay
	$(".tab-close, .overlay").click(function(){		
		hidePopup();
	});
	
	var tblColumns = [ {"mDataProp": "index", sDefaultContent: "", "bSortable": false},
	                   {"mDataProp": "transactionType", sDefaultContent: "", "sClass": "transaction-type"},
		               {"mDataProp": "debitAccountNumber", sDefaultContent: "", "sClass": "debit-acc-no"}, 
		               {"mDataProp": "beneficiaryAccountNumber", sDefaultContent: "", "sClass": "beneficiary-acc-no"},
		               {"mDataProp": "beneficiaryBankName", sDefaultContent: "", "sClass": "beneficiary-bank-name"},
		               {"mDataProp": "beneficiaryIFSCCode", sDefaultContent: "", "sClass": "beneficiary-ifsc-code"},
		               {"mDataProp": "beneficiaryName", sDefaultContent: "", "sClass": "beneficiary-name"},
		               {"mDataProp": "amount", sDefaultContent: "", "sClass": "transaction-amount"},
		               {"mDataProp": "transactionRefNo", sDefaultContent: "", "sClass": "transaction-ref-no"},
		               {"mDataProp": "remitterName", sDefaultContent: "", "sClass": "remitter"},
		               {"mDataProp": "senderToReceiverInfo", sDefaultContent: "", "sClass": "sender-to-receiver-info"},		               
		               {"mDataProp": "transactionDate", sDefaultContent: "", "sClass": "transaction-date"},
		               {"mDataProp": "action", sDefaultContent: "", "bSortable": false, "sClass": "btn-action"},
		               ];
	
	addTransactionRow = $('#transactionList').dataTable({
		"bDestroy":true,
		"bAutoWidth": false,
		"bServerSide": false,
		"bPaginate": false,
		"bLengthChange":false,
		"iDisplayLength" : 10,
		"bFilter":false,
		"cache": true,
		"aoColumns": tblColumns,
		"fnRowCallback" : function(nRow, aData, iDisplayIndex){
			
			var oSettings = addTransactionRow.fnSettings();
			var buttonHtml = '<div>';
			$("td:first", nRow).html(oSettings._iDisplayStart+iDisplayIndex +1);
			$("td:first", nRow).closest('tr').attr("id", "row_update_" + iDisplayIndex);
			$("td:first", nRow).closest('tr').attr("idx", iDisplayIndex);
			
			buttonHtml += '<button onclick="update('+$("td:first", nRow).closest('tr').attr("id")+')" class="btn btn-primary info btn-action-margin-left" title="Update"><i class="fa fa-pencil-square-o"></i></button>';
			buttonHtml += '<button onclick="deleteRow('+$("td:first", nRow).closest('tr').attr("id")+')" class="btn btn-primary btn-danger info btn-action-margin-left" title="Delete"><i class="fa fa-trash-o"></i></button>';
			buttonHtml += '</div>';
			
			$(".btn-action", nRow).html(buttonHtml);
			return nRow;
		}
	});
	
	// To get stores session data
	getTransactionCachedData();
	
	$('#saveTransaction').click(function(){
		
		var txnType = $('#txnType').val();
		var debitAccNo = $('#debitAccNo').val();
		var bnfcyAccNo = $('#bnfcyAccNo').val();
		var bnfcyBankName = $('#bnfcyBankName').val();
		var bnfcyIFSCCode = $('#bnfcyIFSCCode').val();
		var bnfcyName = $('#bnfcyName').val();
		var txnAmount = $('#txnAmount').val();
		txnAmount = parseFloat(txnAmount).toFixed(2);
		var txnTransactionRN = $('#txnTransactionRN').val();
		var txnRemitter = $('#txnRemitter').val();
		var txnSTRInfo = $('#txnSTRInfo').val();
		
		currentDate = new Date();
		$('#txnDate').val(currentDate.ddmmyyyy());
		
		var txnDate = $('#txnDate').val();
		
		numberOfValidFields = 0;
		$(".validation-field").trigger('keyup');
		if(numberOfValidFields != 10){			
			return;
		}
		
		transactionRow = {transactionType: txnType, debitAccountNumber: debitAccNo, beneficiaryAccountNumber: bnfcyAccNo, 
				beneficiaryBankName: bnfcyBankName, beneficiaryIFSCCode: bnfcyIFSCCode, beneficiaryName: bnfcyName, 
				amount: txnAmount, transactionRefNo:  txnTransactionRN, remitterName: txnRemitter, 
				senderToReceiverInfo: txnSTRInfo, transactionDate: txnDate};
		
		addTransactionRow._fnAddData(transactionRow);
		addTransactionRow._fnReDraw();

		$('#submitTransaction').show();
		
		if(addTransactionRow.fnSettings().fnRecordsTotal() == 10){
			$('.addTransaction').attr('disabled','disabled');
		}
		
		isUpdate = false;
		
		// To Store Data in session
		setTransactionCache();
		
		// To Close Overlay
		hidePopup();
		
		clearTransactionDetail();
	});
	
	$('#closeTransaction').click(function(){
		
		hidePopup();
	});
	
	$('#updateTransaction').click(function(){
		
		updatedRowId = row.attr('id');
		updatedRowIndex  = row.attr('idx');
		var txnType = $('#txnType').val();
		var debitAccNo = $('#debitAccNo').val();
		var bnfcyAccNo = $('#bnfcyAccNo').val();
		var bnfcyBankName = $('#bnfcyBankName').val();
		var bnfcyIFSCCode = $('#bnfcyIFSCCode').val();
		var bnfcyName = $('#bnfcyName').val();
		var txnAmount = $('#txnAmount').val();
		txnAmount = parseFloat(txnAmount).toFixed(2);
		var txnTransactionRN = $('#txnTransactionRN').val();
		var txnRemitter = $('#txnRemitter').val();
		var txnSTRInfo = $('#txnSTRInfo').val();
		
		currentDate = new Date();
		$('#txnDate').val(currentDate.ddmmyyyy());
		
		var txnDate = $('#txnDate').val();
		
		numberOfValidFields = 0;
		$(".validation-field").trigger('keyup');
		if(numberOfValidFields != 10){			
			return;
		}
		
		transactionRow = {transactionType: txnType, debitAccountNumber: debitAccNo, beneficiaryAccountNumber: bnfcyAccNo, 
				beneficiaryBankName: bnfcyBankName, beneficiaryIFSCCode: bnfcyIFSCCode, beneficiaryName: bnfcyName, 
				amount: txnAmount, transactionRefNo:  txnTransactionRN, remitterName: txnRemitter, 
				senderToReceiverInfo: txnSTRInfo, transactionDate: txnDate};
			
		addTransactionRow.fnUpdate(transactionRow , $('tr#'+updatedRowId));
		
		isUpdate = true;

		// To Store Data in session
		setTransactionCache();
		
		hidePopup();
		
		$("#page-alert").removeClass("hide");
		$("#page-alert").show();
		$("#page-alert").removeClass("alert-danger");
		$("#page-alert").addClass("alert-success");
		$(".page-message").html("Transaction updated successfully");
		$("#page-alert").fadeOut(7000);
	});
	
	$(".overlay-body .validation-field").bind('keyup', function(){
		
		vResult = true;
		var curUsedRegex = "";
		var currId = $(this).attr("id");
		$(".message").html("");
		
		if((currId == "debitAccNo") || (currId == "bnfcyAccNo")){
			curUsedRegex = accNoRegex;
		
		}else if((currId == "bnfcyBankName") || (currId == "bnfcyName")){
			curUsedRegex = regex;
		
		}else if(currId == "bnfcyIFSCCode"){
			curUsedRegex = ifscRegex;
		
		}else if(currId == "txnTransactionRN"){
			curUsedRegex = transactionRefNo;
		
		}else if(currId == "txnRemitter"){
			curUsedRegex = regexRemitter;
		
		}else if(currId == "txnSTRInfo"){
			curUsedRegex = senderToReceiverInfo;
		
		}else if(currId == "txnAmount"){
			if($('#txnType').val() == 'R41'){
				if(parseFloat($(this).val()).toFixed(2) > 200000){
					curUsedRegex = amountRegexRTGS;
				}else{
					curUsedRegex=/^[~]{50000000}$/
				}				
			}else{
				curUsedRegex = amountRegex;
			}		
		}
		
		if(currId == "txnType"){
			
			if($.trim($(this).val()) == '-1')
				vResult = false;
		
		}else if(!curUsedRegex.test($.trim($(this).val()))){
			
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
	
	$(".validation-field").change(function(){
		$(this).trigger("keyup");
	});
	
	$('#submitTransaction').click(function (){
		
		var transactionData = addTransactionRow.fnGetData();
		
		$.ajax({
			url: 'addTransaction.htm',
			type: 'POST',
			data: {transactionJsonObj : JSON.stringify(transactionData)},
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
				if (data.isError) {
					
					$('#alertMsg').html("Failed to add Trasaction.");
					$("#alertModal").modal();
					console.log("Transaction Successfull : " + data.isError);					
				}else {		
					
					$('#alertMsg').html("Trasaction has been successfully added.");
					$("#alertModal").modal();
					
					$('#submitTransaction').hide();
					addTransactionRow.fnClearTable();
					console.log("Transaction Error : " + data.message);
				}
			}

		});
	});
	
	$("#alertOkBtn").on("click", function(e) {
        $("#alertModal").modal('hide');     // dismiss the dialog
    });

    $("#alertModal").on("hide", function() {    // remove the event listeners when the dialog is dismissed
        $("#alertModal a.btn").off("click");
    });
    
    $("#alertModal").on("hidden", function() {  // remove the actual elements from the DOM when fully hidden
        $("#alertModal").remove();
    });
    
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
					$("#debitAccNo").append("<option value='"+accountList[i]+"'>"+accountList[i]+"</option>");
				} 
			}
	});
});

function clearTransactionDetail(){	
	$('#txnType').val('-1');
	txtElements = $('.overlay-body').find('input[type=text]:not(.remitter)');
	txtElements.next('span').hide();
	txtElements.removeClass("validation-success");
	txtElements.removeClass("validation-error");
	if(txtElements.attr('id') != 'txnRemitter'){
		txtElements.val('');
	}
	
	currentDate = new Date();
	$('#txnDate').val(currentDate.ddmmyyyy());
	
	$('#txnDate').val(currentDate.ddmmyyyy());
}

function update(rowId){

	row  = $(rowId);
	$('.box-title').html("Update Transaction");
	$("#saveTransaction").hide();
	$("#updateTransaction").show();
	    
	$("#txnType").val(row.find('.transaction-type').html());
	$("#debitAccNo").val(row.find('.debit-acc-no').text());
	
	$("#bnfcyAccNo").val(row.find('.beneficiary-acc-no').html());
	$("#bnfcyBankName").val(row.find('.beneficiary-bank-name').html());
	$("#bnfcyIFSCCode").val(row.find('.beneficiary-ifsc-code').html());
	$("#bnfcyName").val(row.find('.beneficiary-name').html());
	
	$('#txnTransactionRN').val(row.find('.transaction-ref-no').html());
	$('#txnRemitter').val(row.find('.remitter').html());
	$('#txnSTRInfo').val(row.find('.sender-to-receiver-info').html());
	
	$("#txnAmount").val(row.find('.transaction-amount').html());
	
	currentDate = new Date();
	$('#txnDate').val(currentDate.ddmmyyyy());
	 
	showPopup(40);
}

function setTransactionCache(){

//	var transactionData = addTransactionRow.fnGetData();
	
	$.ajax({
		url: 'setTransactionCache.htm',
		type: 'POST',
		data: {transactionObj : JSON.stringify(transactionRow),
			isUpdate: isUpdate,
			updatedRowId: updatedRowIndex},
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
			console.log("Transaction Store in session Successfuly..!");			
		}
	});
}

function getTransactionCachedData(){
	
	$.ajax({
		url: 'getTransactionCachedData.htm',
		type: 'POST',
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
			
			if(data.isError){
				console.log("Failed to fetch session data");
			}
			if(data.data == undefined || data.data == null){
				console.log("No data found in session");
			}else{
				$('#submitTransaction').show();
				for(var i=0; i<data.data.length; i++){
					
					addTransactionRow._fnAddData(data.data[i]);
				}
				addTransactionRow._fnReDraw();
			}
		}

	});
	
}

function deleteRow(currentRow) {
	
	var updateIndex  = $(currentRow).attr('idx');
	
	$.confirm({
		text: "Are you sure, you want to delete transaction?",
		confirm: function(button) {
						addTransactionRow.fnDeleteRow(currentRow);
						deleteTransactionFromCache(updateIndex);
		},
		cancel: function(button) {
			return false;
		}
	});
	
}

function deleteTransactionFromCache(id) {

	$.ajax({
		url: 'deleteTransaction.htm',
		type: 'POST',
		data: {deleteRowId: id},
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
			
			if(data.isError){
				console.log("Failed to delete transaction from session data");
				$('#alertMsg').html("Failed to delete transaction.");
				$("#alertModal").modal();
			}
			else{
				$('#alertMsg').html("Transaction deleted successfully");
				$("#alertModal").modal();
			}
		}

	});
}
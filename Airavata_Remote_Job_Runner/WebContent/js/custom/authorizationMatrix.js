var authTable;
var randomKey;
var corpNames = null;
var authMatrixCol;
var oldValue = "";
var groupList = null;
var tableData;
var header = null;
var modifiedData = null;
var orederingRegex=/^[1-9]/;
var maxAmountRegex=/^[0-9]/;
var regexForCorporateName = /^[A-Za-z0-9 ]{1,100}$/;
var sampleObject = [];
var corporate = "";
var authMatrixCol = [];
var authMatrixRow = [];
var isDataTableCreated = false;
var corpNames = new Array();
var corpIds = new Object();
var corpId = 0;
var isGroupListPresent = false;
var groupOrder = [];
var isAuthMatrixModified = false;
var originalData = null;
var originalGroupList = null;
var isMatrixSaved = false;
var resetMatrix = false;
var initialTotalAuthCriterias;
var isCorporate = false;
var branchNames = new Array();
var branchIds = new Object();
var branch = "";
var branchId = 0;
var regexForBranchName = /^[A-Za-z0-9 ]{1,100}$/;

$(document).ready(function (e) {
	
	$("#authorizationMatrix").closest('li').addClass("active");
	
	//Disable reorder, Save matrix and add range buttons till, matrix is drawn. 
	$("#reorder").attr("disabled","disabled");
	$("#updateMatrix").attr("disabled","disabled");
	$("#addRange").attr("disabled","disabled");
	$("#resetMatrix").attr("disabled","disabled");
	
	if (window.history && window.history.pushState) {

	    window.history.pushState('forward', "asdf");
	    $(window).on('popstate', function() {
	    	if(!$('.overlay-body').hasClass('hide')){
	    		hidePopup();		
	    	}
	    	window.history.pushState('forward', "asdf");
	    });
	  }
	
	// Capture the unload event.
	$( window ).unload(function() {
		  return "Handler for .unload() called.";
		});
		
	$(".right-side").removeClass('strech');

	//Get list of corporates.
	randomKey = Math.random();
	$.ajax({
		url: 'getCorporates.htm',
		type: 'GET',
		data: {isRequestFromAutocompleter : true,
			isActiveCorpRequired: true,
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
			
			$( '#corporateName' ).typeahead( { source:corpNames} );
		}
	});
	
	//handle to close side panel or alert box when escape is tapped
	$(document).keyup(function(e) {
		if (e.keyCode == 27) {
			if(!$('.container').hasClass("hide")){
				$('.container').addClass("hide");
			}
			if(!$('.records').hasClass("hide")){
				$('.records').addClass("hide");
			}
			if(!$(".overlay").hasClass('hide')){
				hidePopup();
			}
		}
	});

	//handle to close side panel when click on outside overlay
	$(".overlay").click(function(){
		hidePopup();
	});
	
	//handle to close side panel or alert box when escape is tapped
	$('.container').click(function(){
		$('.container').addClass("hide");
		$(".loading").hide();
	});

	//validate search criteria for corporate start
	function isValidSearchCriteria() {
        var isValid = true;
        var errorMessage = "";
        
        if(isCorporate) {
	        corporate = $.trim($("#corporateName").val());
	        corpId = corpIds[$.trim($("#corporateName").val())];
	        
	        //If corporate name is invalid, delete existing matrix and disable buttons to perform operation on matrix.
	        if (corporate == "" || corpId == undefined || !regexForCorporateName.test(corporate)) {
	            
	        	isValid = false;
	        	$("#organizationSearchError").text("*Please enter valid corporate name");
	        	$("#organizationSearchError").show();
	        	$("#reorder").attr("disabled","disabled");
	        	$("#updateMatrix").attr("disabled","disabled");
	        	$("#addRange").attr("disabled","disabled");
	        	$("#resetMatrix").attr("disabled","disabled");
	        	if(isDataTableCreated) {
	        		$('#authorizationMatrixTable').dataTable().fnDestroy();
	        		$("#authorizationMatrixTable thead").remove();
	        		$("#authorizationMatrixTable tbody").remove();
	        		isDataTableCreated = false;
	        	}
	        	$("#msgDiv").html("Authorization matrix is not configured");
	        	$("#msgDiv").removeClass("hide");
	        }
	        //Hide error message div.
	        else {
	        	$("#organizationSearchError").hide();
	        }
        }
        else {
        	
        	branch = $.trim($("#branchName").val());
	        branchId = branchIds[$.trim($("#branchName").val())];
	        
	        //If branch name is invalid, delete existing matrix and disable buttons to perform operation on matrix.
	        if (branch == "" || branchId == undefined || !regexForBranchName.test(branch)) {
	            
	        	isValid = false;
	        	$("#organizationSearchError").text("*Please enter valid branch name");
	        	$("#organizationSearchError").show();
	        	$("#reorder").attr("disabled","disabled");
	        	$("#updateMatrix").attr("disabled","disabled");
	        	$("#addRange").attr("disabled","disabled");
	        	$("#resetMatrix").attr("disabled","disabled");
	        	if(isDataTableCreated) {
	        		$('#authorizationMatrixTable').dataTable().fnDestroy();
	        		$("#authorizationMatrixTable thead").remove();
	        		$("#authorizationMatrixTable tbody").remove();
	        		isDataTableCreated = false;
	        	}
	        	$("#msgDiv").html("Authorization matrix is not configured");
	        	$("#msgDiv").removeClass("hide");
	        }
	        //Hide error message div.
	        else {
	        	$("#organizationSearchError").hide();
	        }
        }
        return isValid;
    }
	//validate search criteria end

	$(".loading").hide();

	// Search corporate 
	$(".btn-search").click(function(){
		
		//clearDisplayedMessages();
		
		// Check if table is edited..
		if($("#authorizationMatrixTable").find(".edit").length > 0 || groupOrder.length > 0 || isAuthMatrixModified) {
			//Confirm if current process should be continued, as matrix has been edited. 
			$.confirm({
		        text: "Changes have been made to the matrix. Continue without saving ?",
		        confirm: function(button) {
		        	
		        	//Clear any messages that are shown.
		        	clearDisplayedMessages();
		        	//Check if corporate name is valid.
		        	if(!isValidSearchCriteria()){
		    			return;
		    		}
		        	getAuthorizationMatrix();
		        	
		        },
		        cancel: function(button) {
		           return false;
		        }
		    });
			
		}
		else {
			clearDisplayedMessages()
			if(!isValidSearchCriteria()){
    			return;
    		}
			getAuthorizationMatrix();
		}
	});

	//Hide popup.
	$(".close-popup-btn").click(function(){			
		hidePopup();
	});
	
	// dismiss the dialog
	$("#alertOkBtn").on("click", function(e) {
        $("#alertModal").modal('hide');     
        $(".modal-backdrop").hide()
        $("body, html").css("overflow","auto");
    });

	// remove the event listeners when the dialog is dismissed
    $("#alertModal").on("hide", function() {    
        $("#alertModal a.btn").off("click");
    });
    
    //remove the actual elements from the DOM when fully hidden
    $("#alertModal").on("hidden", function() {  
        $("#alertModal").remove();
    });
    
   //strict only numbers to be entered in the max amount field while adding a amount range
	$('#maxAmount').on('input', function (event) { 
	    this.value = this.value.replace(/[^0-9]/g, '');
	});
	
	//Organize type.
	$('#organizationType').change(function(){
		
		$(".message").hide();
		usersIdsAddedToGroup = [];
		usersIdsRemovedFromGroup = [];
		switch($(this).val()){
		
		case "-1":
			$('.auto-complete-corporate').addClass('hide');
			$('.auto-complete-branch').addClass('hide');
			$('.btn-search-div').addClass('hide');
			isCorporate = false;
			break;
		
		//corporate	
		case "1":
			$('.auto-complete-corporate').removeClass('hide');
			$('.auto-complete-branch').addClass('hide');
			$('.btn-search-div').removeClass('hide');
			isCorporate = true;			
			break;
		
		//branch
		case "2":
			$('.auto-complete-corporate').addClass('hide');
			$('.auto-complete-branch').removeClass('hide');
			$('.btn-search-div').removeClass('hide');
			isCorporate = false;
			break;
		}
		
	});
	
	//Get list of branches.
	randomKey = Math.random();
	$.ajax({
		url: 'getBranches.htm',
		type: 'GET',
		data: {isRequestFromAutocompleter : true,
			isActiveBranchRequired: true,
			randomKey: randomKey},
		dataType: 'json',
		success : function(data) {
			
			if(!data.isError){
				for ( var i = 0; i < data.aaData.length; i++) {
					branchNames.push( data.aaData[i].name );
					branchIds[data.aaData[i].name] = data.aaData[i].id;
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
			
			$( '#branchName' ).typeahead( { source:branchNames} );
		}
	});
});

//SHow loading page
function showLoadingPage(){
	$(".container").removeClass("hide");
	$(".loading").removeClass("hide");

}

// Hide loading page.
function hideLoadingPage(){
	$(".container").addClass("hide");
	$(".loading").addClass("hide");
}

//Draw authorization matrix table.
function authMatrixDataTable(){
	
	authTable = $('#authorizationMatrixTable').dataTable({
        
		scrollX: "100%",
        paging: false,
        searching: false,
        ordering:  false,
        "bDestroy": true,
        autoWidth: false,
        "aaData": authMatrixCol,
        "aoColumns": authMatrixRow,
        "fnCreatedRow" : function(nRow){   
        	//Check if table is being redrwan immediately after matrix is updated.
        	//If no, keep displaying the changes made to the table(The sky blue background)
        	if(!resetMatrix) {
	        	if(!isMatrixSaved) {
		        	var groupId = $(nRow).attr("id").replace("group","").trim() - 1;
					$("td", nRow).each(function() {
						//For each column of the row check if its value is modified.
				    	if($(this).attr("class") != undefined) {
				    		var amountRangeId = $(this).attr("class").trim() - 1;
				    		var isUserCountChanged = modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias[amountRangeId].amountRange.authorizingGroups[groupId].isUserCountChanged;
				    		//If value is modified, add 'edit' class to it.
				    		if(isUserCountChanged) {
				    			$(this).addClass("edit");
				    		}
				    	}
				    });
	        	}
        	}
		}

	});
	
	isDataTableCreated = true;
	$("#msgDiv").addClass("hide");
	
	// Fixing group name column.
	new $.fn.dataTable.FixedColumns( authTable, {
        leftColumns: 1
    });

	//Editing amount range value..
	$('#authorizationMatrixTable').on( 'dblclick', 'tbody tr td:not(:first-child)', function (e) {

		var tds = $('#authorizationMatrixTable td');
		
		//Check if any other td is open for editing, close it.
		$(tds).each(function() {
			if($(this).children().hasClass("edit-val")) {
				$(this).html(oldValue);
			}
		});
		
		//If td is selected for editing.
		if($(this).find('.edit-val').length == 0){

			oldValue = $(this).html();
			$(this).html('');
			$(this).append('<input type="text" maxlength="2" class="edit-val" value="'  + oldValue + '"/>');
			$(this).append('<button id="saveEditedAuthorizerCount" type="button" class="btn btn-success btn-action-margin-left" title="Update"><i class="fa fa-check"></i></button>');
			$(".edit-val").focus();
		}else{
			$(this).html(oldValue);
		}
		
		// Save data on clicking save button.
		$("#authorizationMatrixTable #saveEditedAuthorizerCount").click(function() {
			if(oldValue != $(this).parent().find(".edit-val").val()) {
				
				$(this).parent().addClass("edit");
				var authCriteriaIndex = parseInt($(".edit-val").parent().attr("class").replace("edit","").trim()) - 1;
				var amountRangeIndex = $(".edit-val").parent().parent().attr("id").replace("group","").trim() - 1;
				
				//if user has entered a blank cell replace the value with 0
				if($.trim($(".edit-val").val()) == ""){
					$(".edit-val").parent().html(0);
				}
				
				count = modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias[authCriteriaIndex].amountRange.authorizingGroups[amountRangeIndex];
				count["userCount"] = parseInt($(".edit-val").val());
				count["isUserCountChanged"] = true;
				
				var groupIndex = null;
				var originalVal = null;
				
				//Check if new value is the same as the original value.
				if(groupOrder.length > 0) {
					
					groupIndex = groupOrder.indexOf((amountRangeIndex + 1).toString());
				}
				else {
					groupIndex = amountRangeIndex;
				}
				//Chcek if authorization criterias exist.
				if(initialTotalAuthCriterias > 0) {
					//If data modified is of existing amount range.
					if(originalData.matrixPayload.authorizationMatrix.authorizationCriterias[authCriteriaIndex] != undefined) {
						if(originalData.matrixPayload.authorizationMatrix.authorizationCriterias[authCriteriaIndex].amountRange.id != undefined) {
							originalVal = originalData.matrixPayload.authorizationMatrix.authorizationCriterias[authCriteriaIndex].amountRange.authorizingGroups[groupIndex].userCount;
						}
						else {
							originalVal = 0;
						}
					}
					//If data modified is of new amount range.
					else {
						originalVal = 0;
					}
				}
				//If no authorization criteria exists.
				else {
					originalVal = 0;
				}
				
				//If new value and original value are same, then remove the edit class(Sky blue background color is removed)
				if(originalVal == $(this).parent().find(".edit-val").val()) {
					$(this).parent().removeClass("edit");
				}
			}
			$(this).parent().html($(this).parent().find(".edit-val").val());
		});
		
		//Prevent click on text box.
		$('#authorizationMatrixTable .edit-val').click(function(e) {
			e.stopPropagation();
		});
		
		//strict only numbers to be entered in the (no. of authorizers required) field
		$('.edit-val').on('input', function (event) { 
		    this.value = this.value.replace(/[^0-9]/g, '');
		});
		
		//Save value on pressing enter
		$(".edit-val").on("keyup", function(e) {
			if(e.keyCode == 13) {
				if(oldValue != $(".edit-val").val()) {
					
					$(".edit-val").parent().addClass("edit");
					var authCriteriaIndex = parseInt($(".edit-val").parent().attr("class").replace("edit","").trim()) - 1;
					var amountRangeIndex = $(".edit-val").parent().parent().attr("id").replace("group","").trim() - 1;

					//if user has entered a blank cell replace the value with 0
					if($.trim($(".edit-val").val()) == ""){
						$(".edit-val").parent().html(0);
					}
					
					var currVal = parseInt($(".edit-val").val());
					count = modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias[authCriteriaIndex].amountRange.authorizingGroups[amountRangeIndex];
					count["userCount"] = parseInt($(".edit-val").val());
					count["isUserCountChanged"] = true;
					
					var groupIndex = null;
					var originalVal = null;
					
					//Check if new value is the same as the original value.
					if(groupOrder.length > 0) {
						
						groupIndex = groupOrder.indexOf((amountRangeIndex + 1).toString());
					}
					else {
						groupIndex = amountRangeIndex;
					}
					
					//Chcek if authorization criterias exist.
					if(initialTotalAuthCriterias > 0) {
						//If data modified is of existing amount range.
						if(originalData.matrixPayload.authorizationMatrix.authorizationCriterias[authCriteriaIndex] != undefined) {
							if(originalData.matrixPayload.authorizationMatrix.authorizationCriterias[authCriteriaIndex].amountRange.id != undefined) {
								originalVal = originalData.matrixPayload.authorizationMatrix.authorizationCriterias[authCriteriaIndex].amountRange.authorizingGroups[groupIndex].userCount;
							}
							else {
								originalVal = 0;
							}
						}
						//If data modified is of new amount range.
						else {
							originalVal = 0;
						}
					}
					//If no authorization criteria exists.
					else {
						originalVal = 0;
					}
					
					//If new value and original value are same, then remove the edit class(Sky blue background color is removed)
					if(originalVal == $(this).parent().find(".edit-val").val()) {
						$(this).parent().removeClass("edit");
					}
				}
				$(".edit-val").parent().html($(".edit-val").val());
			}
		});
		
	});
	
	//On single click, assign the old value to td and discard the newly edited value.
	$('#authorizationMatrixTable').on( 'click', 'tbody td:not(:first-child)', function (e) {
		 e.stopPropagation();
		if($(this).find('.edit-val').length != 0){
			$(this).html(oldValue);
		}
	});
	
}

//Reorder authorization matrix.
$("#reorder").click(function() {
	
	clearDisplayedMessages();
$("#saveOrderErrorMsg").hide();
	
	showPopup(60, "ReOrderGroupOverlayPanel");
	
	$("#groupReorderDiv").html("");
	
 	var html = '<div class="row row-content"> ' +
 			   '<div class="col-md-4 col-md-offset-1 reorder-header">Group Name</div> ' +
 			   '<div class="col-md-7 reorder-header">Order</div> ' +
 			   '</div>';
 	$("#groupReorderDiv").append(html);
	//Displaying the existing order.
	for(var i=0 ; i < originalGroupList.length ; i++) {
		groupName = originalGroupList[i].name;
		html = '<div class="row row-content">' +
			   '<div id="groupName'+(i+1)+'" class="col-md-4 col-md-offset-1 word-wrap">'+ groupName +
			   '<span class="mandatory-field">*</span>' +
			   '</div>' +
			   '<div class="col-md-7">' +
			   '<input type="tel" class="form-control validation-field num-width" id="groupOrder'+(i+1)+'" placeholder="" />' +
			   '<span class="validation-error-text">* Should be a number</span>'+
			   '</div>'+
			   '</div>';
		$("#groupReorderDiv").append(html);
		if(groupOrder.length > 0) {
			$("#groupOrder"+(i+1)).val(groupOrder[i]);
		}
		else {
			$("#groupOrder"+(i+1)).val(i+1);	
		}
	}
	
	//strict only numbers to be entered in the (no. of authorizers required) field
	$('[id^="groupOrder"]').on('input', function (event) { 
	    this.value = this.value.replace(/[^0-9]/g, '');
	});
	
	// Validations for ordering groups.
	
	$("[id^='groupOrder']").keyup(function(){
	
		var isDuplicate = false;
		var value = parseInt($.trim($(this).val()));
		
		$('[id^="groupOrder"]').each(function() {
			
			var $current = $(this);
			var currVal = $current.val().trim();
			
			$('[id^="groupOrder"]').each(function() {

				if (($(this).val() == currVal) && ($(this).attr('id') != $current.attr('id'))) {
					
					isDuplicate = true;
					return false;
				}
				else {
					isDuplicate = false;
				}
			});
			
			if(isDuplicate) {
				
				$(this).removeClass("validation-success");
				$(this).addClass("validation-error");
				$(this).nextAll('span:first').text("* Entry "+value+" already exists. Please enter different value.");
				//$(this).val("");
				$(this).parent().find(".validation-error-text").show();
			}
			else {
				$(this).parent().find(".validation-error-text").hide();
				$(this).addClass("validation-success");
				$(this).removeClass("validation-error");	
			}
		});
		
		if($("#groupReorderDiv").find(".validation-error").length > 0) {
			$("#saveOrder").attr("disabled","disabled");
		}
		else {
			$("#saveOrder").removeAttr("disabled");
		}
		
	});
});

//handler for closing the overlay. 
$(".tab-close, .overlay").click(function(){
	hidePopup();
});

// Save the new group order.
$("#saveOrder").click(function() {
	
	var isOrderChanged = false;
	var isInvalidValue = 0;
	
	$("[id^='groupOrder']").each(function() {
		
		$("#saveOrderErrorMsg").hide();
		
		currVal = parseInt($.trim($(this).val()));
		
		if(currVal > groupList.length) {
			
			$(this).removeClass("validation-success");
			$(this).addClass("validation-error");
			$(this).parent().find(".validation-error-text").text("* Entry should be greater than 1 and less than " + (groupList.length + 1));
			$(this).parent().find(".validation-error-text").show();
			isInvalidValue++;
		}
		else if(!orederingRegex.test(currVal)){
			
			$(this).removeClass("validation-success");
			$(this).addClass("validation-error");
			$(this).parent().find(".validation-error-text").text("* Entry should be a number greater than 0.")
			$(this).parent().find(".validation-error-text").show();
			isInvalidValue++;
		}
		else {
			
			$(this).parent().find(".validation-error-text").hide();
			$(this).addClass("validation-success");
			$(this).removeClass("validation-error");
		}
	});
	
	if(isInvalidValue == 0) {
		
		var orderList = $("[id^='groupOrder']");
		if(groupOrder.length < 1) {
		
			for (var i = 0; i < orderList.length; i++) {
			    if ($(orderList[i]).val() > $(orderList[i+1]).val()) {
			    	isOrderChanged = true;
			        break;
			    }
			}
		}
		else {
			for (var i = 0; i < orderList.length; i++) {
			    if ($(orderList[i]).val() != groupOrder[i]) {
			    	isOrderChanged = true;
			        break;
			    }
			}
		}
		
		//Check if the order is changed.
		if(!isOrderChanged) {
			$("#saveOrderErrorMsg").html("* No change made to the order.");
			$("#saveOrderErrorMsg").show();
			return false;
		}
		else {
			$("#saveOrderErrorMsg").hide();
		}
		
		//Sort the new order in ascending order..
		var sortedOrder = $("[id^='groupOrder']").sort(function (o1, o2) {
	        return parseInt($(o1).val()) - parseInt($(o2).val());
	    });
		
		groupOrder = [];
		
		//Save the new order.
		$("[id^='groupOrder']").each(function() {
			groupOrder.push($(this).val());
		});
		var groupLoc = 0;
		//Get the total number of amount ranges
		var numOfAmountRanges = modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias.length;
		//If amount range length is greater than 0. 
		if(numOfAmountRanges > 0 ) {
			//Modify the server data (authorization group order for each amount range). 
			for(var j = 0; j < numOfAmountRanges; j++) {
				//Get authorization group list.
				var currAuthGroupList = JSON.parse(JSON.stringify(modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias[j].amountRange.authorizingGroups));
				//Remove extsitng group list.
				modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias[j].amountRange.authorizingGroups = [];
				var newGroupList = [];
				for(var i=0; i< sortedOrder.length; i++) {
					
					var currentRow = sortedOrder[i];
					var currentId = parseInt($(currentRow).attr("id").split("groupOrder")[1]) - 1;
					
					//Fetch the group id for the group from original grouplist.
					var groupId = originalData.matrixPayload.groupList[currentId].id
					//Find the group with same groupId from currAuthGroupList, and add the group to the grouplist of the current amount range.
					for(var k =0 ; k< currAuthGroupList.length; k++) {
						if(groupId == currAuthGroupList[k].id) {
							modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias[j].amountRange.authorizingGroups.push(currAuthGroupList[k]);
							groupLoc = k;
						}
					}
					
					if(j == 0) {
						newGroupList.push(groupList[groupLoc]);
					}
				}
				if(j == 0) {
					modifiedData.matrixPayload.groupList = newGroupList;
				}
				delete currAuthGroupList;
			}
		}
		//If amount range length is 0.
		else {
			//Save group list according to the new order.
			var newGroupList = [];
			var currAuthGroupList = JSON.parse(JSON.stringify(modifiedData.matrixPayload.groupList));
			
			for(var i=0; i< sortedOrder.length; i++) {
				
				var currentRow = sortedOrder[i];
				var currentId = parseInt($(currentRow).attr("id").split("groupOrder")[1]) - 1;
				
				//Fetch the group id for the group from original grouplist.
				var groupId = originalData.matrixPayload.groupList[currentId].id
				//Find the group with same groupId from currAuthGroupList, and add the group to the grouplist of the current amount range.
				for(var k =0 ; k< currAuthGroupList.length; k++) {
					if(groupId == currAuthGroupList[k].id) {
						groupLoc = k;
					}
				}
				
				newGroupList.push(groupList[groupLoc]);
			}
			
			//Set the new group list.
			modifiedData.matrixPayload.groupList = newGroupList;
		}
		
		//Draw the authorization matrix table.
		createMatrixTable(modifiedData);
		isAuthMatrixModified = true;
		bindRemoveColumnEvent();
		hidePopup();
	}
});

//Adding a new amount range.
$("#addRangeToTable").click(function() {
	
	isAuthMatrixModified = true;
	
	$("#addAmountRangeDiv").modal('hide');
	
	//Fetch minimum and amximum values
	var min = parseInt($("#minAmount").val());
	var max = parseInt($("#maxAmount").val());
	
	//Add data for new column.
	var newAmountRange = {};
	var groups = JSON.parse(JSON.stringify(groupList));

	//Set min amount and max amount.
	newAmountRange["min"] = parseInt(min);
	newAmountRange["max"] = parseInt(max);
	
	//Set user count to 0.
	for(var i=0; i < groups.length; i++) {
		groups[i].userCount = 0;
	}
	
	newAmountRange["authorizingGroups"] = groups;
	newAuthMatrixCriteria = {};
	newAuthMatrixCriteria["amountRange"] = newAmountRange;
	
	//Add the new amount range to the server data.
	modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias.push(newAuthMatrixCriteria);
	
	//Draw the matrix trable.
	createMatrixTable(modifiedData);
	//Bind delete amount range function.
	bindRemoveColumnEvent();
	//Close the overlay
	hidePopup();
	
	if(isDataTableCreated) {
		showMessage(false, "Amount range added successfully");
		isAuthMatrixModified = true;
	}
	else {
		showMessage(true, "Failed to add Amount range");
		isAuthMatrixModified = false;
	}
	
	//Set new min value.
	$("#minAmount").val(max + 1);
	$("#maxAmount").val("");
	
});

//Remove amount range.
function removeAmountRange(btn) {
	
	clearDisplayedMessages();
	
	var colId = parseInt(btn.parent().attr("id").replace("amountRange","").trim());
	var currData = authTable.fnGetData();

	var deletedRange = modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias[colId].amountRange;
	var nextMin = deletedRange.min;
	
	//Editing server data.
	modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias.splice(colId,1);
	var numOfColumns = modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias.length;
	if(colId < numOfColumns) {
		modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias[colId].amountRange.min = nextMin;
	}
	createMatrixTable(modifiedData);
	
	var authMatrix = modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias;
	
	if(colId == (authMatrix.length)) {
		if(colId == 0) {
			$("#minAmount").val(1);
		}
		else {
			$("#minAmount").val(authMatrix[colId-1].amountRange.max + 1);	
		}
	}
	
	bindRemoveColumnEvent();
	
	if(isDataTableCreated) {
		showMessage(false, "Amount range deleted successfully");
		isAuthMatrixModified = true;
	}
	else {
		showMessage(true, "Failed to delete Amount range");
		isAuthMatrixModified = false;
	}
}

//Creating datatable.
function createMatrixTable(data) {
	
	var html = "";
	var isHeaderCreated = false;
	var authMatrix = data.matrixPayload.authorizationMatrix.authorizationCriterias;
	groupList = data.matrixPayload.groupList;
	 
	if(groupList.length > 0) {
		
		isGroupListPresent = true;
		
		//Check if auth matrix exists. If yes delete it.
		if(isDataTableCreated) {
			$('#authorizationMatrixTable').dataTable().fnClearTable();	
			$('#authorizationMatrixTable').dataTable().fnDestroy();
			$("#msgDiv").removeClass('hide');
			isDataTableCreated = false;
		}
		
		$("#authorizationMatrixTable thead").remove();
		
		authMatrixCol = [];
		authMatrixRow = [];
		
		html += "<thead><tr><th>Group v\\s Amount Range</th>";
		authMatrixRow.push({"mDataProp": 0, sDefaultContent: "", "bSortable": false});
		
		//Creating table rows.
		for(var i=0; i < groupList.length; i++) {
			
			item = {};
			item["DT_RowId"] = "group"+(i+1);
			item["DT_RowClass"] = "group-name";
			
			item[0] = groupList[i].name;
			
			if(authMatrix.length > 0) {
				for(var j=0; j < authMatrix.length; j++) {
					
					var amountRange = authMatrix[j].amountRange;
					if(!isHeaderCreated) {
						html += "<th id='amountRange"+j+"'><i class='fa fa-inr rupee-icon' data-placement='left'></i>"+amountRange.min+"-"+amountRange.max+
								'<i class="fa fa-times delete-col pull-right" data-placement="left" data-toggle="tooltip" data-original-title="Delete Amount Range"></i></th>';
						authMatrixRow.push({"mDataProp": j+1, sDefaultContent: "", "bSortable": false, "sClass": (j+1)});
					}
					item[j+1] = amountRange.authorizingGroups[i].userCount;
				}
			}

			isHeaderCreated = true;
			authMatrixCol.push(item);
		}
		html += "</tr></thead>";
		$("#authorizationMatrixTable").append(html);
		header = html;
		authMatrixDataTable();	
	}
	else {
		
		if(isDataTableCreated) {
			$('#authorizationMatrixTable').dataTable().fnClearTable();	
			$('#authorizationMatrixTable').dataTable().fnDestroy();
			$("#authorizationMatrixTable thead").remove();
			$("#msgDiv").removeClass('hide');
			isDataTableCreated = false;
		}
		
		isGroupListPresent = false;
		$("#msgDiv").html(data.message);
		$("#msgDiv").removeClass("hide");
		$("#reorder").attr("disabled","disabled");
		$("#updateMatrix").attr("disabled","disabled");
		$("#addRange").attr("disabled","disabled");
	}
}

// Biniding 'delete-col' class.
function bindRemoveColumnEvent() {
	$('.delete-col').click(function() {
		var btn = $(this);
		$.confirm({
	        text: "Delete this amount range ?",
	        confirm: function(button) {
	        	
	        	removeAmountRange(btn);
	        	
	        },
	        cancel: function(button) {
	           return false;
	        }
	    });
		
	});
}

//Validating max amount.
$("#maxAmount").keyup(function() {
	
	//Disable add range button if, max amount is greater than min amount.
	maxAmount = $("#maxAmount").val();
	if((maxAmount.match(maxAmountRegex)) && (parseInt(maxAmount) > parseInt($("#minAmount").val()))) {
		$("#addRangeToTable").removeAttr("disabled");
	}
	else {
		$("#addRangeToTable").attr("disabled","disabled");
	}
});

//Saving matrix.
$("#updateMatrix").click(function() {
	
	isMatrixSaved = true;
	//Check if -
	//1.Matrix data is modified
	//2.Existing amount range is deleted
	//3.New amount range is added.
	
	if(isAuthMatrixModified || $("#authorizationMatrixTable").find(".edit").length > 0) {
		
		var authMatrix = JSON.stringify(modifiedData.matrixPayload);
		if(isCorporate) {
			
			data = {organizationId : corpId,
					isCorporate : isCorporate,
					authMatrix : authMatrix,
					randomKey : randomKey}
		}
		else {
			data = {organizationId : branchId,
					isCorporate : isCorporate,
					authMatrix : authMatrix,
					randomKey : randomKey}
		}
		
		$.confirm({
	        text: "Are you sure you want to save the authorization matrix?",
	        confirm: function(button) {
	        	
	        	$.ajax({
	        		url: 'updateAuthorizationMatrix.htm',
	        		type: 'POST',
	        		data: data, 
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
	        	
	        			if(data.isError) {
	        				showMessage(true, data.message);
	        			}else{
	        				showMessage(false, data.message);
	        				createMatrixTable(modifiedData);
	        				bindRemoveColumnEvent();
	        				groupOrder = [];
	        				isMatrixSaved = false;
	        				isAuthMatrixModified = false;
	        				//Reset authorization matrix data.
	        				resetMatrixDataChanges();
	        			}
	        		}
	        	});	
	        },
	        cancel: function(button) {
	           return false;
	        }
	    });
	}
	else {
		showMessage(true,"No changes made to the matrix.");
		isMatrixSaved = false;
	}
});


function showMessage(isError, message){
	if(isError){
		$(".message").removeClass('success');
		$(".message").addClass('error');
		$(".message").show();
	}else{
		$(".message").removeClass('error');
		$(".message").addClass('success');		
		$(".message").show();
	}
	$(".message").text(message);
}


function clearDisplayedMessages(){
	$(".message").text("");
}

//Button to show the add range panel.
$("#addRange").click(function() {
	
	clearDisplayedMessages();
	
	$("#saveOrderErrorMsg").hide();
	
	//openOverlay($(this));
	$("#addRangeToTable").attr('disabled','disabled');
	$("#maxAmount").val("");
	$("#addAmountRangeDiv").removeClass('hide');
	$("#maxAmount").focus();
	
	showPopup(60, "amountRangeOverlayPanel");
});	

//Close the re-order panel.
$("#closeOrderPage").click(function() {
	
	hidePopup();
});	

//Fetch authorization matrix for a corporate.
function getAuthorizationMatrix()  {
	
	if(isCorporate) {
		
		data = {organizationId : corpId,
				isCorporate : isCorporate,
				randomKey : randomKey}
	}
	else {
		data = {organizationId : branchId,
				isCorporate : isCorporate,
				randomKey : randomKey}
	}
	
	blockUI();
	$.ajax({
		url: 'getAuthorizationMatrix.htm',
		type: 'GET',
		data: data,
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

			groupOrder = [];
			unblockUI();
			if(!data.isError) {
				
				originalData = data;
				initialTotalAuthCriterias = originalData.matrixPayload.authorizationMatrix.authorizationCriterias.length;
				originalGroupList = data.matrixPayload.groupList;
				
				modifiedData = JSON.parse(JSON.stringify(originalData));
				//Create authorization matrix.
				createMatrixTable(data);
				
				var authMatrix = data.matrixPayload.authorizationMatrix.authorizationCriterias;
				
				if(authMatrix.length > 0) {
					var newMinRange = authMatrix[authMatrix.length - 1].amountRange.max + 1;
					sampleObject = modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias[0].amountRange;
				}
				else {
					sampleObject = [];
					var newMinRange = 1;
				}
				$("#addAmountRangeDiv").removeClass("hide");
				$("#minAmount").val(newMinRange);
				$("#minAmount").attr("readOnly","readOnly");
				
				if(isGroupListPresent) {
					$("#reorder").removeAttr("disabled");
					$("#updateMatrix").removeAttr("disabled");
					$("#addRange").removeAttr("disabled");
					$("#resetMatrix").removeAttr("disabled");
				}
				
				bindRemoveColumnEvent();
			}
			else {
				
				if(isDataTableCreated) {
					$('#authorizationMatrixTable').dataTable().fnClearTable();	
					$('#authorizationMatrixTable').dataTable().fnDestroy();
					$("#authorizationMatrixTable thead").remove();
					$("#msgDiv").removeClass('hide');
					isDataTableCreated = false;
				}
				
				isGroupListPresent = false;
				showMessage(true, data.message);
				$("#reorder").attr("disabled","disabled");
				$("#updateMatrix").attr("disabled","disabled");
				$("#addRange").attr("disabled","disabled");
			}
		}
	});
}

//Reset the matrix to original data. 
$("#resetMatrix").click(function() {
	
	$.confirm({
        text: "Do you want to reset authorization matrix ?",
        confirm: function(button) {
        	
        	//Clear any messages that are shown.
        	clearDisplayedMessages();
        	resetMatrix = true;
        	//Reset matrix.
        	createMatrixTable(originalData);
        	bindRemoveColumnEvent();
        	
        	//If matrix is reset.
        	if(isDataTableCreated) {
        		//Reset modified data to original data.
        		modifiedData = JSON.parse(JSON.stringify(originalData));
        		//Clear group reorder list.
        		groupOrder = [];
        		showMessage(false, "Authorization matrix has been reset");
        		resetMatrix = false;
        		isAuthMatrixModified = false;
        		//reset min value of new amount range to be added.
        		if(initialTotalAuthCriterias > 0) {
        			resetMinVal = originalData.matrixPayload.authorizationMatrix.authorizationCriterias[initialTotalAuthCriterias - 1].amountRange.max + 1;
        		}
        		else {
        			resetMinVal = 1;
        		}
        		$("#minAmount").val(resetMinVal);
        	}
        	
        },
        cancel: function(button) {
           return false;
        }
    });
});

//Add amount range on pressing enter
$(".overlay-body,.overlay").keyup(function(e) {
	if(e.keyCode == 13) {
		if(!$("#addAmountRangeDiv").hasClass("hide") && $("#addRangeToTable").attr("disabled") == undefined && !$('#addRangeToTable').is(':focus')) {
			$("#addRangeToTable").trigger("click");
		}
	}
});

//Reset all the isUserCountChanged fields of authorizaing groups to false
//And assign the modified data to original data.
function resetMatrixDataChanges() {

	//Fetch authorization criterias.
	var authCriterias = modifiedData.matrixPayload.authorizationMatrix.authorizationCriterias;
	//Iterate over authorization criterias. 
	for(var currentCriteria = 0; currentCriteria < authCriterias.length; currentCriteria++) {
		//Fetch amount range.
		var amountRange =  authCriterias[currentCriteria].amountRange;
		//Fetch group list
		var groupList = amountRange.authorizingGroups;
		//Iterate over group list.
		for(var currentGroup = 0; currentGroup < groupList.length; currentGroup++) {
			// Set isUserCountChanged parameter to false.
			groupList[currentGroup].isUserCountChanged = false;
		}
	}
	//Assign modified data to original data.
	originalData = JSON.parse(JSON.stringify(modifiedData));
}
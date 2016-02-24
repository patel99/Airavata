
var branchIds = new Object();
var corpIds = new Object();
var corpSpecificBranchIDs = new Object();
var corpNames = new Array();
var branchNames = new Array();
var corpSpecificBranchNames = new Array();
var userRecords=[];
var applicationList = [];
var authTypeIdListWithoutNoAuth = [];
var userAppAuthTypeMap=[];
var presentUserAppAuthTypeMap="";
var displayTable=null;
var userApplication =[];
var presentUserApplication="";
var corporateInputterTypeId = "";
var corporateInputterAuthorizerTypeId="";
var corporateAuthorizerTypeId = "";
var bankBranchUserTypeId = "";
var viewerCorporateTypeId ="";
var bankBranchUserIdInitials = "yes";
var corpUserIdInitials = "corp";
var authTypeTag;
var OnScreenTxnEnabled=false;
var isValidationSuccess;
var isAllValidationSuccess=false;
var isAppAuthTypeMapCreated = false;
var presentUserInformation=new Object();
var invalidCorpUserIdMsg = "* Corporate user name must start with '"
	+ corpUserIdInitials
	+ "' and at least 5 characters long without any special character.";
var invalidBankBranchUserIdMsg = "* Branch user name must start with '"
	+ bankBranchUserIdInitials
	+ "' and at least 4 characters long without any special character.";
var invalidUserIdMsg = "* User name should be at least 4 characters long without any special character.";
var emailPattern = /^(?!\.)(?!.*\.{2})([a-zA-Z0-9_(\.)\-])+([a-zA-Z0-9])+\@((([a-zA-Z0-9\-])+\.){1}([a-zA-Z]{2,4})){1,2}$/;
var userIdRegex = /^[a-z0-9]{4,100}$/;
var userIdSearchRegex = /^[A-Za-z0-9]{1,100}$/;
var corpUserIdRegex = /^(corp)[A-Za-z0-9]{1,100}$/;
var bankBranchUserIdRegex = /^(yes)[A-Za-z0-9]{1,100}$/;
var nameRegex = /^[A-Za-z]{1,25}$/;
var mobileRegex = /^.{10}$/;

$(document).ready(function(){
	
	var tblColumns = [ {"mDataProp": null, sDefaultContent: "", "sClass": "all", "bSortable": false},
	                   {"mDataProp": "id", sDefaultContent: "", "sClass": "all hide-column user-pk-id", "aTargets": [  ]},
		               {"mDataProp": "userId", sDefaultContent: "", "sClass": "all user-id"},
		               {"mDataProp": "salutation", sDefaultContent: "", "sClass": "all user-salutation"},
		               {"mDataProp": "firstName", sDefaultContent: "", "sClass": "all user-first-name"},
		               {"mDataProp": "lastName", sDefaultContent: "", "sClass": "all user-last-name"},
		               {"mDataProp": "group.name", sDefaultContent: "", "sClass": "user-group-name"},
		               {"mDataProp": "bankingApplication.name", sDefaultContent: "", "sClass": "user-application-name", "bSortable": false},
		               {"mDataProp": "roles.roleName", sDefaultContent: "", "sClass": "all user-role-name"},
		               {"mDataProp": "corporate.name", sDefaultContent: "", "sClass": " user-corporate-name"}, 
		               {"mDataProp": "branch.name", sDefaultContent: "", "sClass": "user-branch-name"},
		               {"mDataProp": "onScreenTxnEnabled", sDefaultContent: "", "sClass": "is-on-screen-txn-enabled"},
		               {"mDataProp": "emailId", sDefaultContent: "", "sClass": "user-email-id"},
		               {"mDataProp": "mobileNumber", sDefaultContent: "", "sClass": " user-mobile-no"},
		               {"mDataProp": null, sDefaultContent: "", "bSortable": false, "sClass": "all btn-action"},
		            ];
	
	//restrict user to enter integer values to mobile number field 
	$('#mobile_number').on('input', function (event) { 
	    this.value = this.value.replace(/[^0-9]/g, '');
	});
	
	$("#userView").closest('li').addClass("active");
	$("#btn-bulk-upload").click(function(){
		hideMessagePopup();
	});
	//Show hide popup on esc button click.
	$(document).keyup(function(e) {
		if ($("#upload-file-div").hasClass("hide") && $(".overlay").css('display') == "block" && e.keyCode == 27) {
			$(".overlay-body").css("z-index","1109");
			$.confirm({
				text: "Exit without saving user details ?",
				confirm: function(button) {
					hidePopup();
					$(".overlay-body").css("z-index","1132");
					$(".modal").css("z-index","1040")
				},
				cancel: function(button) {
					$(".overlay-body").css("z-index","1132");
					$(".modal").css("z-index","1040")
					return false;
				}
			});
			$(".modal").css("z-index","1140");
		}
	});
	
	$(".overlay, .tab-close").click(function(){
		hidePopup();
	})
	
	populateUserDetails(); //fetch user details and display in table
	getAuthorizationTypes(); //Display authorization list
	getApplications();  //Display list of applications DD, cheque, e-pay
	getCorporates();  //get Corporate for user
	getBranches();  //Get corporate branches for user
	getUserRoles(); // get user Roles
	
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
	
	/*
	 * This function displays all user's information in a table
	 */
	function populateUserDetails(){

		var userName = $("#userName").val().trim();
		//displayTable is used to display all users 
		displayTable = $('#userList').dataTable({
			"bDestroy":true,
			"bAutoWidth": false,
			"bServerSide": true,
			"sAjaxSource": "getUserDetails.htm",
			"bPaginate": true,
			"bLengthChange":false,
			"iDisplayLength" : 10,
			"bFilter":false,
			"aoColumns": tblColumns,
			responsive: true,
			/*
			 * It is often useful to send extra data to the server when making an Ajax request - 
			 * for example custom filtering information, and this callback function makes it trivial 
			 * to send extra information to the server. The passed in parameter is the data set that 
			 * has been constructed by DataTables, and you can add to this or modify it as you require.
			 */
			"fnServerParams": function ( userData ) {
				blockUI();
				randomKey = Math.random();
				userData.push({name:"direction", value:"next"});
				if(userName != ""){
					userData.push({name:"userName", value:userName});
				}
				userData.push({name:"randomKey", value:randomKey});
			},
			/*
			 * This function allows you to 'post process' each row after it have been generated for 
			 * each table draw, but before it is rendered on screen. This function might be used for 
			 * setting the row class name etc.
			 */
			"fnRowCallback" : function(userInfoRow, userData, iDisplayIndex){
				userRecords[iDisplayIndex]=userData;
				var tableSettings = displayTable.fnSettings();
				var appName="";
				for(var i=0; i< userData.bankingApplicationList.length; i++) {
					appName = appName + userData.bankingApplicationList[i].name+" ";
					$(userInfoRow).find(".user-application-name").text(appName);
				}
				$("td:first", userInfoRow).html(tableSettings._iDisplayStart+iDisplayIndex+1);			
				var buttonHtml = '<div>';
				$("td:first", userInfoRow).closest('tr').attr("id", "row_update_" + iDisplayIndex);
			
				//generate butons based on user's suspendedStatus
				if(!(userData.status.id == suspendedStatusId)){
					buttonHtml += '<a onclick="update(userRecords['+iDisplayIndex+'] )"><button type="button" class="btn btn-primary info btn-action-margin-left" title="Update"><i class="fa fa-pencil-square-o"></i></button></a>';
					buttonHtml += '<a onclick="suspend(userRecords['+iDisplayIndex+'].id )"><button type="button" class="btn btn-danger info btn-action-margin-left" title="Suspend"><i class="fa fa-lock"></i></button></a>';
				} else if(userData.status.id == suspendedStatusId) {
					buttonHtml += '<a onclick="activate(userRecords['+iDisplayIndex+'].id)"><button type="button" class="btn btn-success info btn-action-margin-left" title="Activate"><i class="fa fa-unlock"></i></button></a>';
				}
				buttonHtml += '</div>';
				$(".btn-action", userInfoRow).html(buttonHtml);
				return userInfoRow;
			},
			/*
			 * "fnServerData" parameter allows you to override the default function which obtains the data from the server ($.getJSON) 
			 * so something more suitable for your application. For example you could use POST data.
			 */
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
					corporateInputterTypeId = obj.corporateUploaderTypeId;
					corporateAuthorizerTypeId = obj.corporateAuthorizerTypeId;
					corporateInputterAuthorizerTypeId = obj.superCorporateTypeId;
					suspendedStatusId = obj.suspendedStatusId;
					branchUserTypeId = obj.branchUserTypeId;
					bankBranchUserTypeId = obj.bankBranchUserTypeId;
					viewerCorporateTypeId=obj.viewerCorporateTypeId;
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

	//search user 
	$("#searchUser").click(function(){
		hideMessagePopup();
		if(!isValidSearchCriteria()){
			return;
		}
		populateUserDetails(); //fetch user details and display it in table
	});
	
	//trigger validation on keyup event
	$(".validation-field").keyup(function(){
		// validate following fields for the user:  first_Name, last_Name, mobile_Number, email_id and user_Name
		doValidation(this); 
	});
	
	$("#userList_paginate").click(function(){
		hideMessagePopup();
	});
	//This function resets required fields and change some properties if required and displays user registration form.
	$("#addUser").click(function(){
		hideMessagePopup();
		//clear all fields and reset to default values 
		$("#user_name").attr('readonly', false);
		$("#user_type").removeAttr("disabled","disabled");
		$('#user_type').prop('selectedIndex',0);
		if($("#application").hasClass("validation-error")){
			$("#application").removeClass("validation-error");
			$("#application").nextAll('span:first').hide();
		}
		
		// based on user_type option selected display additional fields or remove unnecessary fields if changed
		showHideCorporateBranchDetails();
		//clear previous validation if present
		clearValidation();
		if(!$("#user_name").hasClass("validation-error")){
			$("#user_name").addClass("validation-error");
			$("#user_name").nextAll('span:first').show();
		}
		//display add user from
		showPopup();
		//reset previous values in form
		$("#firstName").val("");
		$("#lastName").val("");
		$("#mobile_number").val("");
		$("#email_id").val("");
		$("#user_name").val("yes");
		$(".template-upload").remove();
		$("#add_user").show(); //Shows add user form 
		$(".message").removeClass("success");
		$(".message").removeClass("error");
		$(".message").html("");
		$("#update_user").hide();
		$("#autoCompleteCorporates").val("");
		$("#appAuthTypeMappingDiv").addClass("hide");
		$("#corporate_user_list").attr("style","display:none");
		$("#autoCompleteCorporateSpecificBranches").val("");
		$("#corporate_specific_branch_list").attr("style","display:none");
		$("#autoCompleteBranches").val("");
		$("#autoCompleteCorporateSpecificBranches").attr("readonly", "readonly");
	});
	
	//This function is triggered when user submits the user registration form.
	$("#add_user").click(function(){
		submitNewUser();
	});

	//update User form submission
	$("#update_user").click(function(){
		hideMessagePopup();
		
		isAllValidationSuccess=true;
		/* Triggers validation for user registration on change, click, keyup event*/
		$(".validation-field").trigger('keyup');
		$(".validation-typeahead").trigger("change");
		$(".validation-checkbox").trigger('click');
		if(!isAllValidationSuccess)
			return;
		
		var corpUserId = corpIds[$('#autoCompleteCorporates' ).val()];
		var branchUserId = branchIds[$('#autoCompleteBranches' ).val()];
		var corporateSpecificBranchId = corpSpecificBranchIDs[$('#autoCompleteCorporateSpecificBranches').val()];
		var isOnScreenTransactionFlagChanged = false;
		OnScreenTxnEnabled=false;
		switch( parseInt($("#user_type").val().trim())) {

			case corporateInputterTypeId :
				if(corpUserId != undefined){
					$('select[multiple="multiple"]').next('.btn-group').trigger('change');
					if(!isAllValidationSuccess){			
						return ;
					} else {
						CorpId = $("#autoCompleteCorporates").val();
						BranchId = $("#autoCompleteCorporateSpecificBranches").val();
						branchUserId = 0;
						userApplication = "";
						presentUserApplication="";
						OnScreenTxnEnabled=$.parseJSON($('#isOnScreenTxnEnabled').val());
						userAppAuthTypeMap = getUserAuthTypeMapping();
						if(OnScreenTxnEnabled != presentUserInformation.onScreenTxnEnabled){
							isOnScreenTransactionFlagChanged = true;
						}
					}
				}
				break;
				
			case corporateAuthorizerTypeId:
				if(corpUserId != undefined){
					if(!isAllValidationSuccess){			
						return ;
					} else {
						CorpId = $("#autoCompleteCorporates").val();
						BranchId = $("#autoCompleteCorporateSpecificBranches").val();
						branchUserId = corporateSpecificBranchId;
						getUserApplicationList(presentUserInformation.roles.id);
						OnScreenTxnEnabled = false;
						presentUserAppAuthTypeMap="";
						userAppAuthTypeMap = "";
					}
				}
				break;
				
			case  viewerCorporateTypeId :
				if(corpUserId != undefined){
					if(!isAllValidationSuccess){			
						return ;
					} else {
						CorpId = $("#autoCompleteCorporates").val();
						BranchId = 0;
						branchUserId = 0;
						userApplication = "";
						presentUserApplication="";
						presentUserAppAuthTypeMap="";
						userAppAuthTypeMap = "";
						OnScreenTxnEnabled = false;
						corporateSpecificBranchId = 0;
					}
				}
				break;
			case corporateInputterAuthorizerTypeId :
				if(corpUserId != undefined){
					$('select[multiple="multiple"]').next('.btn-group').trigger('change');
					if(!isAllValidationSuccess){			
						return ;
					} else {
						CorpId = $("#autoCompleteCorporates").val();
						BranchId = $("#autoCompleteCorporateSpecificBranches").val();
						branchUserId = corporateSpecificBranchId;
						getUserApplicationList(presentUserInformation.roles.id);
						OnScreenTxnEnabled=$.parseJSON($('#isOnScreenTxnEnabled').val());
						userAppAuthTypeMap = getUserAuthTypeMapping();
						if(OnScreenTxnEnabled != presentUserInformation.onScreenTxnEnabled){
							isOnScreenTransactionFlagChanged = true;
						}
					}
				}
				break;
				
			case branchUserTypeId:
				var selectedApplications=[];
				if(corpUserId == undefined && branchUserId != undefined){
					if(!isAllValidationSuccess){			
						return ;
					} else {
						OnScreenTxnEnabled = false;
						BranchId = $("#autoCompleteBranches").val();
						corpUserId = 0;
						corporateSpecificBranchId = 0;
						CorpId ="";
						presentUserAppAuthTypeMap="";
						userAppAuthTypeMap = "";
						getUserApplicationList(presentUserInformation.roles.id);
					}
				}
				break;
				
			default :
				return ;
				break;
		}
		
		if(corpUserId == undefined && branchUserId == undefined){
			return ;
		}
		if(!isInformationChanged(presentUserInformation)){
			showMessage(true, "No changes have been made");
			return;
		}else{
			blockUI(); //Temporary block UI to informuser that process is running		
			randomKey = Math.random();
			setTimeout(updateUser, 1000);
			//information is changed now update user			
			function updateUser(){
				$.ajax({
					url: 'updateUser.htm',
					type: 'POST',
					data: {	id : $.trim($("#user_id").val()),
							salutation : $("#salutation").val(),
							userId :presentUserInformation.userId,
					   		firstName : $("#firstName").val(),
					   		lastName : $("#lastName").val(),
						   	applicationId : userApplication,
						   	userRoleId : $("#user_type").val(),
						   	corporateId : corpUserId,
						   	corporateSpecificBranchId : corporateSpecificBranchId,
						   	branchId : branchUserId,
						   	emailId : $.trim($("#email_id").val()),
						   	mobileNumber : $("#mobile_number").val(),
						   	isOnScreenTxnEnabled : OnScreenTxnEnabled,
						   	appAuthTypeMap : userAppAuthTypeMap,
						   	isOnScreenTransactionFlagChanged : isOnScreenTransactionFlagChanged,
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
							displayTable.fnStandingRedraw(); // redraw the updated row
							showMessage(data.isError, data.message);
						}
						else{
							showMessage(data.isError, data.message);
						}				
					}
		
				});
			}
		}
		
	});
	
	$(".validation-typeahead").click(function(){
		isTypeaheadValid($(this)); //trigger validation for corporates, corporatespecificBranches, branches
	});
	
	$(".validation-typeahead").keyup(function(){
		isTypeaheadValid($(this)); //trigger validation for corporates, corporatespecificBranches, branches
	});
	
	$( '.validation-typeahead' ).on("change", function (e) {
		isTypeaheadValid($(this)); //trigger validation for corporates, corporatespecificBranches, branches
	});
	
	//validations user's applications i.e DD, cheque, e-pay 
	$(".validation-checkbox").click(function(){
		isValidationSuccess=true;
		if($("#applicationDiv").css("display")!="none"){
			if($(this).attr("id") == "application") {
				if($("#application input:checkbox:checked").length >0 ) {
					isValidationSuccess = true;
				}
				else {
					isValidationSuccess = false;
				}
			}
		}
		if(isValidationSuccess){
			$(this).nextAll('span:first').hide();
			$(this).addClass("validation-success");
			$(this).removeClass("validation-error");
			if(isAllValidationSuccess)
				isAllValidationSuccess=true;
		}else{
			$(this).nextAll('span:first').show();
			$(this).removeClass("validation-success");
			$(this).addClass("validation-error");
			isAllValidationSuccess=false;
		}
	});
	
});//Document ready ends here

/*Returns validation result  for following fields:  
 * firstName, lastName, email_id, user_name, mobile-number
 */
function doValidation(obj){
	isValidationSuccess=true;
	validationRequired = false;
	var curUsedRegex = "";
	$(".message").html("");
	selectedUserType = $('#user_type option:selected').val(); 
	
	//switch between the current field for validation
	switch($(obj).attr("id")){
		case 'user_name':
			validationRequired = true;
			if(selectedUserType == corporateInputterTypeId || selectedUserType == corporateAuthorizerTypeId 
					|| selectedUserType == corporateInputterAuthorizerTypeId || selectedUserType == viewerCorporateTypeId){
				
				curUsedRegex = corpUserIdRegex;
				$(obj).nextAll('span:first').text(invalidCorpUserIdMsg);
			}else{
				curUsedRegex = bankBranchUserIdRegex;
				$(obj).nextAll('span:first').text(invalidBankBranchUserIdMsg);
			}
			break;
			
		case 'email_id':
			validationRequired = true;
			curUsedRegex = emailPattern;
			break;
			
		case 'mobile_number' :
			validationRequired = true;
			curUsedRegex = mobileRegex;
			break;
	
		case 'firstName' :
			validationRequired = true;
			curUsedRegex = nameRegex;
			break;
			
		case 'lastName' :
			validationRequired = true;
			curUsedRegex = nameRegex;
			break;
	}
	
	//check if validation required or not  and if required perfrom validation
	if(validationRequired){
		if(!$.trim($(obj).val()).match(curUsedRegex) ){				
			isValidationSuccess=false;
		}
		if(isValidationSuccess){
			if(isAllValidationSuccess)
				isAllValidationSuccess=true;
			$(obj).nextAll('span:first').hide();
			$(obj).addClass("validation-success");
			$(obj).removeClass("validation-error");
		
		}else{
			isAllValidationSuccess=false;
			$(obj).nextAll('span:first').show();
			$(obj).removeClass("validation-success");
			$(obj).addClass("validation-error");
		}
	}
}


/* 
 * Function is used to validate corporates, corporate specific branches and branch names
 */
function isTypeaheadValid(obj){
	var currentMap;
	isValidationSuccess=true;
	var selectedUserType = $('#user_type option:selected').val();

	//if obj received is autocomplete branches but selected user_type is not a branch user then return
	if((selectedUserType==corporateInputterTypeId ||selectedUserType ==  corporateInputterAuthorizerTypeId 
			|| selectedUserType ==viewerCorporateTypeId || selectedUserType== corporateAuthorizerTypeId) && obj.attr("id") == "autoCompleteBranches" ){
		return;
	}
	
	//return if corporate viewer and object received is "autoCompleteBranches" or "autoCompleteCorporateSpecificBranches"
	if(( selectedUserType ==viewerCorporateTypeId) && ( obj.attr("id") == "autoCompleteBranches" || obj.attr("id") == "autoCompleteCorporateSpecificBranches")){
		return;
	}
	
	//do validation if submitted user_type is not branchUser and not a corporate viewer
	if((selectedUserType ==  corporateInputterTypeId || selectedUserType ==  corporateInputterAuthorizerTypeId 
			|| selectedUserType == corporateAuthorizerTypeId ||selectedUserType==viewerCorporateTypeId ) && obj.attr("id") != "autoCompleteBranches"){
	
		if(obj.attr("id") == "autoCompleteCorporates"){
			currentMap = corpIds;
			if(obj.val() == ""){
				/*Set corporate specific branch selection field property
				 *to disables untill valid corporate is provided and remove error-msg*/
				$("#autoCompleteCorporateSpecificBranches").val("");
				$("#autoCompleteCorporateSpecificBranches").removeClass("validation-success validation-error");
				$("#autoCompleteCorporateSpecificBranches").attr("readonly", "readonly");
				$("#autoCompleteCorporateSpecificBranches").nextAll('span:first').hide();
			}else{
				if(undefined != currentMap[obj.val()]){
					$("#autoCompleteCorporateSpecificBranches").removeAttr("readonly");
					if($.trim($("#autoCompleteCorporateSpecificBranches").val()) == ""){
						$("#autoCompleteCorporateSpecificBranches").nextAll('span:first').html("* Select valid branch.");
						$("#autoCompleteCorporateSpecificBranches").nextAll('span:first').show();
					}
				}
			}
			currentMap = corpIds;
			
		}else{ //for corporate specific branches
			if($("#autoCompleteCorporates").val() == "" || $("#autoCompleteCorporates").hasClass("validation-error") ){
				$("#autoCompleteCorporateSpecificBranches").nextAll('span:first').html("Select valid corporate first.");
			}else{
				obj.nextAll('span:first').html("* Select valid branch.");
			}
			currentMap = corpSpecificBranchIDs;		
		}
	} //validation for branchUser
	else if(obj.attr("id") == "autoCompleteBranches" && $("#autoCompleteBranches").val() != "") {
		
		currentMap = branchIds;
	}
	else{
			//This will work for corporate viewer
		if(selectedUserType ==  corporateInputterTypeId || selectedUserType ==  corporateInputterAuthorizerTypeId 
				|| selectedUserType == corporateAuthorizerTypeId){
			return;
		}
		if(obj.attr("id") != "autoCompleteBranches"){
			return;
		}
		currentMap = branchIds;
	}
	
	if(obj.val() == "")  {
			isValidationSuccess = false;
	} else if(undefined == currentMap[obj.val()]){
			isValidationSuccess = false;
	} 
		
	if(isValidationSuccess){
		obj.nextAll('span:first').hide();
		obj.addClass("validation-success");
		obj.removeClass("validation-error");
		if(isAllValidationSuccess)
			isAllValidationSuccess=true;
	}else{
		obj.nextAll('span:first').show();
		obj.removeClass("validation-success");
		obj.addClass("validation-error");
		isAllValidationSuccess=false;
	}
}

/*
 * Returns roles list- User_type 
 */
function getUserRoles(){
	randomKey = Math.random();
	$.ajax({
		url: 'getUserRoles.htm',
		type: 'GET',
		data: {randomKey: randomKey},
		dataType: 'json',
		success : function(data) {
			for ( var i = 0; i < data.userRoles.length; i++) {
				$("#user_type").append('<option value = "' + data.userRoles[i].id + '" >' + data.userRoles[i].roleName + '</option>');
			}
		}
	});
}
/*
 * Returns branch names for user.
 */
function getBranches(){
	randomKey = Math.random();
	$.ajax({
		url: 'getBranches.htm',
		type: 'GET',
		data: {isRequestFromAutocompleter : true,
			isActiveBranchRequired: true,
			randomKey: randomKey},
		dataType: 'json',
		success : function(getBranches) {
			
			if(!getBranches.isError){
				for ( var i = 0; i < getBranches.aaData.length; i++) {
					branchNames.push( getBranches.aaData[i].name );
					branchIds[getBranches.aaData[i].name] = getBranches.aaData[i].id;
				}
			}
			else{
				displayTable.fnStandingRedraw();
				showMessages(false, data.errorMessage);
			}
			$( '#autoCompleteBranches' ).typeahead( { source:branchNames });
		}
	}); 
}

/*
 * returns list of corporates for user creation
 */
function getCorporates(){
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
				displayTable.fnStandingRedraw();
				showMessages(false, data.errorMessage);
			}
			
			$( '#autoCompleteCorporates' ).typeahead( { source:corpNames} );
		}
	});
}

/*getApplications ajax call returns a list of applications DD, cheque, epay 
 */
function getApplications(){
	randomKey = Math.random();
	$.ajax({
		url: 'getApplications.htm',
		type: 'GET',
		data: {randomKey: randomKey},
		dataType: 'json',
		success : function(data) {	
			applicationList = data.applications;
			for ( var i = 0; i < data.applications.length; i++) {
				$("#application").append('<label class="checkbox-inline"><input type="checkbox" id = "' + data.applications[i].name + '" value = "' + data.applications[i].id + '">' + data.applications[i].name+'</label>');
			}
		}
	});
}
/*
 * Returns user's authorization type like interCorporate, intraCorporate or branch verification
 * for DD, cheque, epay.
 */
function getAuthorizationTypes(){
	
	randomKey = Math.random();
	$.ajax({
		url: 'getAuthorizationTypes.htm',
		type: 'GET',
		data: {randomKey: randomKey},
		dataType: 'json',
		success : function(data) {
			authorizationTypeList = data.authorizationTypes;
			authTypeTag = "<select class='auth-type-select' multiple='multiple'>";
			for ( var i = 0; i < data.authorizationTypes.length; i++) {
				authTypeTag += "<option value=" + data.authorizationTypes[i].id + ">" + data.authorizationTypes[i].name + "</option>"
				if(data.authorizationTypes[i].applicationConstant == "NO_AUTHORIZATION_REQUIRED"){
					noAuthRequiredId = data.authorizationTypes[i].id;
				}else{
					authTypeIdListWithoutNoAuth[i] = data.authorizationTypes[i].id;
				}
			}
			authTypeTag += "</select>";
		}
	});
	$(".close-popup-btn").click(function(){			
		hidePopup();
	});
}
/*
 * This function is used to modify user form based on user_type selected
 */
function showHideCorporateBranchDetails() {
	$("input[type=checkbox]").each(function() {
		$(this).removeAttr("checked");
	});
	
	switch(parseInt($("#user_type option:selected").val(),10)){
		
		case corporateInputterTypeId :
			createAppAuthTypeMapping();
			$("#appAuthTypeMappingDiv").removeClass("hide");
			$("#user_name").val(corpUserIdInitials);
			$("#user_name").nextAll("span:first").text(invalidCorpUserIdMsg);
			$("#user_name").nextAll("span:first").show();
			$("#corporate_user_list").css("display", "");
			$("#corporate_specific_branch_list").css("display", "");
			$("#branch_user_list").css("display", "none");
			$("#applicationDiv").css("display", "none");
			$("#onScreenTxnDiv").css("display", "");
			break;
			
		case corporateAuthorizerTypeId :
			$("#appAuthTypeMappingDiv").addClass("hide");
			$("#user_name").val(corpUserIdInitials);
			$("#user_name").nextAll("span:first").text(invalidCorpUserIdMsg);
			$("#user_name").nextAll("span:first").show();
			$("#corporate_user_list").css("display", "");
			$("#corporate_specific_branch_list").css("display", "");
			$("#branch_user_list").css("display", "none");
			$("#applicationDiv").css("display", "");
			$("#onScreenTxnDiv").css("display", "none");
			break;
			
		case corporateInputterAuthorizerTypeId :
			createAppAuthTypeMapping();
			$("#appAuthTypeMappingDiv").removeClass("hide");
			$("#user_name").val(corpUserIdInitials);
			$("#user_name").nextAll("span:first").text(invalidCorpUserIdMsg);
			$("#user_name").nextAll("span:first").show();
			$("#corporate_user_list").css("display", "");
			$("#corporate_specific_branch_list").css("display", "");
			$("#branch_user_list").css("display", "none");
			$("#applicationDiv").css("display", "");
			$("#onScreenTxnDiv").css("display", "");
			break;
			
		case bankBranchUserTypeId :
			$("#appAuthTypeMappingDiv").addClass("hide");
			$("#user_name").val(bankBranchUserIdInitials);
			$("#user_name").nextAll("span:first").text(invalidBankBranchUserIdMsg);
			$("#user_name").nextAll("span:first").show();
			$("#corporate_user_list").css("display", "none");
			$("#corporate_specific_branch_list").css("display", "none");
			$("#branch_user_list").css("display", "none");
			$("#applicationDiv").css("display", "none");
			$("#onScreenTxnDiv").css("display", "none");
			break;
			
		case viewerCorporateTypeId :
			$("#appAuthTypeMappingDiv").addClass("hide");
			$("#user_name").val("");
			$("#user_name").val(corpUserIdInitials);
			$("#user_name").nextAll("span:first").text(invalidCorpUserIdMsg);
			$("#user_name").nextAll("span:first").show();
			$("#corporate_user_list").css("display", "");
			$("#corporate_specific_branch_list").css("display","none");
			$("#branch_user_list").css("display", "none");
			$("#applicationDiv").css("display", "none");
			$("#autoCompleteCorporates").val("");
			$("#onScreenTxnDiv").css("display", "none");
			$("#autoCompleteBranches").val("none");
			break;
			
		default:
			$("#appAuthTypeMappingDiv").addClass("hide");
			$("#user_name").val("");
			$("#user_name").val(bankBranchUserIdInitials);
			$("#user_name").nextAll("span:first").text(invalidBankBranchUserIdMsg);
			$("#user_name").nextAll("span:first").show();
			$("#corporate_user_list").css("display", "none");
			$("#corporate_specific_branch_list").css("display","none");
			$("#branch_user_list").css("display", "");
			$("#applicationDiv").css("display", "");
			$("#autoCompleteCorporates").val("");
			$("#onScreenTxnDiv").css("display", "none");
			$("#autoCompleteBranches").val("");
			break;
	}
}

//clears validation if required 
function clearValidation() {
	$(".validation-field").each(function() {
		$(this).removeClass("validation-success");
		$(this).removeClass("validation-error");
		$(this).nextAll("span:first").hide();
	});
	$(".validation-typeahead").each(function() {
		$(this).removeClass("validation-success");
		$(this).removeClass("validation-error");
		$(this).nextAll("span:first").hide();
	});
	$("input[type=checkbox]").each(function() {
		$(this).removeAttr("checked");
		$(this).removeClass("validation-success");
		$(this).removeClass("validation-error");
	});
}
	
/*
 * This function displays corporate specific branches based on the corporate selected by user.
 */
function showCorporateSpecificBranchNames(){
	var corporateId = corpIds[$('#autoCompleteCorporates' ).val()];
	if(undefined == corporateId){
		return;
	}
	randomKey = Math.random();
	$.ajax({
		url: 'getCorporateSpecificBranches.htm',
		type: 'GET',
		data: {corporateId: corporateId,
			 	randomKey: randomKey},
		dataType: 'json',
		success : function(data) {
			
			if(!data.isError){
				corpSpecificBranchNames.length = 0;
				corpSpecificBranchIDs= {};
				for ( var i = 0; i < data.aaData.length; i++) {
					corpSpecificBranchNames.push( data.aaData[i].name );
					corpSpecificBranchIDs[data.aaData[i].name] = data.aaData[i].id;
				}
			}
			else{
				displayTable.fnStandingRedraw();
				showMessages(false, data.errorMessage);
				/*$("#page-alert").removeClass("hide");
				$("#page-alert").show();
				$("#page-alert").addClass("alert-danger");
			    $("#page-alert").removeClass("alert-success");
			    $(".page-message").html(data.errorMessage);*/
			}
			
			$( '#autoCompleteCorporateSpecificBranches' ).typeahead( { source:corpSpecificBranchNames} );
		}
	});
}

/*
 * Provides user the list of application authentication for cheque, DD and epay.
 * returns options inter corporates, intra Corporates, branch verification or no authorization required 
 */
function createAppAuthTypeMapping(){
	//if mapping is not created previosuly create application authentication mappping 
	if(!isAppAuthTypeMapCreated){
		mappingStr = '';		
		$('#appAuthTypeMapping').empty();
		mappingStr += "<div class='row row-content'>"+
		"<div class='app-auth-type-map-header col-md-10 col-md-offset-1'>Application Authorization Type Mapping</div></div>";
		for(var i=0; i<applicationList.length; i++){			
			mappingStr += "<div class='row row-content'>"+
								"<div class='col-md-2 col-md-offset-1'>" + applicationList[i].name + "</div>"+
								"<div class='col-md-8' id = '" + applicationList[i].id + "'>"
									+ authTypeTag +
								
								"</div>"+
							"</div>";
		}
		$('#appAuthTypeMapping').append(mappingStr);
		$('select[multiple="multiple"]').multiselect({
			numberDisplayed: 6,
			buttonWidth: '250px',
		});
	}else{
		isAppAuthTypeMapCreated = true;
	}
	
	//perform validation for application authentications
	$("<span class='validation-error-text'>* select at least one authorization type </span> ").insertAfter($('select[multiple="multiple"]').next('div').find('button[type="button"]'));
	
	$('select[multiple="multiple"]').next('.btn-group').change(function(){
		if(null!= $(this).prev('select[multiple="multiple"]').val() && $(this).prev('select[multiple="multiple"]').val().length > 0){
			$(this).find('.validation-error-text').hide();
			if(isAllValidationSuccess)
				isAllValidationSuccess=true;
		}else{
			$(this).find('.validation-error-text').show();
			isAllValidationSuccess=false;
		}
	});
	
	// based on noAuthRequiredId value selection clear other values for authorization
	$('.auth-type-select').next().find('.multiselect-container input[type="checkbox"]').change(function() {
		if($(this).val() == noAuthRequiredId){
			$(this).closest('div').prev('select[multiple="multiple"]').multiselect('deselect', authTypeIdListWithoutNoAuth)
		}else{
			$(this).closest('div').prev('select[multiple="multiple"]').multiselect('deselect', noAuthRequiredId);
		}
    });
}

//Returns user Authentication type mapping for user updation
function getUserAuthTypeMapping(){
	userAppAuthTypeMap = [];
	for(var i=0; i<applicationList.length;i++){
		var map = {};
		map.appId = applicationList[i].id;
		map.authTypeIds = $('#appAuthTypeMapping #' + applicationList[i].id + ' select[multiple="multiple"]').val();
		userAppAuthTypeMap[i] = map;
 	}
	userAppAuthTypeMap = JSON.stringify(userAppAuthTypeMap);	
	return userAppAuthTypeMap;
}

//triggers validation and calls addUser fuction to submit data to server 
function submitNewUser(){
	
	isAllValidationSuccess=true;
	/* Triggers validation for user registration on change, click, keyup event*/
	$(".validation-field").trigger('keyup');
	$(".validation-typeahead").trigger("change");
	$(".validation-checkbox").trigger('click');
	
	var corpUserId = corpIds[$('#autoCompleteCorporates' ).val()];
	var branchUserId = branchIds[$('#autoCompleteBranches' ).val()];
	var corporateSpecificBranchId = corpSpecificBranchIDs[$('#autoCompleteCorporateSpecificBranches').val()];
	var submittedUserType = parseInt($("#user_type").val().trim());
	
	//if both undefined return
	if(corpUserId == undefined && branchUserId == undefined){
		return;
	}

	switch (submittedUserType) {
		case corporateInputterTypeId:
			$('select[multiple="multiple"]').next('.btn-group').trigger('change');
			if(!isAllValidationSuccess){			
				return;
			} else {
				userApplication = [];
				getUserApplicationList(corporateInputterTypeId);
				userApplication ="";
				branchUserId = 0;
				userAppAuthTypeMap = getUserAuthTypeMapping();
			}
			break;
			
		case corporateAuthorizerTypeId:
						
			if(!isAllValidationSuccess){			
				return;
			} else {
				userApplication = [];
				getUserApplicationList(corporateAuthorizerTypeId);
				branchUserId = 0;
				userAppAuthTypeMap = "";
			}
			break;
			
		case corporateInputterAuthorizerTypeId:
			$('select[multiple="multiple"]').next('.btn-group').trigger('change');
			if(!isAllValidationSuccess){			
				return;
			} else {
				userApplication = [];
				getUserApplicationList(corporateInputterAuthorizerTypeId);
				branchUserId = 0;
				userAppAuthTypeMap = getUserAuthTypeMapping();
			}
			break;
			
		case branchUserTypeId:
			if(!isAllValidationSuccess){			
				return;
			} else {
				userApplication = [];
				getUserApplicationList(branchUserTypeId);
				corpUserId = 0;
				corporateSpecificBranchId = 0;
				userAppAuthTypeMap = "";
			}
			break;
			
		case viewerCorporateTypeId:
			if(!isAllValidationSuccess){			
				return;
			} else {
				userApplication = [];
				getUserApplicationList(viewerCorporateTypeId);
				userApplication ="";
				branchUserId = 0;
				corporateSpecificBranchId = 0;
				userAppAuthTypeMap = "";
			}
			break;
	
		default:return;
		//break;
	}
	
	blockUI();		// disable UI till repsnse from the server is not received.
	randomKey = Math.random();
	
	if(isAllValidationSuccess){
		//validation Successfull; now add new user 
		setTimeout(addNewUser, 1000, userApplication, userAppAuthTypeMap,randomKey, corporateSpecificBranchId, corpUserId, branchUserId); 
	}else{
		return;
	}
}

//This function submits user details to the serven and returns response.
function addNewUser(userApplication, userAppAuthTypeMap,randomKey, corporateSpecificBranchId, corpUserId, branchUserId){
	$.ajax({
		url: 'addUser.htm',
		type: 'POST',
		data: {userId : $.trim($("#user_name").val().toLowerCase()),
			   	salutation : $("#salutation").val(),
			   	firstName : $("#firstName").val(),
			   	lastName : $("#lastName").val(),
			   	applicationId : userApplication,
				userRoleId : $("#user_type").val(),
				corporateId : corpUserId,
				corporateSpecificBranchId : corporateSpecificBranchId,
				branchId : branchUserId,
				emailId : $.trim($("#email_id").val()),
				mobileNumber : $("#mobile_number").val().trim(),
				isOnScreenTxnEnabled : $('#isOnScreenTxnEnabled').val(),
				appAuthTypeMap : userAppAuthTypeMap,
				randomKey: randomKey
		},
		dataType: 'json',
		contentType: 'application/x-www-form-urlencoded; charset=utf-8',
	    mimeType: 'application/json',
		error: function(xhr, textStatus, thrownError) {
			unblockUI(); //To enable scren after response from the server is received.
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			}
		},
		success : function(data) {
				unblockUI();
				showMessage(data.isError, data.message);			
		}
	});
}

//Show update user form
function update(userData){
	hideMessagePopup();
	presentUserInformation=userData;
	$("#add_user").hide();
	$("#user_type").attr("disabled","disabled");
	$("#user_name").attr('readonly', true);
	$(".message").html("");
	$("#update_user").show();
	$("#user_id").val(userData.id);
	$("#user_name").val(userData.userId);
	$("#firstName").val(userData.firstName);
	$("#lastName").val(userData.lastName);
	
	$("#user_type > option").each(function () {
	        if ($(this).html().toLowerCase() == userData.roles.roleName.toLowerCase()) {
	            $(this).attr("selected", "selected");      
	        }
	    });
	
	$("#salutation > option").each(function () {
        if ($(this).val().toLowerCase() == userData.salutation.toLowerCase()) {
            $(this).attr("selected", "selected");      
        }
    });
	
	$("#email_id").val(userData.emailId);
	$("#mobile_number").val(userData.mobileNumber);
	
	if($("#application").hasClass("validation-error")){
		$("#application").removeClass("validation-error");
		$("#application").nextAll('span:first').hide();
	}
	showPopup();
	clearValidation();
	switch (userData.roles.id){
	
		case corporateInputterTypeId :
			$('#applicationDiv').css("display", "none");
			fetchExistingUserAuthTypeMapping(userData.id);
			fetchFormDetails(userData);
			break;
			
		case corporateInputterAuthorizerTypeId :
			fetchExistingUserAuthTypeMapping(userData.id);
			fetchFormDetails(userData);
			$("#applicationDiv").css("display","");
			break;
			
		case corporateAuthorizerTypeId :
			fetchFormDetails(userData);
			$("#applicationDiv").css("display","");
			break;
			
		case viewerCorporateTypeId :
			fetchFormDetails(userData);
			break;
			
		case branchUserTypeId :
			fetchFormDetails(userData);
			break;
	}
	showCorporateSpecificBranchNames();
}

/*
 * fetch user's additional form details based on user_type selected.
 */
function fetchFormDetails(userData){
	
	// for corporate viewer and branch user
	if(userData.roles.id== viewerCorporateTypeId || userData.roles.id== branchUserTypeId ){

		$('#appAuthTypeMappingDiv').addClass("hide");
		$('#corporate_user_list').css("display", "");
		$('#corporate_specific_branch_list').css("display","none");
		$('#onScreenTxnDiv').css('display', 'none');
		$('#applicationDiv').css("display", "");
		
		if(userData.roles.id == viewerCorporateTypeId){
			$('#branch_user_list').css("display", "none");
			$('#applicationDiv').css("display", "none");
			$('#autoCompleteCorporates').val(userData.corporate.name);
			$('#autoCompleteBranches').val("");
		}else{
			$("#corporate_user_list").css("display", "none");
			$('#branch_user_list').css("display", "");
			$('#autoCompleteBranches').val(userData.branch.name);
			$('#autoCompleteCorporates').val("");
		}
		
	}else{ //for corporateInputterAuthorizer, corporate inputter, corporate authorizer 
		$('#corporate_user_list').css("display", "");
		$('#corporate_specific_branch_list').css("display","");
		$('#branch_user_list').css("display", "none");	
		
		$('#autoCompleteCorporateSpecificBranches').css("display","");
		$('#autoCompleteCorporates').val(userData.corporate.name);
		$('#autoCompleteCorporateSpecificBranches').val(userData.branch.name);
		$('#autoCompleteBranches').val("");

		if(userData.roles.id == corporateAuthorizerTypeId)
			$('#appAuthTypeMappingDiv').addClass('hide');
		
		if(userData.roles.id != corporateAuthorizerTypeId){
			$('#appAuthTypeMappingDiv').removeClass('hide');
			$('#onScreenTxnDiv').css('display', '');
			$('#isOnScreenTxnEnabled').val(userData.onScreenTxnEnabled.toString());
		}
		if(userData.roles.id == corporateInputterAuthorizerTypeId){
			$("#applicationDiv").css("display", "");
		}
	}
	
	if(userData.roles.id != viewerCorporateTypeId && userData.roles.id !=corporateInputterTypeId){
		
		var selectedApplications = [];
		var i=0;
		$("#application input:checkbox").each(function () {
			if(userData.bankingApplicationList[i]!=undefined && $.trim(userData.bankingApplicationList[i].name)!=""){
				if($.trim(userData.bankingApplicationList[i].name).toLowerCase() == ($.trim($(this).attr('id').toLowerCase())) ){
					$(this).prop("checked",true);
					selectedApplications[i]=$(this).val();
					i++;
			   }
			}
		 });
		presentUserApplication = JSON.stringify(selectedApplications);
	}
	
}

/*fetch and dsiplay Current user's application authentication mapping 
  application authentication mapping is for corporateInputterAuthorizer, corporateInputter
*/
function fetchExistingUserAuthTypeMapping(userId){
	createAppAuthTypeMapping();
	randomKey = Math.random();
	$.ajax({
		url: 'getUserAuthTypeMapping.htm',
		type: 'GET',
		data: {randomKey: randomKey,
			userId: userId},
		dataType: 'json',
		success : function(data) {
			if(!data.isError){
				if(Object.keys(data.appAuthTypeMap).length > 1){
	            	$('select[multiple="multiple"]').multiselect('deselectAll', false);
	            	$('select[multiple="multiple"]').multiselect('select', []);
					for (var key in data.appAuthTypeMap) {
			            if (data.appAuthTypeMap.hasOwnProperty(key)) {					            	
			            	$('#appAuthTypeMapping #' + key +' select[multiple="multiple"]').multiselect('select', data.appAuthTypeMap[key]);
			            }
			        }
				
				}else{
					$('select[multiple="multiple"]').multiselect('deselectAll', false);
					$('select[multiple="multiple"]').multiselect('select', []);
				}
				presentUserAppAuthTypeMap = getUserAuthTypeMapping();
			}
		}
	});
}

//check infromation changed or not before form submission for upating user
function isInformationChanged(presentUserInformation){
	
	if(presentUserInformation.userId != $("#user_name").val() || presentUserInformation.salutation != $("#salutation").val()
			|| presentUserInformation.firstName != $("#firstName").val() || presentUserInformation.lastName != $("#lastName").val()
			|| presentUserInformation.roles.id != parseInt($('#user_type').val()) || presentUserInformation.onScreenTxnEnabled !=OnScreenTxnEnabled
			||presentUserInformation.mobileNumber != $("#mobile_number").val() || presentUserAppAuthTypeMap != userAppAuthTypeMap 
			||presentUserApplication != userApplication || presentUserInformation.emailId != $("#email_id").val()){
		return true;
	}else{
		return false;
	}
}
 
/*get user application list to check whether information is changed or not 
for coroptateInputterAuthorizer and corporateAuthorizer */
function getUserApplicationList(roleId){
	var selectedApplications= [];
	if(roleId == corporateInputterAuthorizerTypeId || roleId == corporateAuthorizerTypeId || roleId == branchUserTypeId){
		$("#application input:checkbox:checked").each(function(i)
		{
			selectedApplications[i]=$(this).val();
		})
		userApplication = JSON.stringify(selectedApplications);
	}
}

//Suspend user 
function suspend(id){
	var userId = id;
	$.confirm({
        text: "Are you sure, you want to suspend this user?",
        confirm: function(button) {
        	blockUI();
        	randomKey = Math.random();
        	$.ajax({
				url: 'suspendUser.htm',
				type: 'POST',
				data: {userId : userId,
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
					blockUI();
					showMessage(data.isError, data.message);
					unblockUI();
				}
			});
        },
        cancel: function(button) {
           return false;
        }
    });
}

//activate user 
function activate(id){
	var userId = id;
	$.confirm({
        text: "Are you sure, you want to activate this user?",
        confirm: function(button) {
        	blockUI();
        	randomKey = Math.random();
        	$.ajax({
				url: 'activateUser.htm',
				type: 'POST',
				data: {userId : userId,
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
					showMessage(data.isError, data.message);	
				}
			});
        },
        cancel: function(button) {
           return false;
        }
    });
}

//validate search criteria start
function isValidSearchCriteria(){
	var isValid = true;
	var errorMessage = "";
	if(!(($.trim($("#userName").val()) == "")) && !($.trim($("#userName").val()).match(userIdSearchRegex))){
		isValid = false;
		errorMessage = "Enter valid user name.";
	}
	if(!isValid){
		showMessage(isValid, errorMessage );		    
	}
	return isValid;		
}
//validate search criteria end

//display msg on user screen
function showMessage(isError, message){

	if(isError){
		$(".message").removeClass("success");
		$(".message").addClass("error");
		$(".message").show();
		$(".message").text(message);
	}else{
		displayTable.fnStandingRedraw();
		hidePopup();
		$("#show-msg-popup").removeClass("hide");
		$("#show-msg-popup").addClass("success");		
		$("#show-msg-popup").text(message);
	}
	
}
/*
 * To hide success message popup
 */
function hideMessagePopup(){
	if(!$("#show-msg-popup").hasClass("hide")){
		$("#show-msg-popup").addClass("hide");
	}
}
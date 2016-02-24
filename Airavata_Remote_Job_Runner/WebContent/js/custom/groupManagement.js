var corpNames = new Array();
var corpIds = new Object();
var branchNames = new Array();
var branchIds = new Object();
var ovelayHtml= '<div class="overlay">'
                  +'<i class="fa fa-refresh fa-spin"></i>'
                +'</div>';
var corporateId = "";
var branchId = "";
var selectedOrganizationName="";
var selectedOrganizationType="";
var selectedGroupId = ""
var usersAddedToGroup = [];
var usersRemovedFromGroup = [];
var groupNameRegex=/^[A-Za-z0-9 ]{1,50}$/;
var groupDescRegex=/^[A-Za-z0-9\. ]{1,255}$/;
var pGroupName;
var vGroupName;
var pGroupDesc;
var vGroupDesc;
var vId;
var numberOfValidFields = 0;
var noUserInCorporate = '<div class="row available-users-empty-section empty-section"><div class="col-md-12">No user available for mapping in the corporate </div></div>';
var noUserInBranch = '<div class="row available-users-empty-section empty-section"><div class="col-md-12">No user available for mapping in the branch</div></div>';
var noUserMappedToGroup = existingUsersHtml = '<div class="row existing-users-empty-section empty-section"><div class="col-md-12">No user mapped to the group</div></div>';
var isCorporate = false;

var globalGroupList = {};
var globalGroupIds=[];

var existingUsersList = {};
var existingUsersIds=[];

var availableUsersList = {};
var availableUsersIds=[];

var searchInputBox = '<div class="row section-search-div"><div class="col-md-10 col-md-offset-1"><input type="text" class="form-control search-box" placeholder="search....."/></div></div>';
var waitBeforeSearch=300//milliseconds

var organizationId = 0;
var isCorporate = false;

$(document).ready(function(){
	
	$("#groupManagementView").closest('li').addClass("active");

	$(".validation-field").keyup(function(){
		vResult = true;
		var curUsedRegex = "";
		$(".modal-message").hide();
		validationRequired = false;
		
		if($(this).attr("id") == "groupName"){
			validationRequired = true;
			curUsedRegex = groupNameRegex;
		
		}else if($(this).attr("id") == "groupDesc"){
			validationRequired = true;
			curUsedRegex = groupDescRegex;
		}
		
		if(validationRequired){
			if(!$.trim($(this).val()).match(curUsedRegex) ){				
				vResult = false;
			}
			if(vResult){
				
				$(this).nextAll('span:first').hide();
				$(this).addClass("validation-success");
				$(this).removeClass("validation-error");
				numberOfValidFields++;
			
			}else{
				
				$(this).nextAll('span:first').show();
				$(this).removeClass("validation-success");
				$(this).addClass("validation-error");
				numberOfValidFields--;
			}
		}
		
	});
	
	$(".validation-field").click(function(){
		$(this).trigger('keyup');
	});
		
	//get available corporate organizations
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
				showMessage(true, data.errorMessage);
			}
			
			$( '#autoCompleteCorporates' ).typeahead( { source:corpNames} );
		},
		error: function(xhr, textStatus, thrownError, data) {
			showMessage(true, "Error fetching corporates");
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			}			
		},
	});
	
	//get available branches
	randomKey = Math.random();
	$.ajax({
		url: 'getBranches.htm',
		type: 'GET',
		data: {isRequestFromAutocompleter : true,
			isActiveCorpRequired: true,
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
				showMessage(true, data.errorMessage);
			}
			
			$( '#autoCompleteBranches' ).typeahead( { source:branchNames} );
		},
		error: function(xhr, textStatus, thrownError, data) {
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			}
			showMessage(true, "Error fetching corporates");
		},
	});
	
	
	$(".validation-typeahead").keyup(function(){
		$('.message').hide();
	});
	
	bindEventOnUserBoxes();
	$('[data-toggle="tooltip"]').tooltip();
	
	//open modal to add new group
	$('#addGroup').click(function(){
		$('.group-modal-header').html('Add Group');
		$('#groupName').val('');
		$('#groupDesc').val('');
		$(".modal-message").hide();
		$(".message").hide();
		$('.updateGroup').addClass('hide');
		$('.addGroup').removeClass('hide');
		$(".validation-field").nextAll('span:first').hide();
		$(".validation-field").addClass("validation-success");
		$(".validation-field").removeClass("validation-error");
		
		$('#groupModal').modal();
	});
	
	//populate groups under selected corporate
	$('#getSpecificGroups').click(function(){
		$(".message").hide();
		$('.users-in-group').text('Users')
		
		if(isCorporate){
			corporateId = corpIds[$('#autoCompleteCorporates' ).val()];
			if(undefined == corporateId){	
				invalidateDataOnErrorSituation();
				showMessage(true, "* select valid/active corporate");
				return;
			}		
			selectedOrganizationName = $('#autoCompleteCorporates' ).val();
			selectedOrganizationType = $('#organizationType option:selected').text()
			organizationId = corporateId;
		}else{
			branchId = branchIds[$('#autoCompleteBranches' ).val()];			
			if(undefined == branchId){			
				invalidateDataOnErrorSituation();
				showMessage(true, "* select valid/active branch");
				return;
			}			
			selectedOrganizationName = $('#autoCompleteBranches' ).val();
			selectedOrganizationType = $('#organizationType option:selected').text()
			organizationId = branchId;
		}
		if(usersAddedToGroup.length != 0 || usersRemovedFromGroup.length != 0){
			$.confirm({
				text: "Are you sure, you want to move on without saving changes? All unsaved changes will be lost.",
				confirm: function(button) {
					showSpecificGroups(isCorporate, organizationId);
					usersAddedToGroup = [];
					usersRemovedFromGroup = [];
				},
				cancel: function(button) {					
					return false;
				}
			});
		}else{
			showSpecificGroups(isCorporate, organizationId);
		}
		
	});
	
	//add group server call
	$('.addGroup').click(function(){
		$(".modal-message").hide();
		numberOfValidFields = 0;		
		$(".validation-field").trigger('keyup');
		if(numberOfValidFields !=2 ){
			return;
		}
		group = {};
		group.name = $.trim($('#groupName').val());
		group.desc = $.trim($('#groupDesc').val());
		group = JSON.stringify(group);
		if(isCorporate){
			organizationId = corporateId;
		}else{
			organizationId = branchId;
		}
		addGroup(group, isCorporate, organizationId);
	});
	
	$('.updateGroup').click(function(){
		$(".modal-message").hide();
		
		vGroupName = $.trim($('#groupName').val());
		vGroupDesc = $.trim($('#groupDesc').val());
		
		if(!isGroupDetailsChanged()){
			showModalMessage(true, "*No change made")
			return; 
		}
		numberOfValidFields = 0;		
		$(".validation-field").trigger('keyup');
		if(numberOfValidFields !=2 ){
			return;
		}
		
		group = {};
		group.id = vId;
		group.name=vGroupName;
		group.desc=vGroupDesc;	
		
		group = JSON.stringify(group);
		if(isCorporate){
			organizationId = corporateId;
		}else{
			organizationId = branchId;
		}
		saveUpdatedGroup(group, isCorporate, organizationId);
		
	});
	
	//save user group mapping server call
	$('#saveGroupUserMapping').click(function(){
		$(".message").hide();
		if(usersAddedToGroup.length == 0 && usersRemovedFromGroup.length == 0){
			showMessage(true, "*No change to save");
			return;
		}
		if(isCorporate){
			organizationId = corporateId;
		}else{
			organizationId = branchId;
		}
		saveGroupUserMapping(selectedGroupId, $.trim(usersAddedToGroup.toString()), $.trim(usersRemovedFromGroup.toString()), isCorporate, organizationId);
	});
	
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
	
	$.fn.delayKeyup = function(callback, ms){
	    var timer = 0;
	    $(this).keyup(function(){                   
	        clearTimeout (timer);
	        timer = setTimeout(callback, ms);
	    });
	    return $(this);
	};

	//group search box event on key up
	$('#groupSearchBox').delayKeyup(function(){						
		groupSearch($('#groupSearchBox'))
	}, waitBeforeSearch);
	
	//existing users search box event on key up
	$('#existingUsersSearchBox').delayKeyup(function(){						
		userSearch(true, $('#existingUsersSearchBox'))
	}, waitBeforeSearch);
	
	//available users search box event on key up
	$('#availableUsersSearchBox').delayKeyup(function(){						
		userSearch(false, $('#availableUsersSearchBox'))
	}, waitBeforeSearch);
})

//get and show corporate specific groups in group section
function showSpecificGroups(isCorp, organizationId) {
	
	$('.group-section').append(ovelayHtml);
	$('.users-section .section-body .section-search-div').nextAll('.row').remove();
	$('#groupSearchBox').val('');
	$('#availableUsersSearchBox').val('');
	$('#availableUsersSearchBox').addClass('hide');
	$('#existingUsersSearchBox').val('');
	$('#existingUsersSearchBox').addClass('hide');
	
	$('.group-section-title').text("Groups in " + selectedOrganizationType + " " + selectedOrganizationName)
		
	if(isCorp){
		url = 'getGroupsForCorporate.htm';
		data = {corporateId: organizationId,			
			 	randomKey: randomKey}
	}else{
		url = 'getGroupsForBranch.htm';
		data = {branchId: organizationId,			
			 	randomKey: randomKey}
	}
	randomKey = Math.random();
	$.ajax({
		url: url,
		type: 'GET',
		data: data,
		dataType: 'json',
		success : function(data) {
			$('.section-body').css('max-height', $('.right-side').height() - $('.section-body').offset().top + 34);
			if(!data.isError){
				$('.group-section .section-search-div').nextAll().remove();
				if(data.groups.length > 0) {
					$(".message").hide();
					$('.add-group-btn-div').removeClass('hide');
					$('#groupSearchBox').removeClass('hide');
					
					groupsHtml = "";
					
					/*create group boxes and append to group section
					*at first edit button will be hidden
					*on select : 1. Fetch Users
					*			 2. Enable Edit button
					*/				
					globalGroupList={};
					globalGroupIds = [];
					for ( var i = 0; i < data.groups.length; i++) {						
						group={};
						group.id = data.groups[i].id;
						group.desc = data.groups[i].desc;
						group.name = data.groups[i].name;
						globalGroupIds[i] = group.id;
						globalGroupList[group.id] = group;
							
					}
					
					groupsHtml = createGroupBoxes("");
					
					$('.group-section .section-search-div').after(groupsHtml);	
					
					bindEventOnGroupBox();					
				}
				else {
					$('.group-section .section-search-div').removeClass('hide');
					if(isCorporate){
						showMessage(true, "* No group present in selected corporate.");
					}else{
						showMessage(true, "* No group present in selected corporate.");
					}					
				}
			}
			else{
				showMessage(true, data.message);
			}
			$('.group-section .overlay').remove();
		},
		error: function(xhr, textStatus, thrownError, data) {
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			}
			showMessage(true, "Error fetching groups");
		}
	});
}

//add new group
function addGroup(group, isCorp, organizationId){	
	
	if(isCorp){
		mapToId = organizationId;
	}else{
		mapToId = organizationId;
	}
	randomKey = Math.random();
	$.ajax({
		url: 'addGroup.htm',
		type: 'POST',
		data: {group : group,
			isCorporate: isCorp,
			mapToId : mapToId,
			randomKey: randomKey},
		dataType: 'json',
		success : function(data) {
			
			if(!data.isError){
				/*Add group
				 * Create new group box
				 * Append to group section(will be appended at the start)
				 * bind all the required events
				 */
				$('#groupModal').find('.close').click();
				groupsHtml = "";
				groupsHtml += '<div class="row">'
					+'<div class="col-md-10 col-md-offset-1">'
					+'<div class="box box-default thin-top-border">'
					+'<div  id = "' + data.group.id + '" group-desc = "' + data.group.desc + '" class="box-header with-border break-long-word-div">'
					+'<span class="box-title group-name break-long-word-span">' + data.group.name + '</span>'
					+'<div class="box-tools pull-right">'					
					+'<button class="btn btn-box-tool hide edit-group" data-toggle="tooltip" data-container="body" data-original-title="Edit Group">'
					+'<i class="fa fa-edit hide edit-group large-action-icon"></i>'
					+'</button></div></div></div></div></div>';
				
				$('.group-section .section-search-div').after(groupsHtml);
				
				//add group id to list 
				globalGroupIds.unshift(data.group.id);
				//add group details to map
				globalGroupList[data.group.id] = data.group;
				
				//bind events on control
				bindEventOnGroupBox();
			
			}
			else{
				showModalMessage(true, data.message);
			}
			
		},
		error: function(xhr, textStatus, thrownError, data) {
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			}
			showMessage(true, "Error adding group");
		}
	});
}

//add new group
function saveUpdatedGroup(group, isCorp, organizationId){
	
	randomKey = Math.random();
	$.ajax({
		url: 'updateGroup.htm',
		type: 'POST',
		data: {group : group,
			isCorporate : isCorp,
			organizationId : organizationId,
			randomKey: randomKey},
		dataType: 'json',
		success : function(data) {
			
			if(!data.isError){
				//make changes to group box attributes according to update
				$('#groupModal').find('.close').click();
				var updatedGroup = $('.group-section .box #' + data.group.id);
				updatedGroup.find('.group-name').text(data.group.name);
				updatedGroup.attr('group-desc', data.group.desc);
				
				//update greoup details in map
				globalGroupList[data.group.id] = data.group;
				
				showMessage(false, data.message);
			}
			else{
				showModalMessage(true, data.message);
			}
			
		},
		error: function(xhr, textStatus, thrownError, data) {
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			}
			showMessage(true, "Error updating group");
		}
	});
}

//get users in the selected group
//and can be mapped to the selected group

//get users which are and can be mapped to the group
function getUsersInGroup(groupId, isCorporate, organizationId){
	$(".message").hide();
	selectedGroupId = groupId;
	usersAddedToGroup = [];
	usersRemovedFromGroup = [];
	
	$('#availableUsersSearchBox').val('');
	$('#existingUsersSearchBox').val('');
	
	$('.users-section').append(ovelayHtml);
	randomKey = Math.random();
	$.ajax({
		url: 'getGroupUserMapping.htm',
		type: 'GET',
		data: {groupId : groupId,
			isCorporate : isCorporate,
			organizationId: organizationId,
			randomKey: randomKey},
		dataType: 'json',
		success : function(data) {
			
			if(!data.isError){
				/*
				 * Create user boxes both for users in group and can be mapped to group
				 * Remove all the user boxes first
				 * Append existing user boxes to existing-users section
				 * Append available user boxes to available-users section
				 * Bind events on control 
				 */
				$('.users-section .section-body .section-search-div').nextAll('.row').remove();
				
				existingUsersHtml = "";
				existingUsersList = {};
				existingUsersIds=[];				
				
				if(data.groupUserMap.users.length>0){
					
					//create existing users details map 
					for(var i=0; i<data.groupUserMap.users.length; i++){
						
						existingUsersIds[i] = data.groupUserMap.users[i].id;
						
						existingUsersList[data.groupUserMap.users[i].id] = data.groupUserMap.users[i]; 
						
					}
								
					//create user boxes
					existingUsersHtml = createUserBoxes(true, "");
					$('#existingUsersSearchBox').removeClass('hide');
					
				}else{
					existingUsersHtml = noUserMappedToGroup;		
					$('#existingUsersSearchBox').addClass('hide');
				}				
				
				//render user boxes on screen
				$('.existing-users .box-body .section-search-div').after(existingUsersHtml);
				
				availableUsersHtml = "";
				availableUsersList = {};
				availableUsersIds=[];
				
				if(data.groupUserMap.availableUsersForSelection.length>0){

					//create available users details map
					for(var i=0; i<data.groupUserMap.availableUsersForSelection.length; i++){
						
						availableUsersIds[i] = data.groupUserMap.availableUsersForSelection[i].id;

						availableUsersList[data.groupUserMap.availableUsersForSelection[i].id] = data.groupUserMap.availableUsersForSelection[i];
					}
					
					//create user boxes
					availableUsersHtml += createUserBoxes(false, "");
					$('#availableUsersSearchBox').removeClass('hide');					
					
				}else{
					if(isCorporate){
						availableUsersHtml = noUserInCorporate;
					}else{
						availableUsersHtml = noUserInBranch;
					}
					$('#availableUsersSearchBox').addClass('hide');
					
				}
				//render user boxes on screen
				$('.available-users .box-body .section-search-div').after(availableUsersHtml);
				
				//bind events on user boxes
				bindEventOnUserBoxes();
			}
			else{
				showMessage(true, data.message);
			}
			$('.users-section .overlay').remove();
		},
		error: function(xhr, textStatus, thrownError, data) {
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			}
			showMessage(true, "Error fetching users");
		} 
	});
}

//save newly created group user mapping
function saveGroupUserMapping(groupId, usersIdsAddedToGroup, usersIdsRemovedFromGroup, isCorp, organizationId){
	randomKey = Math.random();
	$.ajax({
		url: 'saveGroupUserMapping.htm',
		type: 'POST',
		data: {groupId : groupId,
			usersIdsAddedToGroup : usersIdsAddedToGroup,
			usersIdsRemovedFromGroup: usersIdsRemovedFromGroup,
			isCorporate : isCorp,
			organizationId : organizationId,
			randomKey: randomKey},
		dataType: 'json',
		success : function(data) {			
			if(!data.isError){
				$('.available-users .removed-element').each(function(){
					$(this).removeClass('removed-element');
					$(this).closest('.row').attr('original-section', 'available-users')
				});
				
				$('.existing-users .newly-added-element').each(function(){
					$(this).removeClass('newly-added-element');
					$(this).closest('.row').attr('original-section', 'existing-users')
				});
				
				$.each(availableUsersIds, function(index, val) {
					boxHeaderClasses = 'box-header with-border break-long-word-div';
					availableUsersList[val].isAdded = false;
					availableUsersList[val].isRemoved = false;
				});
				
				$.each(existingUsersIds, function(index, val) {
					boxHeaderClasses = 'box-header with-border break-long-word-div';
					existingUsersList[val].isAdded = false;
					existingUsersList[val].isRemoved = false;
				});
				
				//repopulate user sections
				userSearch(true, $('#existingUsersSearchBox'));
				userSearch(false, $('#availableUsersSearchBox'));
				
				usersAddedToGroup = [];
				usersRemovedFromGroup = [];
				$('#saveGroupUserMapping').addClass('hide');
				showMessage(false, data.message);
			}
			else{
				showMessage(true, data.message);
			}
		},
		error: function(xhr, textStatus, thrownError, data) {
			if(xhr.status == 599){
				window.location.href = "login.htm?error=sessionExpired";
			} else if(xhr.status == 500){
				window.location.href = "system-error.htm";
			}
			showMessage(true, "Error saving group user mapping");
		}
	});
}

//base page message
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

//modal message
function showModalMessage(isError, message){
	if(isError){
		$(".modal-message").removeClass('success');
		$(".modal-message").addClass('error');
		$(".modal-message").show();
	}else{
		$(".modal-message").removeClass('error');
		$(".modal-message").addClass('success');		
		$(".modal-message").show();
	}
	$(".modal-message").text(message);
}

//bind add remove(UI level) event to user boxes
function bindEventOnUserBoxes(){
	//unbind earlier events
	$('.users-section').find('.box-tools > button').unbind('click');
	
	//bind events
	$('.users-section').find('.box-tools > button').click(function(){
		
		//hide page message
		$('.message').hide();
		
		//box id
		id = parseInt($(this).closest('.box-header').attr('id'),10);
		
		if($(this).closest('.users-section').hasClass('existing-users')){
			
			//clear search criterion 
			//repopulate available users			
			$('#availableUsersSearchBox').val('');
			userSearch(false, $('#availableUsersSearchBox'))		
			
			//add user to available users details map
			availableUsersIds.unshift(id);
			availableUsersList[id] = existingUsersList[id];
				
			//remove user from existing users details map
			existingUsersIds.splice( $.inArray(id, existingUsersIds), 1 );			
			
			if($(this).closest('.row').attr('original-section') == "available-users"){				
				$(this).closest('.box-header').removeClass('newly-added-element');
				usersAddedToGroup.splice( $.inArray(id, usersAddedToGroup), 1 );
				availableUsersList[id].isAdded = false;
				availableUsersList[id].isRemoved = false;
			}else{
				usersRemovedFromGroup.push(id);
				$(this).closest('.box-header').addClass('removed-element');
				availableUsersList[id].isRemoved = true;
			}			
			
			$('.available-users .box-body .section-search-div').after($(this).closest('.row'));			
			$(this).find('i').removeClass('fa-minus');
			$(this).find('i').addClass('fa-plus');
			$(this).closest('button').attr('data-original-title', 'Add User');			
		}else{
			
			//clear search criterion 
			//repopulate existing users
			$('#existingUsersSearchBox').val('');
			userSearch(true, $('#existingUsersSearchBox'))
			
			//add user to existing users details map
			existingUsersIds.unshift(id);
			existingUsersList[id] = availableUsersList[id];
			
			//remove user from available users details map
			availableUsersIds.splice( $.inArray(id, availableUsersIds), 1 );			
			
			if($(this).closest('.row').attr('original-section') == "existing-users"){
				$(this).closest('.box-header').removeClass('removed-element');
				usersRemovedFromGroup.splice($.inArray(id, usersRemovedFromGroup), 1 );
				existingUsersList[id].isAdded = false;
				existingUsersList[id].isRemoved = false;
			}else{				
				$(this).closest('.box-header').addClass('newly-added-element');
				usersAddedToGroup.push(id);
				existingUsersList[id].isAdded = true;
			}
			
			$('.existing-users .box-body .section-search-div').after($(this).closest('.row'));			
			$(this).find('i').removeClass('fa-plus');
			$(this).find('i').addClass('fa-minus');
			$(this).closest('button').attr('data-original-title', 'Remove User');
		}
		
		if(existingUsersIds.length>0){
			$('.existing-users-empty-section').remove();
			$('#existingUsersSearchBox').removeClass('hide');
		}else{
			$('.existing-users').find('.box-body').append(noUserMappedToGroup);
			$('#existingUsersSearchBox').addClass('hide');
		}
		
		if(availableUsersIds.length>0){
			$('.available-users-empty-section').remove();
			$('#availableUsersSearchBox').removeClass('hide');
		}else{
			$('.available-users').find('.box-body').append(noUserInCorporate);
			$('#availableUsersSearchBox').addClass('hide');
		}
		
		if(usersAddedToGroup.length != 0 || usersRemovedFromGroup.length != 0){
			$('#saveGroupUserMapping').removeClass('hide');
		}else{
			$('#saveGroupUserMapping').addClass('hide');			
		}
		
	});
	
	$('[data-toggle="tooltip"]').tooltip();
}


function updateGroup(ele){
	
	$('.group-modal-header').html('Edit Group');
	$('.updateGroup').removeClass('hide');
	$('.addGroup').addClass('hide');
	
	pGroupName = ele.find('.group-name').text();
	pGroupDesc = ele.attr('group-desc');
	
	$('#groupName').val(pGroupName);
	$('#groupDesc').val(pGroupDesc);
	
	$(".validation-field").trigger('keyup');
	
	vId = ele.attr('id');
	
	$('#groupModal').modal();
		
}

function bindEventOnGroupBox(){

	$('.group-section .section-body .box-header').click(function(){
		curEle = $(this);
		if(usersAddedToGroup.length != 0 || usersRemovedFromGroup.length != 0){
			$.confirm({
				text: "Are you sure, you want to move on without saving changes? All unsaved changes will be lost.",
				confirm: function(button) {
					$('#saveGroupUserMapping').addClass('hide');
					$('.group-section .section-body .box-header').removeClass('selected');
					$('.group-section .section-body .edit-group').addClass('hide');		
					curEle.closest('.box-header').addClass('selected');
					$('.users-in-group').text('Users in ' + $(this).closest('.box-header').find('.group-name').html());
					curEle.find('.edit-group').removeClass('hide');
					if(isCorporate){
						getUsersInGroup(curEle.closest('.box-header').attr('id'), isCorporate, corporateId);
					}else{
						getUsersInGroup(curEle.closest('.box-header').attr('id'), isCorporate, branchId);
					}
					usersAddedToGroup = [];
					usersRemovedFromGroup = [];
										
				},
				cancel: function(button) {
					return false;
				}
			});
		}else{
			$('#saveGroupUserMapping').addClass('hide');
			$('.group-section .section-body .box-header').removeClass('selected');
			$('.group-section .section-body .edit-group').addClass('hide');		
			curEle.closest('.box-header').addClass('selected');
			$('.users-in-group').text('Users in ' + curEle.closest('.box-header').find('.group-name').html());
			curEle.find('.edit-group').removeClass('hide');		
			if(isCorporate){
				getUsersInGroup(curEle.closest('.box-header').attr('id'), isCorporate, corporateId);
			}else{
				getUsersInGroup(curEle.closest('.box-header').attr('id'), isCorporate, branchId);
			}
		}
		
	})
	
	$('.group-section .section-body .edit-group').click(function(event){
		event.stopPropagation();
		$('.group-section .section-body .box-header').removeClass('selected');
		$(this).closest('.box-header').addClass('selected');
		$('.users-in-group').text('Users in ' + $(this).closest('.box-header').find('.group-name').html());		
		updateGroup($(this).closest('.box-header'));
	})
	
	$('[data-toggle="tooltip"]').tooltip();
}

//check if group details changed while updation
function isGroupDetailsChanged(){
	var result = true;
	if(pGroupName == vGroupName && pGroupDesc == vGroupDesc){
		return false
	}
	return result;
}

//invalidate all the fields on error situation
function invalidateDataOnErrorSituation(){
	$('.users-in-group').text('Users')
	$('#autoCompleteCorporates').val('');
	$('#autoCompleteBranches').val('');
	$('#saveGroupUserMapping').addClass('hide');
	$('.users-section .section-body .row').remove();
	$('.group-section .section-search-div').nextAll().remove();
	$('.group-section-title').text('Groups');
	$('.add-group-btn-div').addClass('hide');
	$('.group-section-title').text('Groups');
	$('.group-section .section-search-div').addClass('hide');
	usersAddedToGroup = [];
	usersRemovedFromGroup = [];
}

//group search
function groupSearch(curEle){	
	//remove group boxes
	curEle.closest('.section-search-div').nextAll('.row').remove();
	//create group boxes html according to search criterion 
	groupHtml = createGroupBoxes($.trim(curEle.val()));
	//add group boxes
	curEle.closest('.section-search-div').after(groupHtml);
	//bind events on user boxes
	bindEventOnGroupBox();	
}

//user search
function userSearch(isExistingUsers, curEle){
	//remove user boxes
	curEle.closest('.section-search-div').nextAll('.row').remove();
	//create user boxes html according to search criterion and provided user section 
	userHtml = createUserBoxes(isExistingUsers, $.trim(curEle.val()));
	//add user boxes
	curEle.closest('.section-search-div').after(userHtml);
	//bind events on user boxes
	bindEventOnUserBoxes();	
}

//create group boxes satisfying search criterion
function createGroupBoxes(searchVal){
	groupsHtml = "";
	
	/*
	 * if search criterion specified
	 * check each group name against search criterion
	 */
	if(searchVal != undefined && searchVal.length > 0){		
		$.each(globalGroupIds, function(index, val) {
			if(globalGroupList[val].name.match(new RegExp(searchVal , 'gi'))){
				groupsHtml += '<div class="row">'
					+'<div class="col-md-10 col-md-offset-1">'
					+'<div class="box box-default thin-top-border">'
					+'<div  id = "' + globalGroupList[val].id + '" group-desc = "' + globalGroupList[val].desc + '" class="box-header with-border break-long-word-div">'
					+'<span class="box-title group-name break-long-word-span">' + globalGroupList[val].name + '</span>'
					+'<div class="box-tools pull-right">'							
					+'<button class="btn btn-box-tool hide edit-group" data-toggle="tooltip" data-container="body" data-original-title="Edit Group">'
					+'<i class="fa fa-edit edit-group large-action-icon"></i>'
					+'</button></div></div></div></div></div>';
				
			}
		});		
	}else{
		$.each(globalGroupIds, function(index, val) {
			groupsHtml += '<div class="row">'
				+'<div class="col-md-10 col-md-offset-1">'
				+'<div class="box box-default thin-top-border">'
				+'<div  id = "' + globalGroupList[val].id + '" group-desc = "' + globalGroupList[val].desc + '" class="box-header with-border break-long-word-div">'
				+'<span class="box-title group-name break-long-word-span">' + globalGroupList[val].name + '</span>'
				+'<div class="box-tools pull-right">'							
				+'<button class="btn btn-box-tool hide edit-group" data-toggle="tooltip" data-container="body" data-original-title="Edit Group">'
				+'<i class="fa fa-edit edit-group large-action-icon"></i>'
				+'</button></div></div></div></div></div>';
				
		});
	}
	
	return groupsHtml;
}

//create group boxes satisfying search criteria
function createUserBoxes(isExistingUsers, searchVal){
	usersHtml = "";
	
	/*
	 * check if request is to build existing users secction
	 * if not move to available users
	 */
	if(isExistingUsers){
		
		/*
		 * if search criterion specified
		 * check each user id against search criterion
		 */
		if(searchVal != undefined && searchVal.length > 0){
			$.each(existingUsersIds, function(index, val) {				
				if(existingUsersList[val].userId.match(new RegExp(searchVal , 'gi'))){
					
					/*
					 *while populating existing users list
					 *search for added users and set original section to available-users
					 *to identify users which are originally from available category
					 *and now transaferred to existing category but not yet saved 
					 *to the database
					 */
					
					boxHeaderClasses = 'box-header with-border break-long-word-div';
					originalSection='existing-users';
					if(existingUsersList[val].isAdded){
						/*if added to existing category
						*add class newly-added-element to the box
						*set original section to available-users
						*/
						boxHeaderClasses += ' newly-added-element' ;
						originalSection='available-users';
					}else if(existingUsersList[val].isRemoved){
						boxHeaderClasses += ' removed-element' ;
					}
					usersHtml += '<div class="row" original-section="' + originalSection + '">'
						+'<div class="col-md-10 col-md-offset-1">'
						+'<div class="box box-default thin-top-border">'
						+'<div  id = "' + existingUsersList[val].id + '" class="' + boxHeaderClasses + '">'
						+'<span class="box-title break-long-word-span">' + existingUsersList[val].userId + '</span>'
						+'<div class="box-tools pull-right">'
						+'<button class="btn btn-box-tool" data-toggle="tooltip" data-container="body" data-original-title="Remove User">'
						+'<i class="fa fa-minus"></i>'
						+'</button></div></div></div></div></div>';
				}
			});
		}else{
			$.each(existingUsersIds, function(index, val) {
				
				/*
				 *while populating existing users list
				 *search for added users and set original section to available-users
				 *to identify users which are originally from available category
				 *and now transaferred to existing category but not yet saved 
				 *to the database
				 */
				
				originalSection='existing-users';
				boxHeaderClasses = 'box-header with-border break-long-word-div';
				if(existingUsersList[val].isAdded){
					/*if added to existing category
					*add class newly-added-element to the box
					*set original section to available-users
					*/
					boxHeaderClasses += ' newly-added-element' ;
					originalSection='available-users';
				}else if(existingUsersList[val].isRemoved){
					boxHeaderClasses += ' removed-element';
				}
				usersHtml += '<div class="row" original-section="' + originalSection + '">'
					+'<div class="col-md-10 col-md-offset-1">'
					+'<div class="box box-default thin-top-border">'
					+'<div  id = "' + existingUsersList[val].id + '" class= "' + boxHeaderClasses + '">'
					+'<span class="box-title break-long-word-span">' + existingUsersList[val].userId + '</span>'
					+'<div class="box-tools pull-right">'
					+'<button class="btn btn-box-tool" data-toggle="tooltip" data-container="body" data-original-title="Remove User">'
					+'<i class="fa fa-minus"></i>'
					+'</button></div></div></div></div></div>';
				});
		}
		
	}else{
		/*
		 * if search criterion specified
		 * check each user id against search criterion
		 */
		if(searchVal != undefined && searchVal.length > 0){
			$.each(availableUsersIds, function(index, val) {				
				/*
				 *while populating available users list
				 *search for removed users and set original section to existing-users
				 *to identify users which are originally from existing category
				 *and now transaferred to available category but not yet saved 
				 *to the database
				 */
				
				originalSection='available-users';
				if(availableUsersList[val].userId.match(new RegExp(searchVal , 'gi'))){
					boxHeaderClasses = 'box-header with-border break-long-word-div';
					if(availableUsersList[val].isAdded){
						boxHeaderClasses += ' newly-added-element' ;
					}else if(availableUsersList[val].isRemoved){
						/*if removed from available category
						*add class removed-element to the box
						*set original section to existing-users
						*/
						boxHeaderClasses += ' removed-element' ;
						originalSection='existing-users';
					}
					usersHtml += '<div class="row" original-section="' + originalSection + '">'
						+'<div class="col-md-10 col-md-offset-1">'
						+'<div class="box box-default thin-top-border">'
						+'<div  id = "' + availableUsersList[val].id + '" class= "' + boxHeaderClasses + '">'
						+'<span class="box-title break-long-word-span">' + availableUsersList[val].userId + '</span>'
						+'<div class="box-tools pull-right">'
						+'<button class="btn btn-box-tool" data-toggle="tooltip" data-container="body" data-original-title="Add User">'
						+'<i class="fa fa-plus"></i>'
						+'</button></div></div></div></div></div>';
				}
			});
		}else{
			$.each(availableUsersIds, function(index, val) {
				
				/*
				 *while populating available users list
				 *search for removed users and set original section to existing-users
				 *to identify users which are originally from existing category
				 *and now transaferred to available category but not yet saved 
				 *to the database
				 */
				
				originalSection='available-users';
				boxHeaderClasses = 'box-header with-border break-long-word-div';
				if(availableUsersList[val].isAdded){
					boxHeaderClasses += ' newly-added-element';
				}else if(availableUsersList[val].isRemoved){
					/*if removed from available category
					*add class removed-element to the box
					*set original section to existing-users
					*/
					boxHeaderClasses += ' removed-element';
					originalSection='existing-users';
				}
				usersHtml += '<div class="row" original-section="' + originalSection + '">'
					+'<div class="col-md-10 col-md-offset-1">'
					+'<div class="box box-default thin-top-border">'
					+'<div  id = "' + availableUsersList[val].id + '" class= "' + boxHeaderClasses + '">'
					+'<span class="box-title break-long-word-span">' + availableUsersList[val].userId + '</span>'
					+'<div class="box-tools pull-right">'
					+'<button class="btn btn-box-tool" data-toggle="tooltip" data-container="body" data-original-title="Add User">'
					+'<i class="fa fa-plus"></i>'
					+'</button></div></div></div></div></div>';
			});
		}		
	}	
	return usersHtml;
}
var regexForCorporateName = /^[A-Za-z0-9 ]{1,100}$/;
var regexForCorporateId = /^[A-Za-z0-9]{1,100}$/;
var regexForBranchIds = /^.{1,}$/;
var regexForDebitAccNo = /^(((([0-9]{15}),)*)([0-9]{15}))$/;
var regexForCorporateVendorIds = /^.{0,}$/;
var branchNames = new Array();
var branchIds = new Object();
var pName = "";
var pCorpId = "";
var pDebitAccountNumber = "";
var pBranchName = "";
var pBranchId = "";
var vId = "";
var vName = "";
var vCorpId = "";
var vDebitAccountNumber = "";
var vBranchIds = "";
var suspendedStatusId = "";
var numberOfValidFields = 0;
var vResult;
var jSonToToken = null;
var jSonToTokenAllBranches = null;
var preAssignedBranches = null;
var activeBranchList = null;
var randomKey;
var dtTable = null;

var corporateVendorNames = new Array();
var corporateVendorIds = new Object();
var jSonToTokenAllCorproateVendors = null;
var activeCorporateVendorList = null;
var vCorporateVendorIds = "";
var jSonToTokenVendor = null;
var preAssignedCorporateVendors = null;
var showUpdateButton = false;

$(document).ready(function() {
    
	/*$("#help").on('click' ,function(){
		showPopup(40);
	});
	
	$(".tab-close, .overlay").click(function(){
		hidePopup();
	});*/
	
    $(document).keyup(function(e) {
        if ($("#upload-file-div").hasClass("hide") && e.keyCode == 27) {
            hideCorporatePopup();
        }
    });
    $(".scroll-right").on("click", function() {
        $(".dataTables_wrapper").animate({
            scrollLeft: "+=300px"
        });
    });
    $(".scroll-left").on("click", function() {
        $(".dataTables_wrapper").animate({
            scrollLeft: "-=300px"
        });
    });
    $(".table-hover").mousemove(function(event) {
        $(".scroll-right").animate({
            top: event.pageY - $(".table-hover").offset().top
        }, {
            duration: 50,
            queue: false
        });
        $(".scroll-left").animate({
            top: event.pageY - $(".table-hover").offset().top
        }, {
            duration: 50,
            queue: false
        });
    });
    $(".content").hover(function() {
        if ($(".dataTables_wrapper").width() < $(".dataTable").width()) {
            $(".scroll-right").removeClass("hide");
            $(".scroll-left").removeClass("hide");
        }
    }, function() {
        $(".scroll-right").addClass("hide");
        $(".scroll-left").addClass("hide");
    });
    $("#corporateView").closest('li').addClass("active");
    
    $("#fileType").val("ROLE_CORPORATE");
    var pageSize = 10;
    var branchName = "";
    var branchId = "";
    
    var tblColumns = [{
        "mDataProp": null,
        sDefaultContent: "",
        "bSortable": false
    }, {
        "mDataProp": "id",
        sDefaultContent: "",
        "sClass": "hide-column",
        "aTargets": []
    }, {
        "mDataProp": "name",
        sDefaultContent: "",
        "sClass": "corp-name"
    }, {
        "mDataProp": "corpId",
        sDefaultContent: "",
        "sClass": "corp-id"
    }, {
        "mDataProp": "debitAccountNumber",
        sDefaultContent: "",
        "sClass": "hide-column"
    }, {
        "mDataProp": "branchIds",
        sDefaultContent: "",
        "sClass": "hide-column",
        "aTargets": []
    }, {
        "mDataProp": "status.status",
        sDefaultContent: ""
    }, {
        "mDataProp": null,
        sDefaultContent: "",
        "bSortable": false
    }, {"mDataProp": "vendorCorporateIds",
    	sDefaultContent: "",
    	"sClass": "hide-column vendor-corp",
    	"aTargets": [  ]},
    ];
    
    $(".validation-field").keyup(function() {
        vResult = true;
        var curUsedRegex = "";
        $(".message").html("");
        if ($(this).attr("id") == "corporate_name") {
            curUsedRegex = regexForCorporateName;
        }
        if ($(this).attr("id") == "corporate_id") {
            curUsedRegex = regexForCorporateId;
        }
        if ($(this).attr("id") == "debit_account_number") {
            curUsedRegex = regexForDebitAccNo;
        }
        if (!$.trim($(this).val()).match(curUsedRegex)) {
            vResult = false;
        }
        if (vResult) {
            $(this).nextAll("span:first").hide();
            $(this).addClass("validation-success");
            $(this).removeClass("validation-error");
            numberOfValidFields++;
        } else {
            $(this).nextAll("span:first").show();
            $(this).removeClass("validation-success");
            $(this).addClass("validation-error");
            numberOfValidFields--;
        }
    });
    $(".validation-field").click(function() {
        $(this).trigger("keyup");
    });
    $(document).on("keyup", ".token-input-list-facebook", function() {
        isBranchListValid();
    });
    $(document).on("click", ".token-input-list-facebook", function() {
        isBranchListValid();
    });
    $("#branchList").change(function() {
        isBranchListValid();
    });

    function isBranchListValid() {
        vResult = true;
        var obj;
        obj = $("#branchList");
        if (!$.trim(obj.val()).match(regexForBranchIds)) {
            vResult = false;
        }
        if (vResult) {
            obj.nextAll("span:first").hide();
            obj.addClass("validation-success");
            obj.removeClass("validation-error");
            numberOfValidFields++;
        } else {
            obj.nextAll("span:first").show();
            obj.removeClass("validation-success");
            obj.addClass("validation-error");
            numberOfValidFields--;
        }
    }

    function isValidSearchCriteria() {
        var isValid = true;
        var errorMessage = "";
        if ((!($.trim($("#corporateName").val()) == "")) && !($.trim($("#corporateName").val()).match(regexForCorporateName))) {
            isValid = false;
            errorMessage = "Please enter valid corporate name.";
        }
        if (!isValid) {
            $("#page-alert").removeClass("hide");
            $("#page-alert").show();
            $("#page-alert").addClass("alert-danger");
            $("#page-alert").removeClass("alert-success");
            $(".page-message").html(errorMessage);
            $("#page-alert").fadeOut(5000);
        }
        return isValid;
    }
    populateCorporate();

    function populateCorporate() {
        var corporateName = $("#corporateName").val().trim();
        branchId = 0;
        if (($("#autoComplete").val() != null && $("#autoComplete").val() != "")) {
            if (undefined != branchIds[$("#autoComplete").val()]) {
                branchId = branchIds[$("#autoComplete").val()];
                branchName = $("#autoComplete").val();
            } else {
                branchName = "";
                $("#page-alert").removeClass("hide");
                $("#page-alert").show();
                $("#page-alert").removeClass("alert-success");
                $("#page-alert").addClass("alert-danger");
                $(".page-message").html("Please select valid branch name");
                $("#page-alert").fadeOut(7000);
                return;
            }
        } else {
            branchName = "";
            branchId = 0;
        }
        dtTable = $("#corporateList").dataTable({
            "bDestroy": true,
            "bAutoWidth": false,
            "bServerSide": true,
            "sAjaxSource": "getCorporates.htm",
            "bPaginate": true,
            "bLengthChange": false,
            "iDisplayLength": 10,
            "bFilter": false,
            "fnServerParams": function(aoData) {
                blockUI();
                randomKey = Math.random();
                aoData.push({
                    name: "randomKey",
                    value: randomKey
                });
                aoData.push({
                    name: "direction",
                    value: "next"
                });
                aoData.push({
                    name: "pageSize",
                    value: pageSize
                });
                if (corporateName != "") {
                    aoData.push({
                        name: "corporateName",
                        value: corporateName
                    });
                }
                aoData.push({
                    name: "branchId",
                    value: branchId
                });
            },
            "fnRowCallback": function(nRow, aData, iDisplayIndex) {
                var oSettings = dtTable.fnSettings();
                var buttonHtml = "<div>";
                $("td:first", nRow).html(oSettings._iDisplayStart + iDisplayIndex + 1);
                var row = $("td:first", nRow).closest("tr");
                $("td:first", nRow).closest("tr").attr("id", "row_update_" + iDisplayIndex);
                if (!(aData.status.id == suspendedStatusId)) {
                    buttonHtml += '<a onclick="update(' + $("td:first", nRow).closest("tr").attr("id") + ')"><button type="button" class="btn btn-primary info btn-action-margin-left" title="Update"><i class="fa fa-pencil-square-o"></i></button></a>';
                }
                if (!(aData.status.id == suspendedStatusId)) {
                    buttonHtml += '<a onclick="suspend(' + row.find("td:eq(1)").html() + ')"><button type="button" class="btn btn-danger info btn-action-margin-left" title="Suspend"><i class="fa fa-lock"></i></button></a>';
                } else {
                    buttonHtml += '<a onclick="activate(' + row.find("td:eq(1)").html() + ')"><button type="button" class="btn btn-success info btn-action-margin-left" title="Activate"><i class="fa fa-unlock"></i></button></a>';
                }
                buttonHtml += "</div>";
                $("td:eq(7)", nRow).html(buttonHtml);
                return nRow;
            },
            "aoColumns": tblColumns,
            "fnServerData": function(sSource, aoData, fnCallback) {
                $.get(sSource, aoData, function(json) {
                    unblockUI();
                    var obj = JSON.parse(json);
                    if (typeof obj.isError != "undefined") {
                        $("#page-alert").removeClass("hide");
                        $("#page-alert").show();
                        $("#page-alert").addClass("alert-danger");
                        $("#page-alert").removeClass("alert-success");
                        $(".page-message").html(obj.errorMessage);
                        $("#page-alert").fadeOut(7000);
                    }
                    suspendedStatusId = obj.suspendedStatusId;
                    fnCallback(obj);
                }).fail(function(jqXHR, e) {
                    unblockUI();
                    if (jqXHR.status == 599) {
                        window.location.href = "login.htm?error=sessionExpired";
                    } else {
                        if (jqXHR.status == 500) {
                            window.location.href = "system-error.htm";
                        }
                    }
                });
            }
        });
    }
    $("#searchCorporate").click(function() {
        if (!isValidSearchCriteria()) {
            return;
        }
        populateCorporate();
    });
    
    $("#addCorporate").click(function() {
    	
    	showUpdateButton = false;
        $(".records").css("position", "absolute");
        clearValidation();
        showCorporatePopup();
        $("#corp_id").val("");
        $("#corporate_name").val("");
        $("#corporate_id").val("");
        $("#debit_account_number").val("");
        $(".message").html("");
        $("#btn-bulk-upload").removeClass("hide");
        $("#modal_header").html("Add Corporate");
        $(".token-input-list-facebook").remove();
        $(".token-input-dropdown-facebook").remove();
        
        $("#branchList").tokenInput(jSonToToken, {
            theme: "facebook",
            preventDuplicates: true,
            animateDropdown: true,
            noResultsText: "No results"
        });
        
        $("#corporateVendorList").tokenInput(jSonToTokenVendor, {
			theme: "facebook",
			preventDuplicates: true, 
			animateDropdown: true, 
			noResultsText: "No results"			
		});
        
        $(".template-upload").remove();
        $("#add_corporate").show();
        $("#update_corporate").hide();
    });
    
    $("#add_corporate").click(function() {
		
		vName = $.trim($("#corporate_name").val());
		vCorpId = $.trim($("#corporate_id").val());
		vDebitAccountNumber = $.trim($("#debit_account_number").val());
		//vDebitAccountNumber = null;
		vBranchIds = $("#branchList").val();
		vCorporateVendorIds = $("#corporateVendorList").val();
		
		numberOfValidFields = 0;
		$(".validation-field").trigger('keyup');
		isBranchListValid();
		isCorporateVendorListValid();
		
		if(numberOfValidFields != 5){			
			return;
		}
		
		var isDuplicate = isDuplicateAccountPresent(vDebitAccountNumber);
		
		if(isDuplicate) {
			
			
			$(".message").removeClass("success");
			$(".message").addClass("error");
			$(".message").html("* Duplicate account number.");
			$(".message").show();
			return;
		}
		
		randomKey = Math.random();
		data = {name : vName,
				corpId : vCorpId,
				debitAccountNumber : vDebitAccountNumber,
				branchIds : vBranchIds,
				corporateVendorIds : vCorporateVendorIds,
				randomKey : randomKey
				};
		blockUI();
		
		$.ajax({
			url: 'addCorporate.htm',
			type: 'POST',
			data: data,
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
					hideCorporatePopup();
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
    
    $("#update_corporate").click(function() {
		
		vId = $("#corp_id").val();		
		vName = $.trim($("#corporate_name").val());
		vCorpId = $.trim($("#corporate_id").val());
		vDebitAccountNumber = $.trim($("#debit_account_number").val());
		//vDebitAccountNumber = null;
		vBranchIds = $("#branchList").val();
		vCorporateVendorIds = $("#corporateVendorList").val();
		
		numberOfValidFields = 0;
		$(".validation-field").trigger('keyup');
		isBranchListValid();
		isCorporateVendorListValid();
		
		if(numberOfValidFields != 5){
			return;
		}
		
		if(!isChanged()){
			return;
		}	
		
		if(pName == vName){
			vName = undefined;
		}
		if(pCorpId == vCorpId){
			vCorpId = undefined;
		}
		
		var isDuplicate = isDuplicateAccountPresent(vDebitAccountNumber);
		
		if(isDuplicate) {
			
			
			$(".message").removeClass("success");
			$(".message").addClass("error");
			$(".message").html("* Duplicate account number.");
			$(".message").show();
			return;
		}
		
		blockUI();
		randomKey = Math.random();
		$.ajax({
			url: 'updateCorporate.htm',
			type: 'POST',
			data: {id : vId,
					name : vName,
					corpId : vCorpId,
					debitAccountNumber : vDebitAccountNumber,
					newBranchIds : vBranchIds,
					newCorporateVendorIds : vCorporateVendorIds,
					randomKey : randomKey
					},
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
						if($(rows[i]).find("td:eq(1)").html() == $("#corp_id").val()){
			               $(rows[i]).find("td:eq(2)").html($("#corporate_name").val());
			               $(rows[i]).find("td:eq(3)").html($("#corporate_id").val());
			               $(rows[i]).find("td:eq(4)").html($("#debit_account_number").val());
			               $(rows[i]).find("td:eq(5)").html($("#branchList").val());
			               $(rows[i]).find("td:eq(8)").html($("#corporateVendorList").val());
			               $(".message").removeClass("success");
			               $(".message").addClass("success");
			               $(".message").html(data.message);
			               $(".message").show();
			               $("#update_corporate").hide();
			               break;
						}						
			        }
					preAssignedCorporateVendors = $("#corporateVendorList").val();
					preAssignedBranches = $("#branchList").val();
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
    
    $(".container").click(function() {
        if ($(".upload-popup").hasClass("hide")) {
            $(".container").addClass("hide");
            $(".records").addClass("hide");
            $(".pdf-view").hide();
            $(".loading").hide();
        }
    });
    
    $(".close-popup-btn").click(function() {
        hideCorporatePopup();
    });
    
    randomKey = Math.random();
    $.ajax({
        url: "getBranches.htm",
        type: "GET",
        data: {
            isRequestFromAutocompleter: true,
            isActiveBranchRequired: false,
            randomKey: randomKey
        },
        dataType: "json",
        success: function(data) {
            if (!data.isError) {
                for (var i = 0; i < data.aaData.length; i++) {
                    branchNames.push(data.aaData[i].name);
                    branchIds[data.aaData[i].name] = data.aaData[i].id;
                }
                jSonToTokenAllBranches = getBranchList(data.aaData, null);
            } else {
                dtTable.fnStandingRedraw();
                $("#page-alert").removeClass("hide");
                $("#page-alert").show();
                $("#page-alert").addClass("alert-danger");
                $("#page-alert").removeClass("alert-success");
                $(".page-message").html(data.errorMessage);
                $("#page-alert").fadeOut(7000);
            }
            $("#autoComplete").typeahead({
                source: branchNames
            });
        }
    });
    
    randomKey = Math.random();
    $.ajax({
        url: "getBranches.htm",
        type: "GET",
        data: {
            isRequestFromAutocompleter: true,
            isActiveBranchRequired: true,
            randomKey: randomKey
        },
        dataType: "json",
        success: function(data) {
            if (!data.isError) {
                if (data.aaData.length > 0) {
                    jSonToToken = getBranchList(data.aaData, null);
                    $("#branchList").tokenInput(jSonToToken, {
                        theme: "facebook",
                        preventDuplicates: true,
                        animateDropdown: true,
                        noResultsText: "No results"
                    });
                }
            } else {
                dtTable.fnStandingRedraw();
                $("#page-alert").removeClass("hide");
                $("#page-alert").show();
                $("#page-alert").addClass("alert-danger");
                $("#page-alert").removeClass("alert-success");
                $(".page-message").html(data.errorMessage);
                $("#page-alert").fadeOut(7000);
            }
        }
    });
    
	//Vendor corporate fetching
	randomKey = Math.random();
	
	$.ajax({
		url: 'getCorporateVendors.htm',
		type: 'GET',
		data: {isRequestFromAutocompleter : true,
			isActiveCorporateVendorRequired: false,
			randomKey : randomKey},
		dataType: 'json',
		success : function(data) {
			if(!data.isError){
				for ( var i = 0; i < data.aaData.length; i++) {
					corporateVendorNames.push( data.aaData[i].name );
					corporateVendorIds[data.aaData[i].name] = data.aaData[i].id;
				}
				jSonToTokenAllCorproateVendors = getCorporateVendorList(data.aaData, null);
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
			$( '#autoComplete' ).typeahead( { source:corporateVendorNames } );
		}
	});
	
	randomKey = Math.random();
	
	$.ajax({
		url: 'getCorporateVendors.htm',
		type: 'GET',
		data: {isRequestFromAutocompleter : true,
			isActiveCorporateVendorRequired: true,
			randomKey : randomKey},
		dataType: 'json',
		success : function(data) {
			if(!data.isError){
				if(data.aaData.length>0){
					jSonToTokenVendor = getCorporateVendorList(data.aaData, null);
					$("#branchList").tokenInput(jSonToTokenVendor, {
						theme: "facebook",
						preventDuplicates: true, 
						animateDropdown: true, 
						noResultsText: "No results"						
					});
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
		}
	});
	//
	fileType = "ROLE_CORPORATE";
});

function update(rowId) {
    
    showUpdateButton = true;
	row  = $(rowId);
	var tempJsonTokenVendor = jSonToTokenVendor.slice();
	$(".message").html("");
	var rowToRemove = $.trim(row.attr("id")).split(/_[^_]+_/)[1];
	
	for(var i=0; i < tempJsonTokenVendor.length; i++) {
		
		if(tempJsonTokenVendor[i].name == $.trim(row.find(".corp-name").text())) {
			rowToRemove = i;
		}
	}
	
	tempJsonTokenVendor.splice(rowToRemove,1);
	
    $("#btn-bulk-upload").addClass("hide");
    $("#modal_header").html("Update Corporate");
    $("#add_corporate").hide();
    $("#update_corporate").show();
    
    clearValidation();
    
    $("#corp_id").val(row.find("td:eq(1)").html());
    $("#corporate_name").val(row.find("td:eq(2)").text());
    $("#corporate_id").val(row.find("td:eq(3)").html());
    $("#debit_account_number").val(row.find("td:eq(4)").html());
    
    preAssignedBranches = row.find("td:eq(5)").text();
    preAssignedCorporateVendors = row.find('td:eq(8)').text();
    $(".token-input-list-facebook").remove();
    $(".token-input-dropdown-facebook").remove();
   
    $("#branchList").tokenInput(jSonToToken, {
        prePopulate: getBranchList(activeBranchList, preAssignedBranches),
        theme: "facebook",
        preventDuplicates: true,
        animateDropdown: true,
        noResultsText: "No results"
    });
    
    if(preAssignedCorporateVendors != "") {
		$("#corporateVendorList").tokenInput(tempJsonTokenVendor, {prePopulate:getCorporateVendorList(activeCorporateVendorList, preAssignedCorporateVendors),
			theme: "facebook",
			preventDuplicates: true, 
			animateDropdown: true, 
			noResultsText: "No results" 
		});
	}
	else {
		$("#corporateVendorList").tokenInput(tempJsonTokenVendor, {
			theme: "facebook",
			preventDuplicates: true, 
			animateDropdown: true, 
			noResultsText: "No results"			
		});
	}
	
    pCorpId = $("#corporate_id").val();
    pName = $("#corporate_name").val();
    pDebitAccountNumber = $("#debit_account_number").val();
    showCorporatePopup();
    $(".records").css("position", "fixed");
    $(".records").css("top", "50%");
    var offset = $(".records").offset().top;
    $(".records").css("position", "absolute");
    $(".records").css("top", offset + 200);
}

function suspend(id) {
    $("#corp_id").val(id);
    randomKey = Math.random();
    $.confirm({
        text: "Are you sure, you want to suspend this corporate?",
        confirm: function(button) {
            blockUI();
            $.ajax({
                url: "suspendCorporate.htm",
                type: "POST",
                data: {
                    id: $("#corp_id").val(),
                    randomKey: randomKey
                },
                dataType: "json",
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                mimeType: "application/json",
                error: function(xhr, textStatus, thrownError) {
                    unblockUI();
                    if (xhr.status == 599) {
                        window.location.href = "login.htm?error=sessionExpired";
                    } else {
                        if (xhr.status == 500) {
                            window.location.href = "system-error.htm";
                        }
                    }
                },
                success: function(data) {
                    unblockUI();
                    if (!data.isError) {
                        dtTable.fnStandingRedraw();
                        $("#page-alert").removeClass("hide");
                        $("#page-alert").show();
                        $("#page-alert").removeClass("alert-danger");
                        $("#page-alert").addClass("alert-success");
                        $(".page-message").html(data.message);
                        $("#page-alert").fadeOut(7000);
                    } else {
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

function activate(id) {
    $("#corp_id").val(id);
    randomKey = Math.random();
    $.confirm({
        text: "Are you sure, you want to activate this corporate?",
        confirm: function(button) {
            blockUI();
            $.ajax({
                url: "activateCorporate.htm",
                type: "POST",
                data: {
                    id: $("#corp_id").val(),
                    randomKey: randomKey
                },
                dataType: "json",
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                mimeType: "application/json",
                error: function(xhr, textStatus, thrownError) {
                    unblockUI();
                    if (xhr.status == 599) {
                        window.location.href = "login.htm?error=sessionExpired";
                    } else {
                        if (xhr.status == 500) {
                            window.location.href = "system-error.htm";
                        }
                    }
                },
                success: function(data) {
                    unblockUI();
                    if (!data.isError) {
                        dtTable.fnStandingRedraw();
                        $("#page-alert").removeClass("hide");
                        $("#page-alert").show();
                        $("#page-alert").removeClass("alert-danger");
                        $("#page-alert").addClass("alert-success");
                        $(".page-message").html(data.message);
                        $("#page-alert").fadeOut(7000);
                    } else {
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

function hideCorporatePopup() {
    $(".container").addClass("hide");
    $(".records").addClass("hide");
    $(".upload-popup").addClass("hide");
}

function showCorporatePopup() {
    $(".container").removeClass("hide");
    $(".records").removeClass("hide");
}

function hideLoadingPage() {
    $(".container").addClass("hide");
    $(".loading").addClass("hide");
}

function isChanged() {
    var cResult = true;
    var branchChanged = isBranchListChanged(preAssignedBranches, vBranchIds);
    var vendorChanged = isCorporateVendorListChanged(preAssignedCorporateVendors, vCorporateVendorIds);
    
    if (pName == vName && pCorpId == vCorpId && pDebitAccountNumber == vDebitAccountNumber && !branchChanged && !vendorChanged) {
        $(".message").removeClass("success");
        $(".message").addClass("error");
        $(".message").html("No change has been made");
        cResult = false;
    }
    return cResult;
}

function clearValidation() {
    $(".validation-field").each(function() {
        $(this).removeClass("validation-success");
        $(this).removeClass("validation-error");
        $(this).nextAll("span:first").hide();
    });
    $(".validation-token").each(function() {
        $(this).removeClass("validation-success");
        $(this).removeClass("validation-error");
        $(this).nextAll("span:first").hide();
    });
}

function getBranchList(list, prePopulatedIds) {
    jSonBranches = "[";
    if (null != prePopulatedIds) {
        var prePopulatedIdList = prePopulatedIds.split(",");
        for (var i = 0; i < prePopulatedIdList.length; i++) {
            for (var j = 0; j < jSonToTokenAllBranches.length; j++) {
                if (jSonToTokenAllBranches[j].id == prePopulatedIdList[i]) {
                    jSonBranches = jSonBranches + '{name:"' + jSonToTokenAllBranches[j].name + '",id:"' + jSonToTokenAllBranches[j].id + '"},';
                    break;
                }
            }
        }
    } else {
        activeBranchList = list;
        for (var i = 0; i < list.length; i++) {
            jSonBranches = jSonBranches + '{name:"' + list[i].name + '",id:"' + list[i].id + '"},';
        }
    }
    var pos = jSonBranches.lastIndexOf(",");
    jSonBranches = jSonBranches.substring(0, pos) + "]";
    jSonBranches = JSON.stringify(eval("(" + jSonBranches + ")"));
    jSonBranches = $.parseJSON(jSonBranches);
    return jSonBranches;
}

function isBranchListChanged(preSelectedBranches, currentlySelectedBranches) {
    var isListChanged = false;
    var preBranchArray = preSelectedBranches.split(",");
    var curBranchArray = currentlySelectedBranches.split(",");
    if (JSON.stringify(preBranchArray.sort()) != JSON.stringify(curBranchArray.sort())) {
        isListChanged = true;
    }
    if (!isListChanged) {
        vBranchIds = undefined;
    }
    return isListChanged;
}

//Vendor corporate
function getCorporateVendorList(list, prePopulatedIds)
{
	jSonCorporateVendor = '[';
	
	if( null != prePopulatedIds){
		var prePopulatedIdList = prePopulatedIds.split(",");
		for(var i = 0; i < prePopulatedIdList.length; i++ ){
			for(var j = 0; j < jSonToTokenAllCorproateVendors.length; j++){
				if(jSonToTokenAllCorproateVendors[j].id == prePopulatedIdList[i]){
					jSonCorporateVendor = jSonCorporateVendor + '{name:"'
					+ jSonToTokenAllCorproateVendors[j].name + '",id:"' + jSonToTokenAllCorproateVendors[j].id
					+ '"},';
					break;
				}
			}
				
		}
	}else{
		activeCorporateVendorList = list;
		{
			for ( var i = 0; i < list.length; i++) {
				jSonCorporateVendor = jSonCorporateVendor + '{name:"'
						+ list[i].name + '",id:"' + list[i].id
						+ '"},';
			}

		}
	}
	
	var pos = jSonCorporateVendor.lastIndexOf(',');
	jSonCorporateVendor = jSonCorporateVendor.substring(0, pos) + ']';
	jSonCorporateVendor = JSON.stringify(eval("(" + jSonCorporateVendor + ")"));
	jSonCorporateVendor = $.parseJSON(jSonCorporateVendor);
	return jSonCorporateVendor;
}

//Check if vendor corporate list is changed
function isCorporateVendorListChanged(preSelectedCorporateVendors, currentlySelectedCorporateVendors)
{	
	var isListChanged = false; 
	var preCorporateVendorsArray =  preSelectedCorporateVendors.split(",");
	var curCorporateVendorsArray =  currentlySelectedCorporateVendors.split(",");
	if(JSON.stringify(preCorporateVendorsArray.sort()) != JSON.stringify(curCorporateVendorsArray.sort())){			
		isListChanged = true;
	}
	//If branch list is not changed set newBranchList to null
	if(!isListChanged){
		vCorporateVendorIds = undefined;
	}
	return isListChanged;		
}

function isCorporateVendorListValid(){
	vResult = true;
	var obj;
	obj = $("#corporateVendorList");
	
	if(!$.trim(obj.val()).match(regexForCorporateVendorIds)){		
		vResult = false;	
	}
	
	if(vResult){
		
		obj.nextAll('span:first').hide();
		obj.addClass("validation-success");
		obj.removeClass("validation-error");
		numberOfValidFields ++;
	
	}else{
		
		obj.nextAll('span:first').show();
		obj.removeClass("validation-success");
		obj.addClass("validation-error");
		numberOfValidFields --;
	}
}

$(".validation-token").click(function() {
	$(".message").hide();
	if(showUpdateButton) {
		$("#update_corporate").show();	
	}
});

function isDuplicateAccountPresent(accountNumber) {
	
	var isDuplicateEntry = false;
	
	var accountList = accountNumber.split(",");
	
	var sortedAccountList = accountList.sort(function(o1, o2) {
		return parseInt($(o1).val()) - parseInt($(o2).val());
	});
	
	for(var i=0; i < sortedAccountList.length - 1; i++) {
		if(sortedAccountList[i] == sortedAccountList[i+1]) {
            
			isDuplicateEntry = true;
			break;
	
		}
	}
	
	return isDuplicateEntry;
}
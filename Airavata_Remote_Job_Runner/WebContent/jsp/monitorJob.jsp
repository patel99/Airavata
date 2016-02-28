<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="sec"
	uri="http://www.springframework.org/security/tags"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html style="min-height: 588px;" class="no-copy-paste">

<head>

<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<link rel="shortcut icon" href="img/tab_icon.png">
<title>Apache Airavata</title>
<meta
	content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
	name="viewport">

<link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="css/font-awesome.min.css">
<link rel="stylesheet" type="text/css"
	href="css/daterangepicker/daterangepicker-bs3.css" />
<link rel="stylesheet" type="text/css"
	href="css/datatables/dataTables.responsive.css">
<link rel="stylesheet" type="text/css"
	href="css/datatables/dataTables.bootstrap.css">
<link rel="stylesheet" type="text/css"
	href="css/skins/_all-skins.min.css">
<link rel="stylesheet" type="text/css" href="css/AdminLTE.css">
<link rel="stylesheet" type="text/css" href="css/dashboard.css">
<link rel="stylesheet" type="text/css" href="css/custom/overlay.css">

<script type="text/javascript">
	var STATUS_NAME_ERROR = "${status_error}";
	var STATUS_NAME_AUTHORIZED = "${status_authorized}";
	var STATUS_NAME_PENDING = "${status_pending}";
	var STATUS_NAME_REJECTED = "${status_rejected}";
	var STATUS_NAME_NO_AUTH_MATRIX_FOUND = "${status_no_auth_matrix_found}";

	var AUTH_TYPE_INTRA_CORP = "${auth_type_intra_corp}";
	var AUTH_TYPE_INTER_CORP = "${auth_type_inter_corp}";
	var AUTH_TYPE_BRANCH = "${auth_type_branch}";
	var AUTH_TYPE_NO_AUTHORIZATION = "${auth_type_no_authorization}";
</script>

</head>
<body class="skin-blue fixed pace-done sidebar-collapse"
	style="min-height: 588px;" oncontextmenu="return false">

	<script type="text/javascript">
		var aRole = '${aRole}';
	</script>
	<jsp:include page="static/header.jsp"></jsp:include>
	<div class="overlay connectedSortable hide"></div>
	<div class="overlay-body connectedSortable hide">
		<div class="file-name-header adjust-header-text">
			<!-- <div class="tab-close">
				<i class="btn-close fa fa-angle-right"></i>
			</div> -->
			<div class="row popup-header-text">
				<div class="col-md-12">
					<button id="close"
						class="btn btn-left btn-primary btn-group btn-action-margin-left info"
						data-placement="bottom" title="Close">
						<i class="fa fa-long-arrow-right"></i>
					</button>
					<label class="vertical-align-bottom ovelay-header">Create
						Job</label>
				</div>
			</div>
			<span id="message"></span>
		</div>
		<br />

		<div class="content">
<!-- 			<div class="row"> -->
<!-- 				<div class="col-sm-12"> -->
<!-- 					<div class="form-group"> -->

<!-- 						<label>No. of Nodes :</label> <input type="text" -->
<!-- 							class="form-control" id="noOfNodes" placeholder="Enter"> -->
<!-- 					</div> -->
<!-- 					<div class="form-group"> -->
<!-- 						<label>Wall time :</label> <input type="text" class="form-control" -->
<!-- 							id="wallTime" placeholder="Enter"> -->
<!-- 					</div> -->
<!-- 				</div> -->
<!-- 			</div> -->

			<div class="row-fluid row-content">
				<div class="row">
					<div class="col-md-12">
						<jsp:include page="bulkUploadPage.jsp"></jsp:include>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="wrapper row-offcanvas row-offcanvas-left"
		style="min-height: 268px;">

		<jsp:include page="static/leftPanel.jsp"></jsp:include>

		<aside class="right-side"> <section class="content-header">

		<br>
		<br>
		<button type="button" class="btn btn-primary open-overlay">Create
			Job</button>
		<h1>Jobs</h1>
		<div id="message" class="error hide"></div>
		<ol class="breadcrumb">
			<li><a href="test.htm"
				<sec:authentication var="principal" property="principal.username"/>><i
					class="fa fa-dashboard"></i> Home</a></li>
			<li class="active">Jobs</li>
		</ol>
		</section> <section class="content">
		<div class="box box-danger" id="loading-example">
			<div class="box-body no-padding">
				<div class="row">
					<div class="col-sm-12">
						<div class="scroll-right hide"></div>
						<div class="scroll-left hide"></div>
						<table id="jobList" class="table table-bordered table-hover">
							<thead>
								<tr>
									<th>Sr.</th>
									<th>Job Id</th>
									<th>User Name</th>
									<th>Queue Type</th>
									<th>Job Name</th>
									<th>Session Id</th>
									<th>Nodes</th>
									<th>#Tasks</th>
									<th>Memory</th>
									<th>Time</th>
									<th>Status</th>
									<th>Elapsed Time</th>
									<th>Action</th>
								</tr>
							</thead>
						</table>
					</div>
				</div>
			</div>
			<div class="box-footer"></div>
		</div>

		</section> </aside>

	</div>

	<!-- Modal For Alert-->
	<div id="alertModal" class="modal fade top-20">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-body">
					<button type="button" class="close" data-dismiss="modal">&times;</button>
					<div id="alertMsg"></div>
				</div>
				<div class="modal-footer">
					<button id="alertOkBtn" type="button" class="btn btn-primary">OK</button>
				</div>
			</div>
		</div>
	</div>
	<!-- Alert Modal end  -->

	<jsp:include page="static/footer.jsp"></jsp:include>

	<script id="template-upload" type="text/x-tmpl">
{% 
	var cnt = 0;
for (var i=0, file; file=o.files[i]; i++) { 
	cnt = $("#fileupload-tables > tbody > tr").length+1;
 	
%}
    <div class="template-upload fade">
		<div class="row">
       	 <div class="name col-sm-5"><span class="adjust-name"><b>{%=file.name%}</b></span></div>
         <div class="size col-sm-2"><span>{%=o.formatFileSize(file.size)%}</span></div>
        {% if (file.error) { %}
            <div class="error-fileUpload col-sm-5"><span class="label label-important background-red adjust-name">{%=locale.fileupload.error%}</span> {%=locale.fileupload.errors[file.error] || file.error%}</div>
		
        {% } else if (o.files.valid && !i) { %}
            <div>
                <div class="progress progress-success progress-sdiviped active button-hidden hide" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="bar" style="width:0%;"></div></div>
            </div>
			<div class="start hide">{% if (!o.options.autoUpload) { %}
                <button id="{%=cnt%}" class="btn btn-primary button-hidden">
                    <i class="icon-upload icon-white"></i>
                    <span>{%=locale.fileupload.start%}</span>
                </button>
            {% } %}</div>
        {% } else { %}
            <div ></div>
			<div ></div>
        {% } %}
        <div class="cancel hide">{% if (!i) { %}
            <button class="btn btn-warning button-hidden">
                <i class="icon-ban-circle icon-white"></i>
                <span>{%=locale.fileupload.cancel%}</span>
            </button>
        {% } %}
    </div>
   </div>
    <div class="row">
	<div class="col-sm-12">
		<div>
			<div class="span5 fileupload-progress fade">
				
							<div class="progress progress-success progress-sdiviped active" role="progressbar" aria-valuemin="0" aria-valuemax="100">
								<div class="bar"></div>
							</div>
							
							<div class="progress-extended">&nbsp;</div>
			</div>
         <div>
    </div>
			</div>
	</div>
{% } %}
</script>

	<script type="text/javascript" src="js/bootstrap.min.js"></script>
	<script type="text/javascript"
		src="js/plugins/daterangepicker/daterangepicker.js"></script>
	<script type="text/javascript"
		src="js/plugins/datatables/jquery.dataTables.js"></script>
	<script type="text/javascript"
		src="js/plugins/datatables/dataTables.responsive.js"></script>
	<script type="text/javascript"
		src="js/plugins/datatables/dataTables.bootstrap.js"></script>
	<script type="text/javascript"
		src="js/plugins/slimScroll/jquery.slimscroll.min.js"></script>
	<script type="text/javascript" src="js/AdminLTE/app.js"></script>
	<script type="text/javascript" src="js/jquery.confirm.min.js"></script>
	<script type="text/javascript" src="js/fnStandingRedraw.js"></script>
	<script type="text/javascript" src="js/jquery.blockui.js"></script>
	<script type="text/javascript" src="js/common.js"></script>
	<script type="text/javascript" src="js/custom/monitorJob.js"></script>
	<script type="text/javascript" src="js/custom/encrypt.js"></script>

	<script type="text/javascript" src="js/custom/detectmobilebrowser.js"></script>
	<script type="text/javascript" src="js/fileupload/jquery.ui.widget.js"></script>
	<script type="text/javascript" src="js/fileupload/jquery.fileupload.js"></script>
	<script type="text/javascript"
		src="js/fileupload/jquery.fileupload-fp.js"></script>
	<script type="text/javascript"
		src="js/fileupload/jquery.fileupload-ui.js"></script>
	<script type="text/javascript" src="js/fileupload/locale.scroll.js"></script>
</body>
</html>
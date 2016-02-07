<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<script type="text/javascript">

$( window ).load(function(event) {
	if(window.location.pathname == "/YBL-Auth/fileListing.htm"){
		window.history.pushState('page', 'Title', '/YBL-Auth/request-fileListing.htm');	
	}else if(window.location.pathname == "/YBL-Auth/fileAuthorization.htm"){
		window.history.pushState('page', 'Title', '/YBL-Auth/request-fileAuthorization.htm');
	}
	
});
	
function postLink(url){
	
	var zSessionId = "";
// 	if(!jQuery.browser.mobile){
// 		zSessionId = AppViewer.getUserMacro('__ZSID__');
// 	}else{
// 		zSessionId = R2FA4AHAJSI.getZRSessionId();
// 	}
	zSessionId = "12321312";
	$("#rTokenId").val(zSessionId);	
	document.getElementById('sideMenuForm').action = url;
	document.getElementById('sideMenuForm').submit();
}

</script>

<aside class="main-sidebar">
	<section class="sidebar">
	<form action="fileListing.htm" id="sideMenuForm" method="post">
		<ul class="sidebar-menu">
			<sec:authorize access="hasRole('ROLE_ADMIN')">
<!-- 				<li ><a
					href="fileSummary.htm" id="fileSummary">
						<i class="fa fa-file"></i> <span>File Summary</span>
				</a></li> -->
				<li><a
					href="branches.htm" id="branchView">
						<i class="fa fa-arrows-alt"></i> <span>Branch Management</span>
				</a></li>
				<li><a
					href="corporate.htm" id="corporateView">
						<i class="fa fa-th-large"></i> <span>Corporate Management</span>
				</a></li>
				<li ><a
					href="users.htm" id="userView">
						<i class="fa fa-user"></i> <span>User Registration</span>
				</a></li>
				<li ><a href="groupManagement.htm" id="groupManagementView">
						<i class="fa fa-sitemap"></i> <span>Group Management</span>
				</a></li>
				<li ><a href="authorizationMatrix.htm" id="authorizationMatrix">
						<i class="fa fa-table"></i> <span>Authorization Matrix</span>
				</a></li>
				<li ><a href="change-password.htm" id="changePasswordView">
						<i class="fa fa-key"></i> <span>Change Password</span>
				</a></li>
			</sec:authorize>
			<sec:authorize access="hasAnyRole('ROLE_SUPER_ADMIN')">
				<li ><a
					href="showDownloadFilePage.htm" id="DownloadFilePageView">
						<i class="fa fa-download"></i> <span>Download File</span>
				</a></li>
				<li ><a href="change-password.htm" id="changePasswordView">
						<i class="fa fa-key"></i> <span>Change Password</span>
				</a></li>
			</sec:authorize>
			<sec:authorize access="hasAnyRole('ROLE_CORPORATE_SUPER')">
				<li ><a
					href="javascript:;" onclick="postLink('fileListing.htm');" id="dashboardView">
						<i class="fa fa-file"></i> <span>File View</span>
				</a></li>
				<li ><a
					href="javascript:;" onclick="postLink('fileAuthorization.htm');" id="fileAuthView">
						<i class="fa fa-file"></i> <span>Authorize File</span>
				</a></li>
				 <input type="hidden" id="rTokenId" value="'+zSessionId+'" name="rTokenId"/>
        		<input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
			</sec:authorize>
		</ul>
	</form>
	</section>
</aside>
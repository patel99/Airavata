<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<head>
    <meta name="_csrf" content="${_csrf.token}"/>
	<!-- default header name is X-CSRF-TOKEN -->
    <meta name="_csrf_header" content="${_csrf.headerName}"/>
 </head>
<header class="main-header">
	<a class="logo">
		<img src="img/header_logo.png" class="logo-dimensions" alt="Logo Image" /> <!-- Add the class icon to your logo image or logo icon to add the margining -->
	</a>
	
	<nav class="navbar navbar-static-top" role="navigation">

		<sec:authorize access="hasAnyRole('ROLE_ADMIN','ROLE_SUPER_ADMIN', 'ROLE_CORPORATE_SUPER')">
		<a id="" href="#" title="Toggle sidebar" class="sidebar-toggle" data-toggle="offcanvas" role="button"> 
			<span class="txt-menu hide">Menu</span> 
		</a>
		</sec:authorize>
		<sec:authorize access="isAuthenticated()">
		<div class="navbar-custom-menu">
			<ul class="nav navbar-nav">
			
			<li class="dropdown tasks-menu open">
					<!-- <a href="logout.htm" class="btn btn-default btn-flat">Sign out</a> -->
				<li class="dropdown user user-menu">
					<a href="#" class="dropdown-toggle header-text user-info" data-toggle="dropdown"> 
						<i class="glyphicon glyphicon-user"></i> 
							<span><sec:authentication property="principal.username" /> <i class="caret"></i></span></a>
					<ul class="dropdown-menu">
						<li class="user-header bg-maroon">
<!-- 						<img src="img/avatar6.jpg" class="img-circle" alt="User Image" /> -->
							<p>
								<sec:authentication property="principal.username" /> - <sec:authentication property="principal.roles.roleName" /> 
							</p>
						</li>
						<sec:authorize access="hasAnyRole('ROLE_ADMIN','ROLE_SUPER_ADMIN')">
						<li class="user-footer">
						<c:url var="logoutUrl" value="/logout.htm"/>
							<form:form action="${logoutUrl}"
 								method="post"> 
 							<div class="pull-right">
								<input type="submit" class="btn bg-maroon btn-flat" value="Sign out" />
							</div>
 							</form:form>							
						</li>
						</sec:authorize>
					</ul>
				</li>
			</ul>
		</div>
		</sec:authorize>
<!-- 		<div class="navbar-right">
			<ul class="nav navbar-nav">
				<li class="dropdown user user-menu"><a id = "logout" href="logout.htm" 
					class="dropdown-toggle"> <i
						class="glyphicon glyphicon-user"></i> <span>Sign out</span>
				</a></li>
			</ul>
		</div> -->
	</nav>
	<div id = "page-alert" class="alert alert-dismissable pull-right hide">
<!--          <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> -->
         <span class = "page-message"></span>
    </div>
</header>
	<script type="text/javascript" src="js/jquery.min.js"></script>
	<script type="text/javascript" src="js/jquery-ui-1.10.3.min.js"></script>
	<script type="text/javascript" src="js/custom/detectmobilebrowser.js"></script>		
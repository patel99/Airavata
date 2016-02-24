<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
	<%@taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html oncontextmenu="return false" class="no-copy-paste">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<link rel="shortcut icon" href="img/ybl-favicon.ico">
<title>Airavata</title>
<meta
	content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
	name='viewport'>
<link href="css/bootstrap.min.css" rel="stylesheet" type="text/css" />
<link href="css/font-awesome.min.css" rel="stylesheet" type="text/css" />
<link href="css/AdminLTE.css" rel="stylesheet" type="text/css" />
<link href="css/dashboard.css" rel="stylesheet" type="text/css">
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/jquery-ui-1.10.3.min.js"></script>	
<script type="text/javascript" src="js/custom/detectmobilebrowser.js"></script>

</head>


<body class="login-page" >
    <div class="login-box">
      <div class="login-logo">
<!--         <a href="../../index2.html"><b>YBL</b></a> -->
        <img src="img/header_logo.png" class="logo-dimensions" alt="Logo Image" /> <!-- Add the class icon to your logo image or logo icon to add the margining -->
      </div><!-- /.login-logo -->
      <div class="login-box-body">
        <p class="login-box-msg">Sign in to start your session</p>
        <form:form name="loginform" action="j_spring_security_check" method="post" id="login-form" commandName="user">        
			<div class="body">
				<div class="form-group has-feedback">
		            <input type="text" name="j_username" id="j_username" class="form-control" placeholder="User ID" />
		            <span class="glyphicon glyphicon-user form-control-feedback"></span>
	          	</div>
				<div class="form-group has-feedback">
		            <input type="password" name="j_password" id="j_password" class="form-control" placeholder="Password" />
		            <span class="glyphicon glyphicon-lock form-control-feedback"></span>
	          	</div>
				<p id="error" style="width: 200px;color: red"></p>
			</div>
			<div class="footer">
				<button type="submit" class="btn bg-maroon btn-block" id="loginSubmit">Sign me in</button>
				<div class="footer">
					<div>Copyright © 2016 The Apache Software Foundation</div>
				</div>
			</div>
			
		</form:form>

      </div><!-- /.login-box-body -->
    </div><!-- /.login-box -->
</body>

	<script src="js/jquery.min.js" type="text/javascript"></script>
	<script src="js/bootstrap.min.js" type="text/javascript"></script>
	
	<script type="text/javascript" src="js/MD5.js" ></script>
	<script type="text/javascript" src="js/common.js"></script>
	<script src="js/custom/login.js" type="text/javascript"></script>

</body>
</html>
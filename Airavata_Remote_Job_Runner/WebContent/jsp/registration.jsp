<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
	<%@taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html oncontextmenu="return false" class="no-copy-paste">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<link rel="shortcut icon" href="img/tab_icon.png">
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


<body class="register-page" >

<div class="register-box">
	<div class="login-logo">
      <img src="img/header_logo.png" class="logo-dimensions" alt="Logo Image" /> <!-- Add the class icon to your logo image or logo icon to add the margining -->
    </div>
  <div class="register-box-body">
   
    <p class="login-box-msg">Register a new membership</p>

    <form id="registration-form" name="registration-form" action="register.htm" method="post">
      <div class="form-group has-feedback">
        <input type="text" id="username" name="username" class="form-control" placeholder="User Name">
        <span class="glyphicon glyphicon-user form-control-feedback"></span>
      </div>
      <div class="form-group has-feedback">
        <input type="password" id="password" name="password" class="form-control" placeholder="Password">
        <span class="glyphicon glyphicon-lock form-control-feedback"></span>
      </div>
      <div class="form-group has-feedback">
        <input type="password" id="passwordR" class="form-control" placeholder="Retype password">
        <span class="glyphicon glyphicon-log-in form-control-feedback"></span>
      </div>
      <p id="error" style="width: 200px;color: red">${error}</p>
      <div class="row">
        <!-- /.col -->
        <div class="col-xs-12">
          <button type="submit" class="btn btn-primary btn-block btn-flat">Register</button>
          <a href="login.htm" class="text-center">I already have a membership</a>
          <div class="footer">
					<div>Copyright © 2016 The Apache Software Foundation</div>
				</div>
        </div>
        <!-- /.col -->
      </div>
    </form>

    
  </div>
  <!-- /.form-box -->
</div>

</body>

	<script src="js/jquery.min.js" type="text/javascript"></script>
	<script src="js/bootstrap.min.js" type="text/javascript"></script>
	
	<script type="text/javascript" src="js/MD5.js" ></script>
	<script type="text/javascript" src="js/common.js"></script>
	<script src="js/custom/registration.js" type="text/javascript"></script>

</body>
</html>
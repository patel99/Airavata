package com.user.register.micro.endpoint;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserManagementController {

	@Autowired
	private UserManagementDaoService userManagementDaoService;

	@RequestMapping(value = "/userManagementService/addUser", method = RequestMethod.POST)
	public int addUser(HttpServletRequest request, HttpServletResponse response,
			@RequestParam("username") String username, @RequestParam("password") String password) {

		User user = new User();
		user.setUsername(username);
		user.setPassword(password);
		user.setRole("ROLE_USER");
		user.setEnabled(1);

		return userManagementDaoService.add(user);
	}

	@RequestMapping("/person")
	public User getPerson(@RequestParam(value = "id", required = true) Long id) {
		User u = new User();
		u.setUsername("Abhijit");
		return u;
	}
}

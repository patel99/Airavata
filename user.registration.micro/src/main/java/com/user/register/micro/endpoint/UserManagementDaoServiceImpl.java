package com.user.register.micro.endpoint;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

@Repository
@Service
@ComponentScan
public class UserManagementDaoServiceImpl implements UserManagementDaoService {

	private static final Logger LOGGER = LogManager.getLogger(UserManagementDaoServiceImpl.class);

	@Autowired
	private UserManagementRepository userManagementRepo;

	public int add(User user) {

		try {
			userManagementRepo.save(user);
		} catch (Exception e) {

			LOGGER.error("Error meesage", e);
			return 0;
		}

		return 1;
	}

}

package com.teamAlpha.airavata.repo;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.teamAlpha.airavata.domain.User;
import com.teamAlpha.airavata.service.JobManagementImpl;

@Repository
public class UserManagementRepoImpl implements UserManagementRepo{

	private static final Logger LOGGER = LogManager.getLogger(JobManagementImpl.class);
	
	
	@Autowired
	JdbcTemplate jdbcTemplate;

	@Autowired
	NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	private static final String INSERT_USER_DETAILS = " INSERT INTO job_details (user_id, username, password, role, enabled"
			+ " VALUES (:id, :username, :password, :role, :enabled)";
	
	@Override
	public int add(User user) {
		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("add() -> Saving user details. User Details : " + user.toString());
		}

		Map<String, Object> params = new HashMap<String, Object>();

		params.put("id", user.getId());
		params.put("username", user.getUsername());
		params.put("password", user.getPassword());
		params.put("role", user.getRole());
		params.put("enabled", user.isEnabled());
		

		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("add() -> Saving user details. User Details : " + user.toString() + ", SQL : "
					+ INSERT_USER_DETAILS);
		}

		int rowsInserted = namedParameterJdbcTemplate.update(INSERT_USER_DETAILS, params);
		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("add() -> User details saved. User Details : " + user.toString());
		}

		return rowsInserted;
	}

}

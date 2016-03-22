package com.teamAlpha.airavata.service;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.teamAlpha.airavata.domain.User;
import com.teamAlpha.airavata.exception.UserManagementException;
import com.teamAlpha.airavata.repo.UserManagementRepo;

@Service
public class UserManagementServiceImpl implements UserManagementService {

	private static final Logger LOGGER = LogManager.getLogger(JobManagementImpl.class);
	
	@Autowired
	UserManagementRepo userManagementRepo;
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
	public int add(User user) throws UserManagementException {
		if(LOGGER.isInfoEnabled()){LOGGER.info("add() -> Adding user. User : " + user.toString());}
		int rowInserted;
		try{
			rowInserted = userManagementRepo.add(user);
		}catch(DataAccessException e){
			if(e instanceof DuplicateKeyException){
				LOGGER.error("add() -> Error adding user. User : " + user.toString(), e);
				throw new UserManagementException("Username already exists.");
			}
			LOGGER.error("add() -> Error adding user. User : " + user.toString(), e);
			throw new UserManagementException("Error adding user.");
		}
		return rowInserted;
	}

}

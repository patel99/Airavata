package com.teamAlpha.airavata.service;

import com.teamAlpha.airavata.domain.User;
import com.teamAlpha.airavata.exception.UserManagementException;

public interface UserManagementService {

	int add(User user) throws UserManagementException;
}

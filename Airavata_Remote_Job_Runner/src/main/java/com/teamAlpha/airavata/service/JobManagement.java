package com.teamAlpha.airavata.service;

import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.exception.FileException;
import com.teamAlpha.airavata.exception.JobException;

public interface JobManagement {

	String submitJob() throws FileException, ConnectionException, JobException;
}

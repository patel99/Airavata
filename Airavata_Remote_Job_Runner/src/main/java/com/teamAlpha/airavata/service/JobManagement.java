package com.teamAlpha.airavata.service;

import java.io.File;
import java.io.IOException;
import java.util.List;

import com.jcraft.jsch.JSchException;
import com.teamAlpha.airavata.domain.JobDetails;
import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.exception.FileException;
import com.teamAlpha.airavata.exception.JobException;

public interface JobManagement {

	String submitJob() throws FileException, ConnectionException, JobException;

	String submitJob(File file, String pk, String passPhr) throws FileException, ConnectionException, JobException;

	List<JobDetails> monitorJob(String jobId, String pk, String passPhr)
			throws FileException, ConnectionException, JobException;
	
	String cancelJob(String jobID) throws FileException, ConnectionException, JobException;
}

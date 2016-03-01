package com.teamAlpha.airavata.service;

import java.io.File;
import java.io.InputStream;
import java.util.List;

import com.teamAlpha.airavata.domain.JobDetails;
import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.exception.FileException;
import com.teamAlpha.airavata.exception.JobException;

public interface JobManagement {

	String submitJob() throws FileException, ConnectionException, JobException;

	String submitJob(File file, int jobType, String pk, String passPhr, String noOfNodes, String procPerNode,String wallTime)
			throws FileException, ConnectionException, JobException;

	List<JobDetails> monitorJob(String pk, String passPhr) throws FileException, ConnectionException, JobException;

	String cancelJob(String jobID) throws FileException, ConnectionException, JobException;

	public InputStream downloadFile(String jobId, String status, String jobName)
			throws FileException, ConnectionException, JobException;
}

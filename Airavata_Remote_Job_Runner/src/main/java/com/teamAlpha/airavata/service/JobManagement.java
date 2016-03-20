package com.teamAlpha.airavata.service;

import java.io.File;
import java.io.InputStream;
import java.util.List;

import com.teamAlpha.airavata.domain.JobDetails;
import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.exception.FileException;
import com.teamAlpha.airavata.exception.JobException;

public interface JobManagement {


	String submitJob(File file, int hostType, int jobType, String pk, String passPhr, String noOfNodes, String procPerNode,String wallTime)
			throws FileException, ConnectionException, JobException;


	String cancelJob(String jobID, int hostType) throws FileException, ConnectionException, JobException;

	public InputStream downloadFile(String jobId, String status, String jobName, String jobFolder, int hostType)
			throws FileException, ConnectionException, JobException;

	List<JobDetails> monitorJob(String pk, String passPhr, String userName)
			throws FileException, ConnectionException, JobException;
}

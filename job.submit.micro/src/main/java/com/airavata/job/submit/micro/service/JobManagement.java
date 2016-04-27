package com.airavata.job.submit.micro.service;

import java.io.File;
import java.io.InputStream;
import java.util.List;

import com.airavata.job.submit.micro.entity.JobDetails;
import com.airavata.job.submit.micro.exception.ConnectionException;
import com.airavata.job.submit.micro.exception.FileException;
import com.airavata.job.submit.micro.exception.JobException;

public interface JobManagement {

	JobDetails submitJob(List<File> files, int hostType, int jobType, String pk, String passPhr, String noOfNodes,
			String procPerNode, String wallTime, String userName)
					throws FileException, ConnectionException, JobException;

}

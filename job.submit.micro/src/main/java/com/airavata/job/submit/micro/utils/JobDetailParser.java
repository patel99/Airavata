package com.airavata.job.submit.micro.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.airavata.job.submit.micro.entity.JobDetails;
import com.airavata.job.submit.micro.entity.Status;
import com.airavata.job.submit.micro.entity.User;

@Component
public class JobDetailParser {

	@Value("${status.last.header}")
	String lastHeader;

	private static final Logger LOGGER = LogManager.getLogger(JobDetailParser.class);

	public List<JobDetails> jobDataParser(String parseData) {

		List<JobDetails> jobs = new ArrayList<JobDetails>();

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("jobDetailParser() -> Parsing status details of submitted job. Job details : " + parseData);
		}
		if (parseData != null) {
			if (parseData.lastIndexOf(lastHeader) > 0) {
				parseData = parseData.substring(parseData.lastIndexOf(lastHeader) + 9);

			}
		}
		JobDetails jobDetails = null;
		if (parseData != null) {
			/*
			 * jobDetails = parseDetails(parseData); if(jobDetails.getId() !=
			 * null){ jobs.add(jobDetails); }
			 */
			jobs = parseDetails(parseData);
		}
		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("jobDetailParser() -> Successfully parsed status details of submitted job. Job details : "
					+ parseData);
		}
		return jobs;
	}

	private static List<JobDetails> parseDetails(String temp) {
		JobDetails job = new JobDetails();
		List<JobDetails> jobDetails = new ArrayList<JobDetails>();
		int index = 0;
		StringTokenizer st = new StringTokenizer(temp);
		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("parseDetails() -> Parsing status details of submitted job. Job details : " + temp);
		}
		System.out.println(st.countTokens());
		while (st.hasMoreTokens()) {

			switch (index) {
			case 0:
				job.setJobId(st.nextToken());
				break;
			case 1:
				User user = new User();
				user.setUsername(st.nextToken());
				job.setUser(user);
				break;
			case 2:
				job.setQueueType(st.nextToken());
				break;
			case 3:
				job.setJobName(st.nextToken());
				break;
			case 4:
				job.setSessionId(st.nextToken());
				break;
			case 5:
				job.setNodes(Integer.parseInt(st.nextToken()));
				break;
			case 6:
				job.setNoOfTasks(Integer.parseInt(st.nextToken()));
				break;
			case 7:
				job.setMemory(st.nextToken());
				break;
			case 8:
				job.setTime(st.nextToken());
				break;
			case 9:
				Status status = new Status();
				status.setValue(st.nextToken());
				job.setStatus(status);
				break;
			case 10:
				job.setElapsTime(st.nextToken());
				break;
			default:
				break;
			}
			index++;
			if (index == 11) {
				if (null != job && job.getJobId() != null) {
					jobDetails.add(job);
				}
				job = new JobDetails();
				index = 0;
			}
		}
		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("parseDetails() -> Successfully parsed status details of submitted job. Job details : "
					+ job.toString());
		}
		return jobDetails;
	}
}
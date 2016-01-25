package com.teamAlpha.airavata.utils;

import java.util.ArrayList;
import java.util.StringTokenizer;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.teamAlpha.airavata.domain.JobDetails;

@Component
public class JobDetailParser {

	
	@Value("${status.last.header}")
	String lastHeader;
	
	private static final Logger LOGGER = LogManager.getLogger(JobDetailParser.class);

	private static ArrayList<JobDetails> jobs = new ArrayList<JobDetails>();

	public ArrayList<JobDetails> jobDataParser(String parseData) {

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("jobDetailParser() -> Parsing status details of submitted job. Job details : " + parseData);
		}
		if (parseData != null) {
			if (parseData.lastIndexOf(lastHeader) > 0) {
				parseData = parseData.substring(parseData.lastIndexOf(lastHeader) + 9);

			}
		}
		if (parseData != null) {
			jobs.add(parseDetails(parseData));
		}
		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("jobDetailParser() -> Successfully parsed status details of submitted job. Job details : "
					+ parseData);
		}
		return jobs;
	}

	private static JobDetails parseDetails(String temp) {
		JobDetails job = new JobDetails();
		int index = 0;
		StringTokenizer st = new StringTokenizer(temp);
		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("parseDetails() -> Parsing status details of submitted job. Job details : " + temp);
		}
		while (st.hasMoreTokens()) {
			switch (index) {
			case 0:
				job.setId(st.nextToken());
				break;
			case 1:
				job.setUserName(st.nextToken());
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
				job.setNodes(st.nextToken());
				break;
			case 6:
				job.setNoOfTasks(st.nextToken());
				break;
			case 7:
				job.setMemory(st.nextToken());
				break;
			case 8:
				job.setTime(st.nextToken());
				break;
			case 9:
				job.setStatus(st.nextToken());
				break;
			case 10:
				job.setElapTime(st.nextToken());
				break;
			default:
				break;
			}
			index++;
		}
		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("parseDetails() -> Successfully parsed status details of submitted job. Job details : " + job.toString());
		}
		return job;
	}
}
package com.teamAlpha.airavata.repo;

import java.util.List;

import com.teamAlpha.airavata.domain.JobDetails;

public interface JobRepo {
	
	int add(JobDetails jobDetails);
	
	int changeStatus(String id, int status);
	
	List<JobDetails> getJobs(int userId);
	
	
}

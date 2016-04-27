package com.sample.job.retrieval.micro;

import java.util.List;

public interface JobRetrievalDaoService {

	List<JobDetails> retriveJobs(String userId);
}

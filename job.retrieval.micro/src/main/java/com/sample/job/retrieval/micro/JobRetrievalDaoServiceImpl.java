package com.sample.job.retrieval.micro;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

@Repository
@Service
@ComponentScan
public class JobRetrievalDaoServiceImpl implements JobRetrievalDaoService {

	@Autowired
	private JobRetrievalRepository jobRetrievalRepository;
	public List<JobDetails> retriveJobs(String userName) {

		List<JobDetails> jobDetailsList = jobRetrievalRepository.findJobDetailsByUser(userName);
		return jobDetailsList;
	}

}

package com.airavata.job.db.save.micro.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import com.airavata.job.db.save.micro.entity.JobDetails;
import com.airavata.job.db.save.micro.repository.JobDbSaveRepository;

@Repository
@Service
@ComponentScan
public class JobSaveServiceImpl implements JobSaveService {

	@Autowired
	private JobDbSaveRepository jobDbSaveRepository;
	
	public int saveJobDetails(JobDetails jobDetails) {
			
		try {
			
			jobDbSaveRepository.save(jobDetails);
		} catch (Exception e) {
			// TODO: handle exception
			
			return 0;
		}
		return 1;
	}

}

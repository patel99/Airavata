package com.airavata.job.db.save.micro.repository;

import org.springframework.data.repository.CrudRepository;

import com.airavata.job.db.save.micro.entity.JobDetails;

public interface JobDbSaveRepository extends CrudRepository<JobDetails, Integer> {

}

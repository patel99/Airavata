package com.sample.job.retrieval.micro;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRetrievalRepository extends CrudRepository<JobDetails, Integer> {

	@Query("Select j from job_details j " + "where j.user.username=:username and 1=1 ORDER BY j.insts DESC")
	public List<JobDetails> findJobDetailsByUser(@Param("username") String username);

}

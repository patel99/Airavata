package com.airavata.job.db.save.micro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

import com.airavata.job.db.save.micro.entity.JobDetails;
import com.google.gson.Gson;

@ComponentScan
@EnableAutoConfiguration
public class JobSaveMicrServiceEndPoint {

	public static void main(String[] args) {

		SpringApplication.run(JobSaveMicrServiceEndPoint.class, args);
		
	}

}

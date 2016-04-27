package com.airavata.job.db.save.micro.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.airavata.job.db.save.micro.entity.JobDetails;
import com.airavata.job.db.save.micro.service.JobSaveService;
import com.google.gson.Gson;


@RestController
public class JobDbSaveController {

	@Autowired
	private JobSaveService jobSaveService;
	
	@RequestMapping(value = "/jobSaveService/saveJob", method = RequestMethod.POST)
	public int addUser(HttpServletRequest request, HttpServletResponse response,
			@RequestParam("job") String jobJson) {

		Gson gson = new Gson();
		
		JobDetails jobDetails = gson.fromJson(jobJson, JobDetails.class);
		return jobSaveService.saveJobDetails(jobDetails);
	}

	
}

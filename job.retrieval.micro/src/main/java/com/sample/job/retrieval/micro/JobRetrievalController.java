package com.sample.job.retrieval.micro;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class JobRetrievalController {

	@Autowired
	private JobRetrievalDaoService jobRetrievalDaoService;
	
	@RequestMapping(value = "/jobManagementService/retrievJobs", method = RequestMethod.POST)
	@Produces(MediaType.APPLICATION_JSON)
	public List<JobDetails> addUser(HttpServletRequest request, HttpServletResponse response,
			@RequestParam("username") String username) {

		return jobRetrievalDaoService.retriveJobs(username);
	}

	@RequestMapping("/getJobs")
	public List<JobDetails> getJobs(@RequestParam(value = "id", required = true) String name) {
		
		return jobRetrievalDaoService.retriveJobs(name);
	}

}

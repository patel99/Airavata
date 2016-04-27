package com.airavata.job.submit.micro.rest;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.airavata.job.submit.micro.entity.JobDetails;
import com.airavata.job.submit.micro.exception.ConnectionException;
import com.airavata.job.submit.micro.exception.FileException;
import com.airavata.job.submit.micro.exception.JobException;
import com.airavata.job.submit.micro.service.JobManagement;
import com.airavata.job.submit.micro.utils.FileUtils;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

@RestController
public class JobSubmissionController {

	private static final Logger LOGGER = LogManager.getLogger(JobSubmissionController.class);

	@Value("${private.key.path}")
	String privateKeyPath;

	@Value("${private.key.passphrase}")
	String privateKeyPassphrase;

	@Autowired
	private JobManagement jobManagementService;

	@RequestMapping(value = "/jobSubmissionService/submitJobs", method = RequestMethod.POST)
	@Produces(MediaType.APPLICATION_JSON)
	public JobDetails submitJob(HttpServletRequest request, HttpServletResponse response,
			@RequestParam("file") MultipartFile[] multipartFile, @RequestParam("hostType") int hostType,
			@RequestParam("jobType") int jobType, @RequestParam("noOfNodes") String noOfNodes,
			@RequestParam("procPerNode") String procPerNode, @RequestParam("wallTime") String wallTime,
			@RequestParam("user") String user) {

		JobDetails jobDetails = null;

		try {
			// writer = response.getWriter();
			List<File> files = new ArrayList<File>();
			for (MultipartFile mf : multipartFile) {
				if (mf.getSize() > 0) {
					files.add(FileUtils.getFileFromMultipartFile(mf));
				}
			}

			jobDetails = jobManagementService.submitJob(files, hostType, jobType, privateKeyPath, privateKeyPassphrase,
					noOfNodes, procPerNode, wallTime, user);

		} catch (IOException e) {
			LOGGER.error("Error uploading file", e);
		} catch (FileException e) {
			LOGGER.error("Error uploading file", e);
		} catch (ConnectionException e) {
			LOGGER.error("Error uploading file", e);
		} catch (JobException e) {
			LOGGER.error("Error uploading file", e);
		} finally {

		}

		return jobDetails;
	}

}

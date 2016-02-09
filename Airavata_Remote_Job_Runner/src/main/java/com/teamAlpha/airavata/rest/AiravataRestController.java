package com.teamAlpha.airavata.rest;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.teamAlpha.airavata.domain.JobDetails;
import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.exception.FileException;
import com.teamAlpha.airavata.exception.JobException;
import com.teamAlpha.airavata.service.JobManagement;
import com.teamAlpha.airavata.utils.FileUtils;

@Controller
public class AiravataRestController {

	private static final Logger LOGGER = Logger.getLogger(AiravataRestController.class);

	@Value("${private.key.path}")
	String privateKeyPath;

	@Value("${private.key.passphrase}")
	String privateKeyPassphrase;

	@Autowired
	private JobManagement jobManagementService;

	@RequestMapping(value = { "applet.htm" }, method = RequestMethod.GET)
	public ModelAndView showApplet() {

		ModelAndView modelAndView = new ModelAndView("applet");

		return modelAndView;
	}

	@RequestMapping(value = { "login.htm" }, method = RequestMethod.GET)
	public ModelAndView showLogin() {

		ModelAndView modelAndView = new ModelAndView("login");

		return modelAndView;
	}

	@RequestMapping(value = { "test.htm" }, method = RequestMethod.GET)
	public ModelAndView showAuthorizationMatrix() {

		ModelAndView modelAndView = new ModelAndView("monitorJob");

		return modelAndView;
	}

	@RequestMapping(value = { "uploadJob.htm" }, method = RequestMethod.POST)
	@Produces(MediaType.APPLICATION_JSON)
	public @ResponseBody String uploadUsersFile(HttpServletRequest request, HttpServletResponse response,
			@RequestParam("file") MultipartFile multipartFile) {

		String resp = "";
		try {
			File file = FileUtils.getFileFromMultipartFile(multipartFile);
			String jobId = jobManagementService.submitJob(file, privateKeyPath, privateKeyPassphrase);
			resp = jobId;

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (FileException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ConnectionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JobException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return resp;

	}

	@RequestMapping(value = { "cancelJob.htm" }, method = RequestMethod.POST)
	public @ResponseBody String getCancelJobStatus(HttpServletRequest request, HttpServletResponse response,
			@RequestParam("jobId") String jobId) {
		Gson gson = new Gson();
		JsonObject jsonResponse = new JsonObject();
		try {
			jsonResponse.add("Cancel Status", gson.toJsonTree(jobManagementService.cancelJob(jobId)));
		} catch (Exception e) {

			jsonResponse.addProperty("isError", true);
			jsonResponse.addProperty("message", e.getMessage());
		}
		response.setContentType("application/Json");

		return jsonResponse.toString();
	}

	/*
	 * @RequestMapping(value = { "getJobs.htm" }, method = RequestMethod.GET)
	 * public @ResponseBody String getAuthorizationMatrix(HttpServletResponse
	 * response) {
	 * 
	 * Gson gson = new Gson(); JsonObject jsonResponse = new JsonObject();
	 * List<JobDetails> jobs = new ArrayList<JobDetails>(); JobDetails b = new
	 * JobDetails(); try { jobs = b.get(); jsonResponse.add("aaData",
	 * gson.toJsonTree(jobs)); } catch (Exception e) {
	 * 
	 * jsonResponse.addProperty("isError", true);
	 * jsonResponse.addProperty("message", e.getMessage()); }
	 * 
	 * response.setContentType("application/Json");
	 * 
	 * return jsonResponse.toString(); }
	 */
	@POST
	@RequestMapping("getJobs.htm")
	@Produces(MediaType.APPLICATION_JSON)
	public @ResponseBody String monitorJobs() {

		List<JobDetails> jobDetailsList = new ArrayList<JobDetails>();
		Gson gson = new Gson();
		JsonObject jsonResponse = new JsonObject();
		JobDetails jobDetails = new JobDetails();
		try {
			jobDetailsList = jobManagementService.monitorJob(privateKeyPath, privateKeyPassphrase);

			jsonResponse.add("aaData", gson.toJsonTree(jobDetailsList));
		} catch (FileException | ConnectionException | JobException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return jsonResponse.toString();

	}

}

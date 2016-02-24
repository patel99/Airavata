package com.teamAlpha.airavata.rest;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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
import com.google.gson.JsonArray;
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
	public @ResponseBody void uploadUsersFile(HttpServletRequest request, HttpServletResponse response,
			@RequestParam("file") MultipartFile multipartFile) {

		PrintWriter writer = null;
		JsonArray json = null;
		JsonObject jsono = new JsonObject();
		try {
			writer = response.getWriter();
			File file = FileUtils.getFileFromMultipartFile(multipartFile);
			String jobId = jobManagementService.submitJob(file, privateKeyPath, privateKeyPassphrase);
			jsono.addProperty("name", file.getName());
			jsono.addProperty("size", multipartFile.getSize());
			jsono.addProperty("isFileErrored", false);
			json = new JsonArray();
			json.add(jsono);
		} catch (IOException e) {
			LOGGER.error("Error uploading file");
		} catch (FileException e) {
			LOGGER.error("Error uploading file");
		} catch (ConnectionException e) {
			LOGGER.error("Error uploading file");
		} catch (JobException e) {
			LOGGER.error("Error uploading file");
		}finally {
			if(null == json || json.size()==0){
				jsono.addProperty("name", multipartFile.getOriginalFilename());
				jsono.addProperty("size", multipartFile.getSize());
				jsono.addProperty("isFileErrored", true);
				jsono.addProperty("errorMessage", "File upload failed.");
				if(null == json){
					json = new JsonArray();
				}
				json.add(jsono);
			}
			if (request.getHeader("accept").indexOf("application/json") == -1){
//				writer.write(StringEscapeUtils.escapeHtml(json.toString()));
				response.setHeader("X-Frame-Options", "SAMEORIGIN");
			}else{
				writer.write(json.toString());	
			}
			writer.close();
		}
	}


	@RequestMapping(value = { "cancelJob.htm" }, method = RequestMethod.POST)
	public @ResponseBody String getCancelJobStatus(HttpServletRequest request, HttpServletResponse response,
			@RequestParam("jobId") String jobId) {

		JsonObject jsonResponse = new JsonObject();
		String message = null;
		try {
			if (LOGGER.isInfoEnabled()) {
				LOGGER.info("cancelJob() -> Cancelling Job. Job Id : " + jobId);
			}

			message = jobManagementService.cancelJob(jobId);

			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("cancelJob() ->Job cancelled. Job Id : " + jobId);
			}
			jsonResponse.addProperty("message", message);
		} catch (JobException e) {
			LOGGER.error("getCancelJobStatus() -> Error cancelling job. Job Id : " + jobId, e);
			jsonResponse.addProperty("isError", true);
			jsonResponse.addProperty("message", e.getMessage());
		} catch (FileException e) {
			LOGGER.error("getCancelJobStatus() -> Error cancelling job. Job Id : " + jobId, e);
			jsonResponse.addProperty("isError", true);
			jsonResponse.addProperty("message", e.getMessage());
		} catch (ConnectionException e) {
			LOGGER.error("getCancelJobStatus() -> Error cancelling job. Job Id : " + jobId, e);
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
		try {
			jobDetailsList = jobManagementService.monitorJob(privateKeyPath, privateKeyPassphrase);

			jsonResponse.add("aaData", gson.toJsonTree(jobDetailsList));
		} catch (FileException | ConnectionException | JobException e) {
			LOGGER.error("Error monitoring job.", e);
		}
		return jsonResponse.toString();

	}


	@RequestMapping(value = { "getFile.htm" }, method = RequestMethod.GET)
	public @ResponseBody void getFile(HttpServletRequest request, HttpServletResponse response,
			@RequestParam(value = "jobId", required = true) String jobId,
			@RequestParam(value = "status", required = true) String status){

		InputStream fis = null;
		ByteArrayOutputStream bos = null;
		bos = new ByteArrayOutputStream();
		int readNum;
		byte[] buf = new byte[1024];
		if(LOGGER.isInfoEnabled()){LOGGER.info("getFile() -> Fetching output file. Job Id : " + jobId);}
		try {
			fis = jobManagementService.downloadFile(jobId, status);
			if(fis == null){
				throw new JobException("Null stream");
			}
			for (; (readNum = fis.read(buf)) != -1;) {
				bos.write(buf, 0, readNum);
			}
			ServletOutputStream out = response.getOutputStream();
			bos.writeTo(out);
			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("getFile() -> File downlaoded. JobId : " + jobId + ", Status : " + status);
			}
		} catch (IOException e) {
			LOGGER.error("getFile() ->  Error downloading file", e);
		} catch (FileException e) {
			LOGGER.error("getFile() ->  Error downloading file", e);
		} catch (ConnectionException e) {
			LOGGER.error("getFile() ->  Error downloading file", e);
		} catch (JobException e) {
			LOGGER.error("getFile() ->  Error downloading file", e);
		} finally {

			response.setHeader("Content-Disposition", "attachment;filename=output." + jobId + ".txt");
			try {
				bos.flush();
				bos.close();
			} catch (IOException e) {
				LOGGER.error("getFile() ->  Error downloading file", e);
			}
			
		}

	}

}

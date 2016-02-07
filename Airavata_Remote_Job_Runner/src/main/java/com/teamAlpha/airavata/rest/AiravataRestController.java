package com.teamAlpha.airavata.rest;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.ws.WebServiceException;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.servlet.ModelAndView;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.teamAlpha.airavata.domain.JobDetails;

@Controller
public class AiravataRestController {
	
	private static final Logger LOGGER = Logger.getLogger(AiravataRestController.class);

	
	@RequestMapping(value = {"applet.htm"}, method = RequestMethod.GET)
	  public ModelAndView showApplet(){

	    ModelAndView modelAndView = new ModelAndView("applet"); 
	    
	    return modelAndView;
	  }
	
	
	@RequestMapping(value = {"login.htm"}, method = RequestMethod.GET)
	  public ModelAndView showLogin(){

	    ModelAndView modelAndView = new ModelAndView("login"); 
	    
	    return modelAndView;
	  }
	
	@RequestMapping(value = {"test.htm"}, method = RequestMethod.GET)
	  public ModelAndView showAuthorizationMatrix(){

	    ModelAndView modelAndView = new ModelAndView("monitorJob"); 
	    
	    return modelAndView;
	  }
	
	@RequestMapping(value = { "uploadJob.htm" }, method = RequestMethod.POST)
	public void uploadUsersFile(
			HttpServletRequest request, 
			HttpServletResponse response, 
			@RequestParam("file") MultipartFile file) {
		
		long displayedFileSize = file.getSize();
		
		boolean isChunkFile = false;
		long fileSize = 0;
		String fileName = "";
		int chunkIndex = 0; 
		
		if(request.getHeader("X-File-Size") != null)
		{
			isChunkFile = true;
			fileSize = Long.parseLong(request.getHeader("X-File-Size").toString());
			fileName = request.getHeader("X-File-Name").toString();
			displayedFileSize = fileSize;
			chunkIndex = Integer.parseInt(request.getHeader("X-File-ChunkIndex"));
		}
		
		CommonsMultipartFile uploadedFile = null;
		PrintWriter writer = null;
		JsonArray json = null;
		JsonObject jsono = new JsonObject();
		
		String errorMessage = null;
		try {
			
			writer = response.getWriter();
			
			if (request.getHeader("accept").indexOf("application/json") != -1) {
				response.setContentType("application/json");
			} else {
				// IE workaround
				response.setContentType("text/html");
			}
			json = new JsonArray();

			
			uploadedFile = (CommonsMultipartFile) file;
			
			if(isChunkFile){
				jsono.addProperty("name", fileName);
				jsono.addProperty("size", fileSize);
			}else{
				jsono.addProperty("name", file.getOriginalFilename());
				jsono.addProperty("size", file.getSize());
			}
			jsono.addProperty("isFileErrored", false);
			json.add(jsono);

		} catch (WebServiceException e) {
		    errorMessage = e.getMessage();
            LOGGER.error("uploadUsersFile - > " + e.getMessage(), e);
	      
	    } catch (IOException e) {
			LOGGER.error("uploadUsersFile - > " + e.getMessage(), e);
		} finally {
			if(null == json || json.size()==0){
				jsono.addProperty("name", file.getOriginalFilename());
				jsono.addProperty("size", displayedFileSize);
				jsono.addProperty("isFileErrored", true);
				if(null == errorMessage){
					jsono.addProperty("errorMessage", "File upload failed.");
				}else{
					jsono.addProperty("errorMessage", errorMessage);
				}
				if(null == json){
					json = new JsonArray();
				}
				json.add(jsono);
			}
			writer.close();
		}
	}
	
	@RequestMapping(value = { "getJobs.htm" }, method = RequestMethod.GET)
	public @ResponseBody String getAuthorizationMatrix(HttpServletResponse response) {

		Gson gson = new Gson();
		JsonObject jsonResponse = new JsonObject();
		List<JobDetails> jobs = new ArrayList<JobDetails>();
		JobDetails b = new JobDetails();
		try {
			jobs = b.get();
			jsonResponse.add("aaData", gson.toJsonTree(jobs));
		} catch (Exception e) {

			jsonResponse.addProperty("isError", true);
			jsonResponse.addProperty("message", e.getMessage());
		}

		response.setContentType("application/Json");

		return jsonResponse.toString();
	}
}

package com.teamAlpha.airavata.rest;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
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

	private static String PK = "PuTTY-User-Key-File-2: ssh-rsa\n" + 
			"Encryption: none\n" 
			+ "Comment: rsa-key-20160118\n"
			+ "Public-Lines: 4\n" 
			+ "AAAAB3NzaC1yc2EAAAABJQAAAIEAgv/GLY+fde18owLclyUy3izCBiKBYGyJqfZZ\n"
			+ "F6nCLvBVlJjHyOEvnXOBcA2Jb0PT/T8TlJmAnHtZ1nCONcQH3ZTz64ns+NwKq11F\n"
			+ "N0k1BHjFclK/tRbU6URS91sjyOq70VS/l4tDuISNcIQ+3cFrLG0vsooHouLnyZCs\n" 
			+ "xynUPRE=\n" 
			+ "Private-Lines: 8\n"
			+ "AAAAgHhgqEWK5Y716CcXYuvBUVaJ/maAko/1COFe6hW+lsNZY2X0LTUh9Gcr3rn+\n"
			+ "mfeKb8YeSVgeWoH0zxgUZwD5U1SqN63abfjhPLrJCAW4mGB9na2Ww2m69GCppw4d\n"
			+ "DA9koBJR4h9cjuywKOgpwzlg67vqSQUGBPK659iGaQMFc67VAAAAQQDUdQEKNFrS\n"
			+ "Xc7fu364vsMrQou38WCCZg9QDiycEkbTqwflHV8GMF4hUjxHYEqaClg0aWzxwIr1\n"
			+ "pJPBxaTl9YQfAAAAQQCd2OmKfS1QzKfP8e6S333x/PT+RPgbzlKlDv8m/NrAJlsl\n"
			+ "lY7cle9nSuxLqD4fybTm/la3X9OLRuhLsRdypJjPAAAAQQDR4XxSajhT1crnXhv8\n"
			+ "5TUPKt3FCuKOngdbgtKvvFCxuKNwvBzU3psOk+xm1b57N+p8PkngCMDAmKWi5mYf" 
			+ "sA1z\n"
			+ "Private-MAC: 0ca92a2f5890fa775a277837aa26ef6e3dff8f2e";

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
	public @ResponseBody String uploadUsersFile(HttpServletRequest request, HttpServletResponse response,
			@RequestParam("file") MultipartFile multipartFile) {

		String resp = "";
		try {
			File file = FileUtils.getFileFromMultipartFile(multipartFile);
			File pkfile = File.createTempFile("temp_pk", ".ppk");
			FileWriter fileWriter = new FileWriter(pkfile);
			fileWriter.write(PK);
			fileWriter.flush();
			fileWriter.close();
			String jobId = jobManagementService.submitJob(file, "E:\\DEV\\putty\\SGA\\putty_private_key.ppk", "");

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

		return null;

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

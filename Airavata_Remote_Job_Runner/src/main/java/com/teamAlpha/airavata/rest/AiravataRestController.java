package com.teamAlpha.airavata.rest;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/TestRun")
public class AiravataRestController {

	@GET
	@RequestMapping("/Test")
	@Produces(MediaType.TEXT_HTML)
	public String processREquest() {
		System.out.println("Testing");
		return "Test";
	}
}

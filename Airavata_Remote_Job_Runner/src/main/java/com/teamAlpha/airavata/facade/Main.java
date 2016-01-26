package com.teamAlpha.airavata.facade;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.stereotype.Component;

import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.exception.FileException;
import com.teamAlpha.airavata.exception.JobException;
import com.teamAlpha.airavata.service.JobManagement;

@Component
public class Main {

	@Autowired
	JobManagement jobManagement;

	private static final Logger LOGGER = LogManager.getLogger(Main.class);

	/**
	 * Entry point
	 * @param args
	 * @throws ConnectionException
	 */
	public static void main(String[] args) throws ConnectionException {
		AbstractApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
		Main main = (Main) context.getBean(Main.class);
		context.close();
		main.monitor();
	}

	/**
	 * Monitor Job
	 * @return
	 * @throws ConnectionException
	 */
	boolean monitor() throws ConnectionException {
		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("monitor() -> Submit and monitor job.");
		}
		try {

			String data = jobManagement.submitJob();
			if (LOGGER.isInfoEnabled()) {
				LOGGER.info("monitor() -> Received result from server. Output : " + data);
			}
			System.out.println(data);
		} catch (FileException e) {
			LOGGER.error(e.getMessage());
		} catch (JobException e) {
			LOGGER.error(e.getMessage());
		}
		return true;
	}

}

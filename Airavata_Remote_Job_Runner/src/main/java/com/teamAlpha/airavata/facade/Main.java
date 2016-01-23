package com.teamAlpha.airavata.facade;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.stereotype.Component;

import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.exception.FileException;
import com.teamAlpha.airavata.exception.JobException;
import com.teamAlpha.airavata.service.JobManagement;

@Component

public class Main {

	@Value("${private.key.path}")
	String privateKeyPath;

	@Value("${private.key.passphrase}")
	String privateKeyPassphrase;

	@Value("${user.name}")
	String userName;

	@Value("${host.id}")
	String hostId;

	@Value("${host.port}")
	int hostPort;

	@Autowired
	JobManagement jobManagement;

	private static final Logger LOGGER = LogManager.getLogger(Main.class);

	public static void main(String[] args) throws ConnectionException {
		AbstractApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
		Main main = (Main) context.getBean(Main.class);
		context.close();
		main.monitor();
	}

	/*
	 * Demonstrate how to use Connection interface
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

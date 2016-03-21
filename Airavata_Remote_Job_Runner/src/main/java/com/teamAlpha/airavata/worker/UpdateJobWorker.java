package com.teamAlpha.airavata.worker;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.exception.FileException;
import com.teamAlpha.airavata.exception.JobException;
import com.teamAlpha.airavata.service.JobManagement;
import com.teamAlpha.airavata.utils.Constants;

@Component
public class UpdateJobWorker {

	private static final Logger LOGGER = Logger.getLogger(UpdateJobWorker.class);

	@Value("${private.key.path}")
	String privateKeyPath;

	@Value("${private.key.passphrase}")
	String privateKeyPassphrase;

	@Value("${user.name}")
	String userName;
	
	@Value("${host.karst.id}")
	String karstHost;
	
	@Value("${host.bigred2.id}")
	String bigred2Host;

	@Autowired
	JobManagement jobManagement;

	private final ExecutorService threadPool = Executors.newFixedThreadPool(1);

	public void init() {
		LOGGER.info("Initialize Update Job Worker Thread");
		Constants.setStatusMap();
		Constants.setTypeMap();
		threadPool.execute(new UpdateJobWorkerThread());
	}

	private class UpdateJobWorkerThread implements Runnable {

		@Override
		public void run() {
			// TODO Auto-generated method stub
			if (LOGGER.isInfoEnabled()) {
				LOGGER.info("run() UpdateJobWorkerThread -> Updating job details.");
			}

			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("run() UpdateJobWorkerThread -> Updating job details.");
			}

			while (true) {

				try {

					jobManagement.monitorJob(privateKeyPath, privateKeyPassphrase, userName, karstHost);
					jobManagement.monitorJob(privateKeyPath, privateKeyPassphrase, userName, bigred2Host);
					
				} catch (FileException | ConnectionException | JobException e) {
					LOGGER.error("Error updating job.", e);
				}
				
				if (LOGGER.isDebugEnabled()) {
					LOGGER.debug("run() UpdateJobWorkerThread -> Job Details Updated.");
				}
				try {
					Thread.sleep(60*1000);
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			

		}

	}

}

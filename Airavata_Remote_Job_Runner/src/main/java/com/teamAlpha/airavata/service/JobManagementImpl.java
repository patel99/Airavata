package com.teamAlpha.airavata.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import com.teamAlpha.airavata.domain.ConnectionEssential;
import com.teamAlpha.airavata.domain.JobDetails;
import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.exception.FileException;
import com.teamAlpha.airavata.exception.JobException;
import com.teamAlpha.airavata.net.Connection;
import com.teamAlpha.airavata.utils.JobDetailParser;
import com.teamAlpha.airavata.utils.Utilities;

@Component
public class JobManagementImpl implements JobManagement {

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

	@Value("${user.job.file.name}")
	String fileName;

	@Value("${user.job.file.path}")
	String filePath;

	@Value("${user.job.remotefile.path}")
	String remoteFilePath;

	@Value("${job.status.completed}")
	String completedStatus;

	@Value("${retry.time.interval}")
	int retryTimeInterval;

	@Value("${max.retry.attempts}")
	int maxRetryAttempts;

	@Autowired
	FileManagement fileManagement;
	@Autowired
	Connection connection;

	private static final Logger LOGGER = LogManager.getLogger(JobManagementImpl.class);

	@Override
	public String submitJob() throws FileException, ConnectionException, JobException {
		
		ConnectionEssential connectionParameters = new ConnectionEssential();
		connectionParameters.setHost(hostId);
		connectionParameters.setUser(userName);
		connectionParameters.setPort(hostPort);
		
		connectionParameters.setPkFilePath(privateKeyPath);
		connectionParameters.setPkPassphrase(privateKeyPassphrase);
		
		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;
		
		Session s = null;
		String dataFromServer = null;

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("submitJob() -> Submit job to server queue.");
		}

		try {
			s = connection.getSession(connectionParameters);
			sftpChannel = connection.getSftpChannel(s);
			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("getSftpChannel() -> Channel created successfully.");
			}

			fileManagement.putFile(filePath + fileName, remoteFilePath, sftpChannel);
			sftpChannel.disconnect();

			execChannel = connection.getExecChannel(s);

			execChannel.setCommand(
					" cd /N/dc2/scratch/adhamnas/job-submission \n mpicc hello.c -o hello.out \n dos2unix pbs.sh \n qsub pbs.sh");

			execChannel.setInputStream(null);
			execChannel.setErrStream(System.err);

			InputStream in = execChannel.getInputStream();
			execChannel.connect();

			String jobId = Utilities.getStringFromIS(in);
			execChannel.disconnect();

			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("getSftpChannel() -> Get job status. Job Id : " + jobId);
			}

			String jobStatus = getJobStatus(jobId, execChannel, s);
			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("getSftpChannel() -> Job status received. Job Id : " + jobId + ", Status : " + jobStatus);
			}

			if (null != jobStatus && jobStatus.equalsIgnoreCase(completedStatus)) {
				execChannel = connection.getExecChannel(s);
				execChannel.setCommand(" cd /N/dc2/scratch/adhamnas/job-submission \n cat pbs.sh.o"
						+ jobId.substring(0, jobId.length() - 3));

				execChannel.setInputStream(null);
				execChannel.setErrStream(System.err);

				in = execChannel.getInputStream();
				execChannel.connect();
				dataFromServer = Utilities.getStringFromIS(in);
			} else {
				throw new JobException("Job not yet completed.");
			}
			return dataFromServer.toString();

		} catch (JSchException e) {
			LOGGER.error("submitJob() ->  Error creating session", e);
			throw new ConnectionException("Error submitting job to remote server.");
		} catch (IOException e) {
			LOGGER.error("submitJob() ->  Error in I/O operations", e);
			throw new FileException("Error submitting job to remote server.");
		} catch (InterruptedException e) {
			LOGGER.error("submitJob() ->  Error in interrupt operations", e);
			throw new FileException("Error monitoring job on remote server.");
		} finally {
			if (null != execChannel && execChannel.isConnected()) {
				execChannel.disconnect();
			}
			if (null != sftpChannel && sftpChannel.isConnected()) {
				sftpChannel.disconnect();
			}
			if (null != s && s.isConnected()) {
				s.disconnect();
			}
		}
	}

	private String getJobStatus(String jobId, ChannelExec execChannel, Session session)
			throws IOException, InterruptedException, JSchException, ConnectionException {
		
		int attemptCount = 0;
		InputStream in = null;
		
		String jobData = null;
		JobDetailParser jobDetails = new JobDetailParser();
		ArrayList<JobDetails> jobs = new ArrayList<JobDetails>();
		
		String jobStatus = null;
		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("getJobStatus() -> Get job status. Job Id : " + jobId);
		}
		
		while (attemptCount != maxRetryAttempts) {
			
			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("getJobStatus() -> Get job status. Job Id : " + jobId + ", Attempt : " + attemptCount);
			}
			
			execChannel = connection.getExecChannel(session);
			execChannel.setCommand("qstat " + jobId);
			
			in = execChannel.getInputStream();
			
			execChannel.setInputStream(null);
			execChannel.setErrStream(System.err);
			execChannel.connect();
			
			jobData = Utilities.getStringFromIS(in);
			jobs.clear();
			jobs = jobDetails.jobDataParser(jobData);
			for (JobDetails job : jobs) {
				if (job.getId().equalsIgnoreCase(jobId)) {
					if (job.getStatus().equalsIgnoreCase(completedStatus)) {
						if (LOGGER.isDebugEnabled()) {
							LOGGER.debug("getJobStatus() -> Job Completed. Job Id : " + jobId + ", Status : "
									+ job.getStatus());
						}
						jobStatus = job.getStatus();
						break;
					}
				}
			}
			if (null != jobStatus && jobStatus.equalsIgnoreCase(completedStatus))
				break;
			
			execChannel.disconnect();
			attemptCount++;
			
			Thread.sleep(retryTimeInterval);
		}
		return jobStatus;

	}

}

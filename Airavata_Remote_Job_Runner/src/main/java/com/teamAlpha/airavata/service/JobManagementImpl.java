package com.teamAlpha.airavata.service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

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
import com.teamAlpha.airavata.repo.JobRepo;
import com.teamAlpha.airavata.utils.Constants;
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

	@Value("${default.retry.attempts}")
	int defaultRetryAttempts;

	@Value("${no.of.nodes}")
	String noOfNodes;

	@Value("${no.of.proc.per.node}")
	String noOfProcesses;

	@Value("${no.of.jobs}")
	String noOfJobs;

	@Value("${job.walltime}")
	String jobWalltime;

	@Autowired
	FileManagement fileManagement;

	@Autowired
	Connection connection;

	@Autowired
	JobDetailParser jobDetails;
	
	@Autowired
	JobRepo jobRepo;
	
	private static final Logger LOGGER = LogManager.getLogger(JobManagementImpl.class);

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.teamAlpha.airavata.service.JobManagement#submitJob()
	 */
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
		File jobFile = null;

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("submitJob() -> Submit job to server queue.");
		}

		try {
			s = connection.getSession(connectionParameters);
			sftpChannel = connection.getSftpChannel(s);
			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("getSftpChannel() -> Channel created successfully.");
			}
			String fileContent = String.format(Constants.PBS_CONTENT, noOfNodes, noOfProcesses, jobWalltime,
					remoteFilePath, noOfJobs, "./" + fileName.substring(0, fileName.length() - 2) + ".out");
			jobFile = new File(filePath + "pbs.sh");
			FileWriter fileWriter = new FileWriter(jobFile);
			fileWriter.write(fileContent);
			fileWriter.flush();
			fileWriter.close();
			fileManagement.putFile(filePath + fileName, remoteFilePath, sftpChannel);
			sftpChannel = connection.getSftpChannel(s);
			fileManagement.putFile(filePath + "pbs.sh", remoteFilePath, sftpChannel);
			sftpChannel.disconnect();

			execChannel = connection.getExecChannel(s);

			execChannel = connection.getExecChannel(s);
			execChannel.setCommand(Constants.CMD_CD + " " + remoteFilePath + "\n" + Constants.CMD_MPICC + " " + fileName
					+ " -o " + fileName.substring(0, fileName.length() - 2) + ".out \n " + Constants.CMD_D2U + " "
					+ "pbs.sh \n " + Constants.CMD_QSUB + " " + "pbs.sh");

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
				if (LOGGER.isInfoEnabled()) {
					LOGGER.info("submitJob() -> Checking if error generated in error file. Job Id : " + jobId);
				}
				execChannel.setCommand(Constants.CMD_CD + " " + remoteFilePath + "\n " + Constants.CMD_CAT + " "
						+ "pbs.sh.e" + jobId.substring(0, jobId.length() - 3));

				execChannel.setInputStream(null);
				execChannel.setErrStream(System.err);

				in = execChannel.getInputStream();
				execChannel.connect();
				dataFromServer = Utilities.getStringFromIS(in);
				if (LOGGER.isDebugEnabled()) {
					LOGGER.debug("submitJob() -> Error file content : " + dataFromServer + ", JobId : " + jobId);
				}
				if (dataFromServer.trim().equals("")) {

					if (LOGGER.isInfoEnabled()) {
						LOGGER.info("submitJob() -> Fetching output file content. Job Id : " + jobId);
					}
					execChannel = connection.getExecChannel(s);
					execChannel.setCommand(Constants.CMD_CD + " " + remoteFilePath + "\n " + Constants.CMD_CAT + " "
							+ "pbs.sh.o" + jobId.substring(0, jobId.length() - 3));

					execChannel.setInputStream(null);
					execChannel.setErrStream(System.err);

					in = execChannel.getInputStream();
					execChannel.connect();
					dataFromServer = Utilities.getStringFromIS(in);
					if (LOGGER.isDebugEnabled()) {
						LOGGER.debug("submitJob() -> Output file content : " + dataFromServer + ", JobId : " + jobId);
					}
				}
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

	/**
	 * Get job status Poll for the job status for the required time Return job
	 * status when completed
	 * 
	 * @param jobId
	 * @param execChannel
	 * @param session
	 * @return job status
	 * @throws IOException
	 * @throws InterruptedException
	 * @throws JSchException
	 * @throws ConnectionException
	 */
	private String getJobStatus(String jobId, ChannelExec execChannel, Session session)
			throws IOException, InterruptedException, JSchException, ConnectionException {

		int attemptCount = 1;
		InputStream in = null;

		String jobData = null;
		List<JobDetails> jobs = new ArrayList<JobDetails>();
		double requiredTime = 0;
		String jobStatus = null;

		boolean attemptSet = false;
		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("getJobStatus() -> Get job status. Job Id : " + jobId);
		}

		do {
			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("getJobStatus() -> Get job status. Job Id : " + jobId + ", Attempt : " + attemptCount);
			}

			execChannel = connection.getExecChannel(session);
			execChannel.setCommand(Constants.CMD_QSTAT + " -u " + userName);

			in = execChannel.getInputStream();

			execChannel.setInputStream(null);
			execChannel.setErrStream(System.err);
			execChannel.connect();

			jobData = Utilities.getStringFromIS(in);
			jobs.clear();
			jobs = jobDetails.jobDataParser(jobData);
			for (JobDetails job : jobs) {
				if (job.getJobId().equalsIgnoreCase(jobId)) {
					if (job.getStatus().getName().equalsIgnoreCase(completedStatus)) {
						if (LOGGER.isDebugEnabled()) {
							LOGGER.debug("getJobStatus() -> Job Completed. Job Id : " + jobId + ", Status : "
									+ job.getStatus());
						}
						jobStatus = job.getStatus().getName();
						break;
					} else {
						if (!attemptSet) {
							requiredTime = Utilities.getMilliseconds(job.getTime());
							defaultRetryAttempts = (int) (requiredTime / retryTimeInterval);
							if (LOGGER.isDebugEnabled()) {
								LOGGER.debug("getJobStatus() -> Required time for job : " + job.getTime()
										+ ", Required Attempts : " + defaultRetryAttempts);
							}
						}
					}
				}
			}
			if (null != jobStatus && jobStatus.equalsIgnoreCase(completedStatus))
				break;

			attemptCount++;

			Thread.sleep(retryTimeInterval);
		} while (attemptCount <= defaultRetryAttempts);

		return jobStatus;

	}

	public String cancelJob(String jobID) throws FileException, ConnectionException, JobException {

		ConnectionEssential connectionParameters = new ConnectionEssential();
		connectionParameters.setHost(hostId);
		connectionParameters.setUser(userName);
		connectionParameters.setPort(hostPort);

		connectionParameters.setPkFilePath(privateKeyPath);
		connectionParameters.setPkPassphrase(privateKeyPassphrase);

		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;

		Session s = null;
		String cancelStatus;

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("cancelJob() -> Cancel waiting or running job from server queue.");
		}

		try {
			s = connection.getSession(connectionParameters);
			execChannel = connection.getExecChannel(s);
			cancelStatus = cancelJobImpl(jobID, execChannel, s);

		} catch (JSchException e) {
			LOGGER.error("cancelJob() ->  Error creating session", e);
			throw new ConnectionException("Error canceling job from remote server.");
		} catch (IOException e) {
			LOGGER.error("cancelJob() ->  Error in I/O operations", e);
			throw new FileException("Error canceling job from remote server.");
		} catch (InterruptedException e) {
			LOGGER.error("cancelJob() ->  Error in interrupt operations", e);
			throw new FileException("Error canceling job from remote server.");
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

		return cancelStatus;
	}

	private String cancelJobImpl(String jobId, ChannelExec execChannel, Session session)
			throws IOException, InterruptedException, JSchException, ConnectionException, JobException {

		InputStream in = null;

		final String jobNotFound = "Job Not Found";
		final String jobCompleted = "Job Completed";
		final String jobDeleted = "Job Deleted Successfully";

		String jobData = null;
		List<JobDetails> jobs = new ArrayList<JobDetails>();

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("cancelJob() -> Cancel Job. Job Id : " + jobId);
		}

		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("cancelJob() -> Cancel Job. Job Id : " + jobId);
		}

		execChannel = connection.getExecChannel(session);
		execChannel.setCommand(Constants.CMD_QSTAT + " -u " + userName);

		in = execChannel.getInputStream();

		execChannel.setInputStream(null);
		execChannel.setErrStream(System.err);
		execChannel.connect();

		jobData = Utilities.getStringFromIS(in);

		// Return if job is not present
		if (jobData.contains("qstat: Unknown Job Id Error")) {

			LOGGER.error("cancelJob() -> Job not found. Job Id : " + jobId);

			return jobNotFound;
		}

		jobs = jobDetails.jobDataParser(jobData);
		JobDetails job = null;
		for (JobDetails jobDetails : jobs) {
			if (jobDetails.getJobId().equalsIgnoreCase(jobId)) {
				job = jobDetails;
				break;
			}
		}
		if (job.getStatus().getName().equalsIgnoreCase(completedStatus)) {

			LOGGER.error("cancelJob() -> Job Completed error. Job Id : " + jobId + ", Status : " + job.getStatus());

			return jobCompleted;
		}

		else {
			execChannel.setCommand(Constants.CMD_QDEL + " " + jobId);

			in = execChannel.getInputStream();

			execChannel.setInputStream(null);
			execChannel.setErrStream(System.err);
			execChannel.connect();
			
			if(LOGGER.isDebugEnabled()){LOGGER.debug("cancelJob() -> Jon cancelled. Updating database record. Job Id : " + jobId);}
			jobRepo.changeStatus(jobId, Constants.JOB_STATUS_CANCELLED);
		}

		return jobDeleted;

	}

	@Override
	public String submitJob(File file, int jobType, String pk, String passPhr, String noOfNodes, String procPerNode,
			String wallTime) throws FileException, ConnectionException, JobException {
		ConnectionEssential connectionParameters = new ConnectionEssential();
		connectionParameters.setHost(hostId);
		connectionParameters.setUser(userName);
		connectionParameters.setPort(hostPort);
		System.out.println(noOfNodes);
		/*
		 * Need to give the private key
		 */
		connectionParameters.setPkFilePath(pk);
		connectionParameters.setPkPassphrase(passPhr);

		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;

		Session s = null;

		File jobFile = null;

		int totalProcess = Integer.parseInt(noOfNodes) * Integer.parseInt(procPerNode);

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("submitJob() -> Submit job to server queue.");
		}

		try {
			s = connection.getSession(connectionParameters);
			sftpChannel = connection.getSftpChannel(s);
			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("getSftpChannel() -> Channel created successfully.");
			}

			String fileContent = null;
			if (jobType == Constants.PBS_JOB_CODE) {
				fileContent = String.format(Constants.PBS_CONTENT, noOfNodes, procPerNode, wallTime, remoteFilePath,
						totalProcess, "./" + file.getName().substring(0, file.getName().length() - 2) + ".out");
			} else if (jobType == Constants.LAMMPS_JOB_CODE) {
				fileContent = String.format(Constants.LAMMPS_CONTENT, noOfNodes, procPerNode, wallTime, remoteFilePath,
						totalProcess, file.getName());
			} else if (jobType == Constants.GROMACS_JOB_CODE) {
				fileContent = String.format(Constants.GROMACS_CONTENT, noOfNodes, procPerNode, wallTime, remoteFilePath,
						totalProcess, file.getName(), "output.gro");
			}
			String tDir = System.getProperty("java.io.tmpdir");

			jobFile = new File(tDir + "/pbs.sh");
			FileWriter fileWriter = new FileWriter(jobFile);
			fileWriter.write(fileContent);
			fileWriter.flush();
			fileWriter.close();
			fileManagement.putFile(file, remoteFilePath, sftpChannel);
			sftpChannel = connection.getSftpChannel(s);
			fileManagement.putFile(jobFile, remoteFilePath, sftpChannel);
			sftpChannel.disconnect();

			execChannel = connection.getExecChannel(s);

			execChannel = connection.getExecChannel(s);
			if (jobType == Constants.PBS_JOB_CODE) {
				execChannel.setCommand(Constants.CMD_CD + " " + remoteFilePath + "\n" + Constants.CMD_MPICC + " "
						+ file.getName() + " -o " + file.getName().substring(0, file.getName().length() - 2)
						+ ".out \n " + Constants.CMD_D2U + " " + jobFile.getName() + " \n " + Constants.CMD_QSUB + " "
						+ jobFile.getName());
			} else if (jobType == Constants.LAMMPS_JOB_CODE) {
				execChannel.setCommand(
						Constants.CMD_CD + " " + remoteFilePath + "\n" + Constants.CMD_QSUB + " " + jobFile.getName());
			} else if (jobType == Constants.GROMACS_JOB_CODE) {
				execChannel.setCommand(
						Constants.CMD_CD + " " + remoteFilePath + "\n" + Constants.CMD_QSUB + " " + jobFile.getName());

			}
			execChannel.setInputStream(null);
			execChannel.setErrStream(System.err);

			InputStream in = execChannel.getInputStream();
			execChannel.connect();

			String jobId = Utilities.getStringFromIS(in);
			execChannel.disconnect();

			return jobId;

		} catch (JSchException e) {
			LOGGER.error("submitJob() ->  Error creating session", e);
			throw new ConnectionException("Error submitting job to remote server.");
		} catch (IOException e) {
			LOGGER.error("submitJob() ->  Error in I/O operations", e);
			throw new FileException("Error submitting job to remote server.");
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

	@Override
	public List<JobDetails> monitorJob(String pk, String passPhr)
			throws FileException, ConnectionException, JobException {

		ConnectionEssential connectionParameters = new ConnectionEssential();
		connectionParameters.setHost(hostId);
		connectionParameters.setUser(userName);
		connectionParameters.setPort(hostPort);

		/*
		 * Need to give the private key
		 */
		connectionParameters.setPkFilePath(pk);
		connectionParameters.setPkPassphrase(passPhr);

		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;

		Session session = null;

		int attemptCount = 1;
		InputStream in = null;

		String jobData = null;
		List<JobDetails> jobs = new ArrayList<JobDetails>();

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("getJobStatus() -> Get job status.");
		}

		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("getJobStatus() -> Get job status., Attempt : " + attemptCount);
		}

		try {
			session = connection.getSession(connectionParameters);
			execChannel = connection.getExecChannel(session);
			execChannel.setCommand(Constants.CMD_QSTAT + " -u " + userName);

			in = execChannel.getInputStream();

			execChannel.setInputStream(null);
			execChannel.setErrStream(System.err);
			execChannel.connect();

			jobData = Utilities.getStringFromIS(in);

			jobs = jobDetails.jobDataParser(jobData);
		} catch (JSchException e) {
			LOGGER.error("submitJob() ->  Error creating session", e);
			throw new ConnectionException("Error submitting job to remote server.");
		} catch (IOException e) {
			LOGGER.error("submitJob() ->  Error in I/O operations", e);
			throw new FileException("Error submitting job to remote server.");
		} finally {
			if (null != execChannel && execChannel.isConnected()) {
				execChannel.disconnect();
			}
			if (null != sftpChannel && sftpChannel.isConnected()) {
				sftpChannel.disconnect();
			}
			if (null != session && session.isConnected()) {
				session.disconnect();
			}
		}

		return jobs;

	}

	public InputStream downloadFile(String jobId, String status, String jobName)
			throws FileException, ConnectionException, JobException {

		ConnectionEssential connectionParameters = new ConnectionEssential();
		connectionParameters.setHost(hostId);
		connectionParameters.setUser(userName);
		connectionParameters.setPort(hostPort);

		connectionParameters.setPkFilePath(privateKeyPath);
		connectionParameters.setPkPassphrase(privateKeyPassphrase);

		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;

		Session s = null;
		InputStream in = null;
		String dataFromServer = null;
		InputStream inputFile;

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("downloadFile() -> Fetching output file. Job Id : " + jobId);
		}
		try {

			if (null != status && status.equalsIgnoreCase("Completed")) {
				s = connection.getSession(connectionParameters);
				
				if (jobName.equalsIgnoreCase(Constants.JOB_GROMAC)) {
					if (LOGGER.isInfoEnabled()) {
						LOGGER.info("downloadFile() -> Fetching output file. Job Id : " + jobId + ", Job Name : " + jobName);
					}
					sftpChannel = connection.getSftpChannel(s);
					inputFile = fileManagement.getFile(filePath,
							remoteFilePath + "/output.gro", sftpChannel);
					return inputFile;
				} else {

					if (LOGGER.isInfoEnabled()) {
						LOGGER.info("downloadFile() -> Checking if error generated in error file. Job Id : " + jobId);
					}

					
					execChannel = connection.getExecChannel(s);
					((ChannelExec) execChannel).setCommand(Constants.CMD_CD + " " + remoteFilePath + "\n "
							+ Constants.CMD_CAT + " " + "pbs.sh.e" + jobId.substring(0, jobId.length() - 3));

					in = execChannel.getInputStream();

					execChannel.setInputStream(null);
					execChannel.setErrStream(System.err);
					execChannel.connect();

					dataFromServer = Utilities.getStringFromIS(in);
					if (LOGGER.isDebugEnabled()) {
						LOGGER.debug("downloadFile() -> Error file content : " + dataFromServer + ", JobId : "
								+ jobId.substring(0, jobId.length() - 3));
					}
					sftpChannel = connection.getSftpChannel(s);
					if (dataFromServer.trim().equals("")) {

						if (LOGGER.isInfoEnabled()) {
							LOGGER.info("downloadFile() -> Fetching output file. Job Id : " + jobId);
						}

						inputFile = fileManagement.getFile(filePath,
								remoteFilePath + "/pbs.sh.o" + jobId.substring(0, jobId.length() - 3), sftpChannel);
						if (LOGGER.isDebugEnabled()) {
							LOGGER.debug(
									"downloadFile() -> Output file content : " + dataFromServer + ", JobId : " + jobId);
						}
						return inputFile;

					} else {

						if (LOGGER.isInfoEnabled()) {
							LOGGER.info("downloadFile() -> Fetching error file. Job Id : " + jobId);
						}
						inputFile = fileManagement.getFile(filePath,
								remoteFilePath + "/pbs.sh.e" + jobId.substring(0, jobId.length() - 3), sftpChannel);
						return inputFile;

					}
				}
			}
		} catch (IOException e) {

			LOGGER.error("downloadFile() -> Error in I/O operations", e);
			throw new FileException("Error downloading file.");

		} catch (JSchException e) {
			LOGGER.error("downloadFile() ->  Error creating connection.", e);
			throw new ConnectionException("Error downloading file.");
		}

		return null;

	}

}

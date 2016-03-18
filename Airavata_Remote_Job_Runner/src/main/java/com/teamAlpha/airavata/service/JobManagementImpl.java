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
	
	@Value("${host.karst.id}")
	String karstHost;
	
	@Value("${host.bigred2.id}")
	String bigred2Host;
	
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
	
	String hostId = karstHost; // Keeping karst as default host
	
	private static final Logger LOGGER = LogManager.getLogger(JobManagementImpl.class);

	public String cancelJob(String jobID, int hostType) throws FileException, ConnectionException, JobException {
		if(hostType == Constants.KARST_HOST_CODE){
			hostId = karstHost;
		}
		else if(hostType == Constants.BIGRED2_HOST_CODE){
			hostId = bigred2Host;
		}
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
	public String submitJob(File file, int hostType, int jobType, String pk, String passPhr, String noOfNodes, String procPerNode,
			String wallTime) throws FileException, ConnectionException, JobException {
		if(hostType == Constants.KARST_HOST_CODE){
			hostId = karstHost;
		}
		else if(hostType == Constants.BIGRED2_HOST_CODE){
			hostId = bigred2Host;
		}
		ConnectionEssential connectionParameters = new ConnectionEssential();
		connectionParameters.setHost(hostId);
		connectionParameters.setUser(userName);
		connectionParameters.setPort(hostPort);
		/*
		 * Need to give the private key
		 */
		connectionParameters.setPkFilePath(pk);
		connectionParameters.setPkPassphrase(passPhr);

		Session s = null;
		String jobId = null;

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("submitJob() -> Submit job to server queue.");
		}

			s = connection.getSession(connectionParameters);
			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("getSftpChannel() -> Channel created successfully.");
			}

			if (jobType == Constants.PBS_JOB_CODE) {
				jobId = submitPBS_Job(file, hostType, hostId, noOfNodes, procPerNode, wallTime, s);
			} else if (jobType == Constants.LAMMPS_JOB_CODE) {
				jobId = submitLAMMPS_Job(file, hostType, hostId, noOfNodes, procPerNode, wallTime, s);
			} else if (jobType == Constants.GROMACS_JOB_CODE) {
				jobId = submitGROMACS_Job(file, hostType, hostId, noOfNodes, procPerNode, wallTime, s);
			}
			return jobId;
	}
	 
	private String submitPBS_Job(File file, int hostType, String hostId, String noOfNodes, String procPerNode,
			String wallTime, Session s) throws FileException, ConnectionException, JobException{
		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;
		String jobId;
		File jobFile = null;
		
		int totalProcess = Integer.parseInt(noOfNodes) * Integer.parseInt(procPerNode);
		
		String fileContent = String.format(Constants.get_PBS_Script(hostType), noOfNodes, procPerNode, wallTime, remoteFilePath,
				totalProcess, "./" + file.getName().substring(0, file.getName().length() - 2) + ".out");
		
		try{
			String tDir = System.getProperty("java.io.tmpdir");
			sftpChannel = connection.getSftpChannel(s);
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
			
			execChannel.setCommand(Constants.CMD_CD + " " + remoteFilePath + "\n" + Constants.get_compile_cmd(hostType) + " "
					+ file.getName() + " -o " + file.getName().substring(0, file.getName().length() - 2)
					+ ".out \n " + Constants.CMD_D2U + " " + jobFile.getName() + " \n " + Constants.CMD_QSUB + " "
					+ jobFile.getName());
			
			execChannel.setInputStream(null);
			execChannel.setErrStream(System.err);

			InputStream in = execChannel.getInputStream();
			execChannel.connect();

			jobId = Utilities.getStringFromIS(in);
			execChannel.disconnect();

			return jobId;
			
		}catch (IOException e) {
			LOGGER.error("submitJob() ->  Error in I/O operations", e);
			throw new FileException("Error submitting job to remote server.");
		}catch (JSchException e) {
				LOGGER.error("submitJob() ->  Error creating session", e);
				throw new ConnectionException("Error submitting job to remote server.");
		}finally {
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
	
	private String submitLAMMPS_Job(File file, int hostType, String hostId, String noOfNodes, String procPerNode,
			String wallTime, Session s) throws FileException, ConnectionException, JobException{
		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;
		String jobId;
		File jobFile = null;
		
		int totalProcess = Integer.parseInt(noOfNodes) * Integer.parseInt(procPerNode);
		
		String fileContent = String.format(Constants.get_LAMMPS_Script(hostType), noOfNodes, procPerNode, wallTime, remoteFilePath,
				totalProcess, file.getName());
		
		try{
			String tDir = System.getProperty("java.io.tmpdir");
			sftpChannel = connection.getSftpChannel(s);
			jobFile = new File(tDir + "/lammps.sh");
			FileWriter fileWriter = new FileWriter(jobFile);
			fileWriter.write(fileContent);
			fileWriter.flush();
			fileWriter.close();
			fileManagement.putFile(file, remoteFilePath, sftpChannel);
			sftpChannel = connection.getSftpChannel(s);
			fileManagement.putFile(jobFile, remoteFilePath, sftpChannel);
			sftpChannel.disconnect();
			
			execChannel = connection.getExecChannel(s);
			
			execChannel.setCommand(
					Constants.CMD_CD + " " + remoteFilePath + "\n" + Constants.CMD_QSUB + " " + jobFile.getName());
			
			execChannel.setInputStream(null);
			execChannel.setErrStream(System.err);

			InputStream in = execChannel.getInputStream();
			execChannel.connect();

			jobId = Utilities.getStringFromIS(in);
			execChannel.disconnect();

			return jobId;
			
		}catch (IOException e) {
			LOGGER.error("submitJob() ->  Error in I/O operations", e);
			throw new FileException("Error submitting job to remote server.");
		}catch (JSchException e) {
				LOGGER.error("submitJob() ->  Error creating session", e);
				throw new ConnectionException("Error submitting job to remote server.");
		}finally {
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
	
	private String submitGROMACS_Job(File file, int hostType, String hostId, String noOfNodes, String procPerNode,
			String wallTime, Session s) throws FileException, ConnectionException, JobException{
		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;
		String jobId;
		File jobFile = null;
		
		int totalProcess = Integer.parseInt(noOfNodes) * Integer.parseInt(procPerNode);
		
		String fileContent = String.format(Constants.get_GROMACS_Script(hostType), noOfNodes, procPerNode, wallTime, remoteFilePath,
				totalProcess, file.getName(), "output.gro");
		
		try{
			String tDir = System.getProperty("java.io.tmpdir");
			sftpChannel = connection.getSftpChannel(s);
			jobFile = new File(tDir + "/gromacs.sh");
			FileWriter fileWriter = new FileWriter(jobFile);
			fileWriter.write(fileContent);
			fileWriter.flush();
			fileWriter.close();
			fileManagement.putFile(file, remoteFilePath, sftpChannel);
			sftpChannel = connection.getSftpChannel(s);
			fileManagement.putFile(jobFile, remoteFilePath, sftpChannel);
			sftpChannel.disconnect();
			
			execChannel = connection.getExecChannel(s);
			
			execChannel.setCommand(
					Constants.CMD_CD + " " + remoteFilePath + "\n" + Constants.CMD_QSUB + " " + jobFile.getName());

			
			execChannel.setInputStream(null);
			execChannel.setErrStream(System.err);

			InputStream in = execChannel.getInputStream();
			execChannel.connect();

			jobId = Utilities.getStringFromIS(in);
			execChannel.disconnect();

			return jobId;
			
		}catch (IOException e) {
			LOGGER.error("submitJob() ->  Error in I/O operations", e);
			throw new FileException("Error submitting job to remote server.");
		}catch (JSchException e) {
				LOGGER.error("submitJob() ->  Error creating session", e);
				throw new ConnectionException("Error submitting job to remote server.");
		}finally {
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

	public InputStream downloadFile(String jobId, String status, String jobName, String jobFolder, int hostType)
			throws FileException, ConnectionException, JobException {
		
		if(hostType == Constants.KARST_HOST_CODE){
			hostId = karstHost;
		}
		else if(hostType == Constants.BIGRED2_HOST_CODE){
			hostId = bigred2Host;
		}
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
		//String dataFromServer = null;
		InputStream inputFile;
		String resultFileName = "result.tar";

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("downloadFile() -> Fetching output file. Job Id : " + jobId);
		}
		try {

			if (null != status && status.equalsIgnoreCase("Completed")) {
				s = connection.getSession(connectionParameters);
				execChannel = connection.getExecChannel(s);
				sftpChannel = connection.getSftpChannel(s);
				if (LOGGER.isInfoEnabled()) 
					LOGGER.info("tarFile() -> Generating tar for Job Id : " + jobId);
				execChannel.setCommand(Constants.CMD_CD + " " + remoteFilePath + "/" + jobFolder+"\n "
						+ Constants.CMD_TAR +" -cf "+resultFileName+" *" +" \n");
				
				in = execChannel.getInputStream();

				execChannel.setInputStream(null);
				execChannel.setErrStream(System.err);
				execChannel.connect();
				
				if (LOGGER.isInfoEnabled()) 
					LOGGER.info("downloadFile() -> Fetching output file. Job Id : " + jobId);
				
				inputFile = fileManagement.getFile(filePath, remoteFilePath +"/"+ jobFolder + "/" + resultFileName, sftpChannel);
				
				if(inputFile == null){
					if (LOGGER.isDebugEnabled()) 
						LOGGER.debug("downloadFile() -> Error file content for jobFolder " + jobFolder +" & jobID "+jobId);
				}
				
				return inputFile;
				/*
				if (jobName.equalsIgnoreCase(Constants.JOB_GROMAC)) {
					if (LOGGER.isInfoEnabled()) {
						LOGGER.info("downloadFile() -> Fetching output file Job Id : " + jobId + ", Job Name : " + jobName);
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
				
				*/
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

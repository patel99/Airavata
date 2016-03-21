package com.teamAlpha.airavata.service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Random;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.SftpATTRS;
import com.jcraft.jsch.SftpException;
import com.teamAlpha.airavata.domain.ConnectionEssential;
import com.teamAlpha.airavata.domain.Host;
import com.teamAlpha.airavata.domain.JobDetails;
import com.teamAlpha.airavata.domain.Status;
import com.teamAlpha.airavata.domain.Type;
import com.teamAlpha.airavata.domain.User;
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

	@Value("${host.karst.id.pk}")
	int karstHostPk;

	@Value("${host.bigred2.id.pk}")
	int bigred2HostPk;

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

	DateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");

	Date date = null;

	String hostId = karstHost; // Keeping karst as default host
	int hostIdPk = karstHostPk; // Keeping karst as default host

	private static final Logger LOGGER = LogManager.getLogger(JobManagementImpl.class);

	public String cancelJob(String jobID, int hostType) throws FileException, ConnectionException, JobException {
		if (hostType == Constants.KARST_HOST_CODE) {
			hostId = karstHost;
		} else if (hostType == Constants.BIGRED2_HOST_CODE) {
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

			if (LOGGER.isInfoEnabled()) {
				LOGGER.info("cancelJob() -> Changing job status to cancel. Job Id : " + jobID);
			}
			jobRepo.changeStatus(jobID, Constants.JOB_STATUS_CANCELLED);
			if (LOGGER.isInfoEnabled()) {
				LOGGER.info("cancelJob() -> Changing job status to cancel. Job Id : " + jobID);
			}

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

			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("cancelJob() -> Jon cancelled. Updating database record. Job Id : " + jobId);
			}
			jobRepo.changeStatus(jobId, Constants.JOB_STATUS_CANCELLED);
		}

		return jobDeleted;

	}

	@Override
	public String submitJob(File file, int hostType, int jobType, String pk, String passPhr, String noOfNodes,
			String procPerNode, String wallTime, String username)
					throws FileException, ConnectionException, JobException {

		if (hostType == Constants.KARST_HOST_CODE) {
			hostId = karstHost;
			hostIdPk = karstHostPk;
		} else if (hostType == Constants.BIGRED2_HOST_CODE) {
			hostId = bigred2Host;
			hostIdPk = bigred2HostPk;
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
		String remotePath = null;
		ChannelSftp sftpChannel = null;
		SftpATTRS attrs = null;

		try {
			if (LOGGER.isInfoEnabled()) {
				LOGGER.info("submitJob() -> Submit job to server queue.");
			}

			s = connection.getSession(connectionParameters);
			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("submitJob() -> Channel created successfully.");
			}

			remotePath = getRemotePath();
			sftpChannel = connection.getSftpChannel(s);
			sftpChannel.connect();
			try {
				attrs = sftpChannel.stat(remotePath.substring(0, remotePath.lastIndexOf("/")));
				sftpChannel.mkdir(remotePath);

			} catch (Exception e) {
				if (LOGGER.isInfoEnabled()) {
					LOGGER.info("submitJob() -> Creating remote directory. Remote Path : " + remotePath + ", User : "
							+ username);
				}
				if (attrs == null) {
					sftpChannel.mkdir(remotePath.substring(0, remotePath.lastIndexOf("/")));
					sftpChannel.mkdir(remotePath);
				}

			}
			sftpChannel.disconnect();
			if (jobType == Constants.PBS_JOB_CODE) {
				jobId = submitPBS_Job(file, hostType, hostId, noOfNodes, procPerNode, wallTime, s, remotePath);
			} else if (jobType == Constants.LAMMPS_JOB_CODE) {
				jobId = submitLAMMPS_Job(file, hostType, hostId, noOfNodes, procPerNode, wallTime, s);
			} else if (jobType == Constants.GROMACS_JOB_CODE) {
				jobId = submitGROMACS_Job(file, hostType, hostId, noOfNodes, procPerNode, wallTime, s);
			}
//			s = connection.getSession(connectionParameters);
//			sftpChannel = connection.getSftpChannel(s);
//			sftpChannel.connect();
//			sftpChannel.rename(remotePath, remotePath.substring(0, remotePath.lastIndexOf("/") + 1) + jobId);
//			remotePath = remotePath.substring(0, remotePath.lastIndexOf("/") + 1) + jobId;
//			sftpChannel.disconnect();
			JobDetails jd = new JobDetails();
			jd.setJobId(jobId);
			jd.setNodes(Integer.parseInt(noOfNodes));
			jd.setNoOfTasks(Integer.parseInt(procPerNode));
			jd.setTime(wallTime);
			Type t = new Type();
			t.setId(jobType);
			jd.setType(t);
			Status status = new Status();
			status.setId(Constants.JOB_STATUS_QUEUED);
			jd.setStatus(status);
			Host host = new Host();
			host.setId(hostIdPk);
			jd.setHost(host);
			jd.setRemotePath(remotePath);
			User user = new User();
			user.setUsername(username);
			jd.setUser(user);
			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("submitJob() -> Saving job details to database. Job : " + jd.toString());
			}
			jobRepo.add(jd);

			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("submitJob() -> Job details saved to database. Job : " + jd.toString());
			}

		} catch (SftpException | JSchException e) {
			LOGGER.error("Error processing remotedirectory. Remote Path : " + remotePath + ", User : " + username, e);
			throw new ConnectionException("Error processing remotedirectory.");
		} catch (DataAccessException e) {
			LOGGER.error("Error saving job data. Remote Path : " + remotePath + ", User : " + username, e);
			throw new ConnectionException("Error saving job data.");
		}
		return jobId;
	}

	private String submitPBS_Job(File file, int hostType, String hostId, String noOfNodes, String procPerNode,
			String wallTime, Session s, String remotePath) throws FileException, ConnectionException, JobException {
		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;
		String jobId;
		File jobFile = null;

		int totalProcess = Integer.parseInt(noOfNodes) * Integer.parseInt(procPerNode);

		String fileContent = String.format(Constants.get_PBS_Script(hostType), noOfNodes, procPerNode, wallTime,
				remotePath, totalProcess, "./" + file.getName().substring(0, file.getName().length() - 2) + ".out");

		try {
			String tDir = System.getProperty("java.io.tmpdir");
			sftpChannel = connection.getSftpChannel(s);
			jobFile = new File(tDir + "/pbs.sh");
			FileWriter fileWriter = new FileWriter(jobFile);
			fileWriter.write(fileContent);
			fileWriter.flush();
			fileWriter.close();
			fileManagement.putFile(file, remotePath, sftpChannel);
			sftpChannel = connection.getSftpChannel(s);
			fileManagement.putFile(jobFile, remotePath, sftpChannel);
			sftpChannel.disconnect();

			execChannel = connection.getExecChannel(s);

			execChannel.setCommand(Constants.CMD_CD + " " + remotePath + "\n" + Constants.get_compile_cmd(hostType)
					+ " " + file.getName() + " -o " + file.getName().substring(0, file.getName().length() - 2)
					+ ".out \n " + Constants.CMD_D2U + " " + jobFile.getName() + " \n " + Constants.CMD_QSUB + " "
					+ jobFile.getName());

			execChannel.setInputStream(null);
			execChannel.setErrStream(System.err);

			InputStream in = execChannel.getInputStream();
			execChannel.connect();

			jobId = Utilities.getStringFromIS(in);
			execChannel.disconnect();

			return jobId;

		} catch (IOException e) {
			LOGGER.error("submitJob() ->  Error in I/O operations", e);
			throw new FileException("Error submitting job to remote server.");
		} catch (JSchException e) {
			LOGGER.error("submitJob() ->  Error creating session", e);
			throw new ConnectionException("Error submitting job to remote server.");
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

	private String submitLAMMPS_Job(File file, int hostType, String hostId, String noOfNodes, String procPerNode,
			String wallTime, Session s) throws FileException, ConnectionException, JobException {
		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;
		String jobId;
		File jobFile = null;

		int totalProcess = Integer.parseInt(noOfNodes) * Integer.parseInt(procPerNode);

		String fileContent = String.format(Constants.get_LAMMPS_Script(hostType), noOfNodes, procPerNode, wallTime,
				remoteFilePath, totalProcess, file.getName());

		try {
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

		} catch (IOException e) {
			LOGGER.error("submitJob() ->  Error in I/O operations", e);
			throw new FileException("Error submitting job to remote server.");
		} catch (JSchException e) {
			LOGGER.error("submitJob() ->  Error creating session", e);
			throw new ConnectionException("Error submitting job to remote server.");
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

	private String submitGROMACS_Job(File file, int hostType, String hostId, String noOfNodes, String procPerNode,
			String wallTime, Session s) throws FileException, ConnectionException, JobException {
		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;
		String jobId;
		File jobFile = null;

		int totalProcess = Integer.parseInt(noOfNodes) * Integer.parseInt(procPerNode);

		String fileContent = String.format(Constants.get_GROMACS_Script(hostType), noOfNodes, procPerNode, wallTime,
				remoteFilePath, totalProcess, file.getName(), "output.gro");

		try {
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

		} catch (IOException e) {
			LOGGER.error("submitJob() ->  Error in I/O operations", e);
			throw new FileException("Error submitting job to remote server.");
		} catch (JSchException e) {
			LOGGER.error("submitJob() ->  Error creating session", e);
			throw new ConnectionException("Error submitting job to remote server.");
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
	public List<JobDetails> monitorJob(String pk, String passPhr, String userName, String hostId)
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

		InputStream in = null;

		String jobData = null;
		List<JobDetails> jobs = new ArrayList<JobDetails>();
		List<JobDetails> jobsDb = new ArrayList<JobDetails>();

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("getJobStatus() -> Get job status.");
		}

		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("getJobStatus() -> Get job details. User : " + userName);
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

			jobsDb = jobRepo.getJobs();

			updateJobDetails(jobs, jobsDb);

		} catch (JSchException e) {
			LOGGER.error("monitorJob() ->  Error creating session", e);
			throw new ConnectionException("Error submitting job to remote server.");
		} catch (IOException e) {
			LOGGER.error("monitorJob() ->  Error in I/O operations", e);
			throw new FileException("Error submitting job to remote server.");
		} catch (DataAccessException e) {
			LOGGER.error("monitorJob() -> Error monitoring job.", e);
			throw new FileException("Error monitoring job.");
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

	@Override
	public List<JobDetails> getJobDetails(String pk, String passPhr, String userName)
			throws FileException, ConnectionException, JobException {

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("getJobDetails() -> Get job details. Username : " + userName);
		}
		List<JobDetails> jobs = new ArrayList<JobDetails>();
		try {
			jobs = jobRepo.getJobs(userName);

		} catch (DataAccessException e) {
			LOGGER.error("submitJob() ->  Error in I/O operations", e);
			throw new FileException("Error monitoring job.");
		}
		return jobs;

	}

	public boolean updateJobDetails(List<JobDetails> jobs, List<JobDetails> jobsDb) {

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("updateJobDetails() -> Updating job details. Job : " + jobs + "JobDB : " + jobsDb);
		}

		for (JobDetails temp : jobs) {
			for (JobDetails dbtemp : jobsDb) {
				if (temp.getJobId().equals(dbtemp.getJobId())) {
					if (!temp.getStatus().getValue().toLowerCase()
							.equalsIgnoreCase(dbtemp.getStatus().getValue().toLowerCase())) {
						if(!temp.getSessionId().equals("") && 
								temp.getStatus().getValue().equalsIgnoreCase(Constants.JOB_STATUS_MAP.get(Constants.JOB_STATUS_COMPLETED).getValue())){
							Status s = new Status();
							s.setId(Constants.JOB_STATUS_COMPLETED);
							temp.setStatus(s);
						}
						jobRepo.updateJob(temp);
					}
				}
			}

		}
		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("updateJobDetails() -> Job details updated. Job : " + jobs + "JobDB : " + jobsDb);
		}
		return true;
	}

	public InputStream downloadFile(String jobId, String status, String jobName, int hostType)
			throws FileException, ConnectionException, JobException {

		if (hostType == Constants.KARST_HOST_CODE) {
			hostId = karstHost;
		} else if (hostType == Constants.BIGRED2_HOST_CODE) {
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
		// String dataFromServer = null;
		InputStream inputFile;
		String resultFileName = jobId + ".tar";
		String remotePath = null;

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("downloadFile() -> Fetching output file. Job Id : " + jobId);
		}
		try {

			if (null != status && status.equalsIgnoreCase("Completed")) {
				s = connection.getSession(connectionParameters);
				execChannel = connection.getExecChannel(s);
				sftpChannel = connection.getSftpChannel(s);

				if (LOGGER.isDebugEnabled()) {
					LOGGER.debug("downloadFile() -> Fetching remote path. Id : " + jobId);
				}
				remotePath = jobRepo.getPath(jobId);

				if (LOGGER.isDebugEnabled()) {
					LOGGER.debug("downloadFile() -> Retrieved remote path. Id : " + jobId + ", Remote path : "
							+ remoteFilePath);
				}
				if (LOGGER.isInfoEnabled())
					LOGGER.info("downloadFile() -> Generating tar for Job Id : " + jobId);
				execChannel.setCommand(Constants.CMD_CD + " " + remotePath + "\n " + Constants.CMD_TAR + " -cf "
						+ resultFileName + " *" + " \n");

				in = execChannel.getInputStream();

				execChannel.setInputStream(null);
				execChannel.setErrStream(System.err);
				execChannel.connect();

				if (LOGGER.isInfoEnabled())
					LOGGER.info("downloadFile() -> Fetching output file. Job Id : " + jobId);

				inputFile = fileManagement.getFile(filePath, remotePath + "/" + resultFileName,
						sftpChannel);

				if (inputFile == null) {
					if (LOGGER.isDebugEnabled())
						LOGGER.debug("downloadFile() -> Error file content for jobFolder " + remotePath + ", jobID "
								+ jobId);
				}

				return inputFile;
				/*
				 * if (jobName.equalsIgnoreCase(Constants.JOB_GROMAC)) { if
				 * (LOGGER.isInfoEnabled()) { LOGGER.info(
				 * "downloadFile() -> Fetching output file Job Id : " + jobId +
				 * ", Job Name : " + jobName); } sftpChannel =
				 * connection.getSftpChannel(s); inputFile =
				 * fileManagement.getFile(filePath, remoteFilePath +
				 * "/output.gro", sftpChannel); return inputFile; } else {
				 * 
				 * if (LOGGER.isInfoEnabled()) { LOGGER.info(
				 * "downloadFile() -> Checking if error generated in error file. Job Id : "
				 * + jobId); }
				 * 
				 * 
				 * execChannel = connection.getExecChannel(s); ((ChannelExec)
				 * execChannel).setCommand(Constants.CMD_CD + " " +
				 * remoteFilePath + "\n " + Constants.CMD_CAT + " " + "pbs.sh.e"
				 * + jobId.substring(0, jobId.length() - 3));
				 * 
				 * in = execChannel.getInputStream();
				 * 
				 * execChannel.setInputStream(null);
				 * execChannel.setErrStream(System.err); execChannel.connect();
				 * 
				 * dataFromServer = Utilities.getStringFromIS(in); if
				 * (LOGGER.isDebugEnabled()) { LOGGER.debug(
				 * "downloadFile() -> Error file content : " + dataFromServer +
				 * ", JobId : " + jobId.substring(0, jobId.length() - 3)); }
				 * sftpChannel = connection.getSftpChannel(s); if
				 * (dataFromServer.trim().equals("")) {
				 * 
				 * if (LOGGER.isInfoEnabled()) { LOGGER.info(
				 * "downloadFile() -> Fetching output file. Job Id : " + jobId);
				 * }
				 * 
				 * inputFile = fileManagement.getFile(filePath, remoteFilePath +
				 * "/pbs.sh.o" + jobId.substring(0, jobId.length() - 3),
				 * sftpChannel); if (LOGGER.isDebugEnabled()) { LOGGER.debug(
				 * "downloadFile() -> Output file content : " + dataFromServer +
				 * ", JobId : " + jobId); } return inputFile;
				 * 
				 * } else {
				 * 
				 * if (LOGGER.isInfoEnabled()) { LOGGER.info(
				 * "downloadFile() -> Fetching error file. Job Id : " + jobId);
				 * } inputFile = fileManagement.getFile(filePath, remoteFilePath
				 * + "/pbs.sh.e" + jobId.substring(0, jobId.length() - 3),
				 * sftpChannel); return inputFile;
				 * 
				 * } }
				 * 
				 */
			}
		} catch (IOException e) {

			LOGGER.error("downloadFile() -> Error in I/O operations", e);
			throw new FileException("Error downloading file.");

		} catch (JSchException e) {
			LOGGER.error("downloadFile() ->  Error creating connection.", e);
			throw new ConnectionException("Error downloading file.");
		}catch (DataAccessException e) {
			LOGGER.error("downloadFile() ->  Error fetching remote file path.", e);
			throw new ConnectionException("Error fetching remote file path.");
		}

		return null;

	}

	String getRemotePath() {
		int randNum = 0;
		Random rand = new Random();
		randNum = rand.nextInt(Integer.MAX_VALUE);
		String remotePath = null;
		date = new Date();
		remotePath = remoteFilePath + dateFormat.format(date) + "/" + randNum;
		return remotePath;
	}

}

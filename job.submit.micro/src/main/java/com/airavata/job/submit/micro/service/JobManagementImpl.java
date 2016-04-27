package com.airavata.job.submit.micro.service;

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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import com.airavata.job.submit.micro.entity.ConnectionEssential;
import com.airavata.job.submit.micro.entity.Host;
import com.airavata.job.submit.micro.entity.JobDetails;
import com.airavata.job.submit.micro.entity.Status;
import com.airavata.job.submit.micro.entity.Type;
import com.airavata.job.submit.micro.entity.User;
import com.airavata.job.submit.micro.exception.ConnectionException;
import com.airavata.job.submit.micro.exception.FileException;
import com.airavata.job.submit.micro.exception.JobException;
import com.airavata.job.submit.micro.net.Connection;
import com.airavata.job.submit.micro.utils.Constants;
import com.airavata.job.submit.micro.utils.JobDetailParser;
import com.airavata.job.submit.micro.utils.Utilities;
import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.SftpATTRS;
import com.jcraft.jsch.SftpException;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

@Service
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

	/*
	 * @Autowired JobRepo jobRepo;
	 */

	DateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");

	Date date = null;

	String hostId = karstHost; // Keeping karst as default host
	int hostIdPk = karstHostPk; // Keeping karst as default host

	private static final Logger LOGGER = LogManager.getLogger(JobManagementImpl.class);

	// @Override
	// @Transactional(readOnly = false, propagation = Propagation.REQUIRED,
	// rollbackFor = Exception.class)
	public JobDetails submitJob(List<File> files, int hostType, int jobType, String pk, String passPhr, String noOfNodes,
			String procPerNode, String wallTime, String username)
					throws FileException, ConnectionException, JobException {

		JobDetails jd = null;
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
				jobId = submitPBS_Job(files.get(0), hostType, hostId, noOfNodes, procPerNode, wallTime, s, remotePath);
			} else if (jobType == Constants.LAMMPS_JOB_CODE) {
				jobId = submitLAMMPS_Job(files.get(0), hostType, hostId, noOfNodes, procPerNode, wallTime, s);
			} else if (jobType == Constants.GROMACS_JOB_CODE) {
				jobId = submitGROMACS_Job(files, hostType, hostId, noOfNodes, procPerNode, wallTime, s, remotePath);
			}

			jd = new JobDetails();
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

			/*
			 * Remove this add thing and create a new micro service
			 */
			// jobRepo.add(jd);

			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("submitJob() -> Job details saved to database. Job : " + jd.toString());
			}

		} catch (JSchException e) {
			LOGGER.error("Error processing remotedirectory. Remote Path : " + remotePath + ", User : " + username, e);
			throw new ConnectionException("Error processing remotedirectory.");
		} catch (SftpException e) {
			LOGGER.error("Error processing remotedirectory. Remote Path : " + remotePath + ", User : " + username, e);
			throw new ConnectionException("Error processing remotedirectory.");
		} catch (DataAccessException e) {
			LOGGER.error("Error saving job data. Remote Path : " + remotePath + ", User : " + username, e);
			throw new ConnectionException("Error saving job data.");
		}
		return jd;
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

	private String submitGROMACS_Job(List<File> files, int hostType, String hostId, String noOfNodes,
			String procPerNode, String wallTime, Session s, String remotePath)
					throws FileException, ConnectionException, JobException {
		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;
		String jobId;
		File jobFile = null;

		int totalProcess = Integer.parseInt(noOfNodes) * Integer.parseInt(procPerNode);

		String fileContent = String.format(Constants.get_GROMACS_Script(hostType), noOfNodes, procPerNode, wallTime,
				remotePath, totalProcess, files.get(0).getName(), files.get(1).getName());

		try {
			String tDir = System.getProperty("java.io.tmpdir");
			sftpChannel = connection.getSftpChannel(s);
			jobFile = new File(tDir + "/gromacs.sh");
			FileWriter fileWriter = new FileWriter(jobFile);
			fileWriter.write(fileContent);
			fileWriter.flush();
			fileWriter.close();
			fileManagement.putFile(files.get(0), remotePath, sftpChannel);
			sftpChannel = connection.getSftpChannel(s);
			fileManagement.putFile(files.get(1), remotePath, sftpChannel);
			sftpChannel = connection.getSftpChannel(s);
			fileManagement.putFile(jobFile, remotePath, sftpChannel);
			sftpChannel.disconnect();

			execChannel = connection.getExecChannel(s);

			execChannel.setCommand(
					Constants.CMD_CD + " " + remotePath + "\n" + Constants.CMD_QSUB + " " + jobFile.getName());

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

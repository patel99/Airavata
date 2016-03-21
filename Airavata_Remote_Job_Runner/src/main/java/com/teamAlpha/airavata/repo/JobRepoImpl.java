package com.teamAlpha.airavata.repo;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.teamAlpha.airavata.domain.Host;
import com.teamAlpha.airavata.domain.JobDetails;
import com.teamAlpha.airavata.domain.Status;
import com.teamAlpha.airavata.domain.Type;
import com.teamAlpha.airavata.domain.User;

@Repository
public class JobRepoImpl implements JobRepo {

	private static final Logger LOGGER = Logger.getLogger(JobRepoImpl.class);

	@Autowired
	JdbcTemplate jdbcTemplate;

	@Autowired
	NamedParameterJdbcTemplate namedParameterJdbcTemplate;

	private static final String INSERT_JOB_DETAILS = " INSERT INTO job_details (user_id, job_type_id, queue_type, job_id, job_name, "
			+ " session_id, nodes, no_of_tasks, memory, time, elaps_time, job_status_id, host_id, remote_path) "
			+ " VALUES "
			+ "((SELECT id from airavata_user WHERE username = :userId), :jobTypeId, :queueType, :jobId, :jobName, "
			+ " :sessionId, :nodes, :noOfTasks, :memory, :time, :elapsTime, :jobStatusId, :hostId, :remotePath)";

	private static final String CHANGE_STATUS = "UPDATE job_details SET job_status_id = :status, updts = NOW()"
			+ " WHERE job_id = :jobId";

	private static final String GET_REMOTE_PATH = "SELECT remote_path FROM job_details" + " WHERE job_id = :jobId";

	private static final String UPDATE_STATUS = "UPDATE job_details SET queue_type = :queueType, job_id = :jobId, "
			+ "job_name = :jobName, session_id = :sessionId, job_status_id = :status, "
			+ "elaps_time=:elapsTime, updts = NOW()" + " WHERE job_id = :jobId";
	
	private static final String GET_ALL_JOBS = "SELECT jd.job_id, s.value, jd.session_id FROM  job_details jd "
			+ "JOIN job_status s ON s.id = jd.job_status_id";

	@Override
	public int add(JobDetails jobDetails) {

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("add() -> Saving job details. Job Details : " + jobDetails.toString());
		}

		Map<String, Object> params = new HashMap<String, Object>();

		params.put("userId", jobDetails.getUser().getUsername());
		params.put("jobTypeId", jobDetails.getType().getId());
		params.put("queueType", jobDetails.getQueueType());
		params.put("jobId", jobDetails.getJobId());
		params.put("jobName", jobDetails.getJobName());
		params.put("sessionId", jobDetails.getSessionId());
		params.put("nodes", jobDetails.getNodes());
		params.put("noOfTasks", jobDetails.getNoOfTasks());
		params.put("memory", jobDetails.getMemory());
		params.put("time", jobDetails.getTime());
		params.put("elapsTime", jobDetails.getElapTime());
		params.put("jobStatusId", jobDetails.getStatus().getId());
		params.put("hostId", jobDetails.getHost().getId());
		params.put("remotePath", jobDetails.getRemotePath());

		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("add() -> Saving job details. Job Details : " + jobDetails.toString() + ", SQL : "
					+ INSERT_JOB_DETAILS);
		}

		int rowsInserted = namedParameterJdbcTemplate.update(INSERT_JOB_DETAILS, params);
		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("add() -> Job details saved. Job Details : " + jobDetails.toString());
		}

		return rowsInserted;
	}

	@Override
	public int updateJob(JobDetails jobDetails) {
		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("updateJob() -> Updating job details. Job Details : " + jobDetails.toString());
		}

		Map<String, Object> params = new HashMap<String, Object>();
		
		params.put("queueType", jobDetails.getQueueType());
		params.put("jobId", jobDetails.getJobId());
		params.put("jobName", jobDetails.getJobName());
		params.put("sessionId", jobDetails.getSessionId());
		params.put("elapsTime", jobDetails.getElapTime());
		params.put("status", jobDetails.getStatus().getId());

		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("updateJob() -> Updating job details. Job Details : " + jobDetails.toString() + ", SQL : "
					+ UPDATE_STATUS);
		}

		int rowsUpdated = namedParameterJdbcTemplate.update(UPDATE_STATUS, params);

		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("updateJob() -> Job details updated. Job Details : " + jobDetails.toString());
		}

		return rowsUpdated;
	}

	@Override
	public int changeStatus(String jobId, int status) {

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("add() -> Changing job status. Id : " + jobId + ", Status : " + status);
		}

		Map<String, Object> params = new HashMap<String, Object>();

		params.put("jobId", jobId);
		params.put("status", status);

		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("add() -> Changing job status. Id : " + jobId + ", Status : " + status + ", SQL : "
					+ CHANGE_STATUS);
		}

		int rowsUpdated = namedParameterJdbcTemplate.update(CHANGE_STATUS, params);
		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("add() -> Job status changed. Id : " + jobId + ", Status : " + status);
		}

		return rowsUpdated;
	}

	@Override
	public List<JobDetails> getJobs(String userId) {

		Map<String, Object> params = new HashMap<String, Object>();
		params.put("userId", userId);

		StringBuffer queryForJob = new StringBuffer();
		queryForJob.append(
				"SELECT jd.id, u.username AS uname, t.value AS tvalue, h.id AS hostid, h.name AS hname, t.name AS tname, queue_type, job_id, job_name, session_id, nodes, no_of_tasks, memory, time, elaps_time, s.name AS sname, s.value AS svalue, insts, updts ");
		queryForJob.append(" FROM job_details jd ");
		queryForJob.append(" JOIN airavata_user u ON u.id = jd.user_id ");
		queryForJob.append(" JOIN job_status s ON s.id = jd.job_status_id ");
		queryForJob.append(" JOIN job_type t ON t.id = jd.job_type_id ");
		queryForJob.append(" JOIN host h ON h.id = jd.host_id ");
		queryForJob.append(" WHERE 1=1 ");
		queryForJob.append(" AND u.username= :userId ORDER BY insts DESC");

		List<JobDetails> jobDetails = namedParameterJdbcTemplate.query(queryForJob.toString(), params,
				JobDetailsMapper);

		return jobDetails;
	}

	private RowMapper<JobDetails> JobDetailsMapper = new RowMapper<JobDetails>() {

		public JobDetails mapRow(ResultSet rs, int arg1) throws SQLException {

			JobDetails jobDetails = new JobDetails();

			jobDetails.setId(rs.getInt("id"));

			User user = new User();
			user.setUsername(rs.getString("uname"));
			jobDetails.setUser(user);

			Type type = new Type();
			type.setName(rs.getString("tname"));
			type.setValue(rs.getString("tvalue"));
			jobDetails.setType(type);

			jobDetails.setQueueType(rs.getString("queue_type"));
			jobDetails.setJobId(rs.getString("job_id"));
			jobDetails.setJobName(rs.getString("job_name"));
			jobDetails.setSessionId(rs.getString("session_id"));
			jobDetails.setNodes(rs.getInt("nodes"));
			jobDetails.setNoOfTasks(rs.getInt("no_of_tasks"));
			jobDetails.setMemory(rs.getString("memory"));
			jobDetails.setTime(rs.getString("time"));
			jobDetails.setElapTime(rs.getString("elaps_time"));

			Status status = new Status();
			status.setName(rs.getString("sname"));
			status.setValue(rs.getString("svalue"));
			jobDetails.setStatus(status);

			Host h = new Host();
			h.setId(rs.getInt("hostid"));
			h.setName(rs.getString("hname"));
			jobDetails.setHost(h);
			jobDetails.setInsts(rs.getTimestamp("insts"));
			jobDetails.setUpdts(rs.getTimestamp("updts"));

			return jobDetails;
		}
	};
	
	

	@Override
	public String getPath(String jobId) {

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("getPath() -> Fetching remote path. Id : " + jobId);
		}

		Map<String, Object> params = new HashMap<String, Object>();

		params.put("jobId", jobId);

		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("getPath() -> Fetching remote path. Id : " + jobId + ", SQL : " + GET_REMOTE_PATH);
		}

		String remoteFilePath = namedParameterJdbcTemplate.queryForObject(GET_REMOTE_PATH, params, String.class);

		return remoteFilePath;
	}

	@Override
	public List<JobDetails> getJobs() {

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("getJobs() -> Get Job Details.");
		}
		
		List<JobDetails> jobDetails = namedParameterJdbcTemplate.query(GET_ALL_JOBS, GetJobDetailsMapper);

		return jobDetails;
	}

	private RowMapper<JobDetails> GetJobDetailsMapper = new RowMapper<JobDetails>() {

		public JobDetails mapRow(ResultSet rs, int arg1) throws SQLException {

			JobDetails jobDetails = new JobDetails();

			jobDetails.setJobId(rs.getString("job_id"));
			jobDetails.setSessionId(rs.getString("session_id"));

			Status status = new Status();
			status.setValue(rs.getString("value"));
			jobDetails.setStatus(status);

			return jobDetails;
		}
	};
	
}

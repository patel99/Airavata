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
			+ " session_id, nodes, no_of_tasks, memory, time, elaps_time, job_status_id, updts) " + " VALUES "
			+ "(:userId, :jobTypeId, :queueType, :jobId, :jobName, "
			+ " :sessionId, :nodes, :noOfTasks, :memory, :time, :elapsTime, :jobStatusId, :updts)";

	private static final String CHANGE_STATUS = "UPDATE job_details SET job_status_id = :status, updts = :NOW()"
			+ " WHERE job_id = :jobId";

	@Override
	public int add(JobDetails jobDetails) {

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("add() -> Saving job details. Job Details : " + jobDetails.toString());
		}

		Map<String, Object> params = new HashMap<String, Object>();

		params.put("userId", jobDetails.getUser().getId());
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
	public int changeStatus(String jobId, int status) {

		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("add() -> Changing job status. Id : " + jobId + ", Status : " + status);
		}

		Map<String, Object> params = new HashMap<String, Object>();

		params.put("jobId", jobId);
		params.put("status", status);

		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug(
					"add() -> Changing job status. Id : " + jobId + ", Status : " + status + ", SQL : " + CHANGE_STATUS);
		}

		int rowsUpdated = namedParameterJdbcTemplate.update(CHANGE_STATUS, params);
		if (LOGGER.isDebugEnabled()) {
			LOGGER.debug("add() -> Job status changed. Id : " + jobId + ", Status : " + status);
		}

		return rowsUpdated;
	}

	@Override
	public List<JobDetails> getJobs(int userId) {

		Map<String, Object> params = new HashMap<String, Object>();
		params.put("userId", userId);

		StringBuffer queryForJob = new StringBuffer();
		queryForJob.append("SELECT u.username, t.name, queue_type, job_id, job_name, session_id, nodes, no_of_tasks, memory, time, elaps_time, s.name, updts ");
		queryForJob.append(" FROM job_details jd ");
		queryForJob.append(" JOIN airavata_user u u.id = jd.user_id ");
		queryForJob.append(" JOIN job_status s s.id = jd.job_status_id ");
		queryForJob.append(" JOIN job_type t t.id = jd.job_type_id ");
		queryForJob.append(" WHERE 1=1 ");
		queryForJob.append(" AND user_id= :userId");

		List<JobDetails> jobDetails = namedParameterJdbcTemplate.query(queryForJob.toString(), params,
				JobDetailsMapper);

		return jobDetails;
	}

	private RowMapper<JobDetails> JobDetailsMapper = new RowMapper<JobDetails>() {

		public JobDetails mapRow(ResultSet rs, int arg1) throws SQLException {
			
			JobDetails jobDetails = new JobDetails();
			
			jobDetails.setId(rs.getInt("id"));
			
			User user = new User();
			user.setUsername(rs.getString("u.username"));
			jobDetails.setUser(user);
			
			Type type =new Type();
			type.setName(rs.getString("t.name"));			
			jobDetails.setType(type);
			
			jobDetails.setQueueType(rs.getString("queue_type"));
			jobDetails.setJobId(rs.getString("job_id"));
			jobDetails.setJobName(rs.getString("job_name"));
			jobDetails.setSessionId(rs.getString("session_id"));
			jobDetails.setNodes(rs.getString("nodes"));
			jobDetails.setNoOfTasks(rs.getString("no_of_tasks"));
			jobDetails.setMemory(rs.getString("memory"));
			jobDetails.setTime(rs.getString("time"));
			jobDetails.setElapTime(rs.getString("elaps_time"));
			
			Status status = new Status();
			status.setName(rs.getString("s.name"));			
			jobDetails.setStatus(status);
			
			jobDetails.setInsts(rs.getTimestamp("insts"));
			jobDetails.setUpdts(rs.getTimestamp("updts"));
			
			return jobDetails;
		}
	};

}

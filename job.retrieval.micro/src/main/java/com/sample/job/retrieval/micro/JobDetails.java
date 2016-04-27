package com.sample.job.retrieval.micro;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import org.springframework.boot.orm.jpa.EntityScan;

@Entity(name = "job_details")
public class JobDetails implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column
	private int id;

	@Column
	private String jobId;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;

	@Column
	private String queueType;

	@Column
	private String jobName;

	@Column
	private String sessionId;

	@Column
	private int nodes;

	@Column
	private int noOfTasks;

	@Column
	private String memory;

	@Column
	private String time;

	@ManyToOne
	@JoinColumn(name = "job_status_id")
	private Status status;

	@Column
	private String elapsTime;

	@ManyToOne
	@JoinColumn(name = "job_type_id")
	private Type type;

	@Column(columnDefinition = "timestamp without time zone DEFAULT now() NOT NULL")
	private Timestamp insts;

	@Column(columnDefinition = "timestamp without time zone")
	private Timestamp updts;

	@ManyToOne
	@JoinColumn(name = "host_id", columnDefinition="integer DEFAULT 0 NOT NULL")
	private Host host;

	@Column
	private String remotePath;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getJobId() {
		return jobId;
	}

	public void setJobId(String jobId) {
		this.jobId = jobId;
	}

	public Type getType() {
		return type;
	}

	public void setType(Type type) {
		this.type = type;
	}

	/**
	 * @return the queueType
	 */
	public String getQueueType() {
		return queueType;
	}

	/**
	 * @param queueType
	 *            the queueType to set
	 */
	public void setQueueType(String queueType) {
		this.queueType = queueType;
	}

	/**
	 * @return the jobName
	 */
	public String getJobName() {
		return jobName;
	}

	/**
	 * @param jobName
	 *            the jobName to set
	 */
	public void setJobName(String jobName) {
		this.jobName = jobName;
	}

	/**
	 * @return the sessionId
	 */
	public String getSessionId() {
		return sessionId;
	}

	/**
	 * @param sessionId
	 *            the sessionId to set
	 */
	public void setSessionId(String sessionId) {
		this.sessionId = sessionId;
	}

	/**
	 * @return the nodes
	 */
	public int getNodes() {
		return nodes;
	}

	/**
	 * @param nodes
	 *            the nodes to set
	 */
	public void setNodes(int nodes) {
		this.nodes = nodes;
	}

	/**
	 * @return the noOfTasks
	 */
	public int getNoOfTasks() {
		return noOfTasks;
	}

	/**
	 * @param noOfTasks
	 *            the noOfTasks to set
	 */
	public void setNoOfTasks(int noOfTasks) {
		this.noOfTasks = noOfTasks;
	}

	/**
	 * @return the memory
	 */
	public String getMemory() {
		return memory;
	}

	/**
	 * @param memory
	 *            the memory to set
	 */
	public void setMemory(String memory) {
		this.memory = memory;
	}

	/**
	 * @return the time
	 */
	public String getTime() {
		return time;
	}

	/**
	 * @param time
	 *            the time to set
	 */
	public void setTime(String time) {
		this.time = time;
	}

	public String getElapsTime() {
		return elapsTime;
	}

	public void setElapsTime(String elapsTime) {
		this.elapsTime = elapsTime;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public Timestamp getInsts() {
		return insts;
	}

	public void setInsts(Timestamp insts) {
		this.insts = insts;
	}

	public Timestamp getUpdts() {
		return updts;
	}

	public void setUpdts(Timestamp updts) {
		this.updts = updts;
	}

	public Host getHost() {
		return host;
	}

	public void setHost(Host host) {
		this.host = host;
	}

	public String getRemotePath() {
		return remotePath;
	}

	public void setRemotePath(String remotePath) {
		this.remotePath = remotePath;
	}

	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append("JobDetails [id=");
		builder.append(id);
		builder.append(", jobId=");
		builder.append(jobId);
		builder.append(", user=");
		builder.append(user);
		builder.append(", queueType=");
		builder.append(queueType);
		builder.append(", jobName=");
		builder.append(jobName);
		builder.append(", sessionId=");
		builder.append(sessionId);
		builder.append(", nodes=");
		builder.append(nodes);
		builder.append(", noOfTasks=");
		builder.append(noOfTasks);
		builder.append(", memory=");
		builder.append(memory);
		builder.append(", time=");
		builder.append(time);
		builder.append(", status=");
		builder.append(status);
		builder.append(", elapTime=");
		builder.append(elapsTime);
		builder.append(", type=");
		builder.append(type);
		builder.append(", insts=");
		builder.append(insts);
		builder.append(", updts=");
		builder.append(updts);
		builder.append(", host=");
		builder.append(host);
		builder.append(", remotePath=");
		builder.append(remotePath);
		builder.append("]");
		return builder.toString();
	}
}

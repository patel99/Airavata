package com.teamAlpha.airavata.domain;

import java.sql.Timestamp;

public class JobDetails {
	
	private int id;
	private String jobId;
	private User user;
	private String queueType;
	private String jobName;
	private String sessionId;
	private String nodes;
	private String noOfTasks;
	private String memory;
	private String time;
	private Status status;
	private String elapTime;
	private Type type;
	private Timestamp insts;
	private Timestamp updts;
	
	
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
	 * @param queueType the queueType to set
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
	 * @param jobName the jobName to set
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
	 * @param sessionId the sessionId to set
	 */
	public void setSessionId(String sessionId) {
		this.sessionId = sessionId;
	}
	/**
	 * @return the nodes
	 */
	public String getNodes() {
		return nodes;
	}
	/**
	 * @param nodes the nodes to set
	 */
	public void setNodes(String nodes) {
		this.nodes = nodes;
	}
	/**
	 * @return the noOfTasks
	 */
	public String getNoOfTasks() {
		return noOfTasks;
	}
	/**
	 * @param noOfTasks the noOfTasks to set
	 */
	public void setNoOfTasks(String noOfTasks) {
		this.noOfTasks = noOfTasks;
	}
	/**
	 * @return the memory
	 */
	public String getMemory() {
		return memory;
	}
	/**
	 * @param memory the memory to set
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
	 * @param time the time to set
	 */
	public void setTime(String time) {
		this.time = time;
	}
	
	/**
	 * @return the elapTime
	 */
	public String getElapTime() {
		return elapTime;
	}
	/**
	 * @param elapTime the elapTime to set
	 */
	public void setElapTime(String elapTime) {
		this.elapTime = elapTime;
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
		builder.append(elapTime);
		builder.append(", type=");
		builder.append(type);
		builder.append(", insts=");
		builder.append(insts);
		builder.append(", updts=");
		builder.append(updts);
		builder.append("]");
		return builder.toString();
	}
	
}

package com.teamAlpha.airavata.domain;

public class JobDetails {
	
	private String id;
	private String userName;
	private String queueType;
	private String jobName;
	private String sessionId;
	private String nodes;
	private String noOfTasks;
	private String memory;
	private String time;
	private String status;
	private String elapTime;
	/**
	 * @return the id
	 */
	public String getId() {
		return id;
	}
	/**
	 * @param id the id to set
	 */
	public void setId(String id) {
		this.id = id;
	}
	/**
	 * @return the userName
	 */
	public String getUserName() {
		return userName;
	}
	/**
	 * @param userName the userName to set
	 */
	public void setUserName(String userName) {
		this.userName = userName;
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
	 * @return the status
	 */
	public String getStatus() {
		return status;
	}
	/**
	 * @param status the status to set
	 */
	public void setStatus(String status) {
		this.status = status;
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
	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append("JobDetails [id=");
		builder.append(id);
		builder.append(", userName=");
		builder.append(userName);
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
		builder.append("]");
		return builder.toString();
	}
	
}

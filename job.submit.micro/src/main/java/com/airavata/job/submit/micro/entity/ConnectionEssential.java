package com.airavata.job.submit.micro.entity;

public class ConnectionEssential {

	private String host;
	private String user;
	private int port;
	private String pkFilePath; 
	private String pkPassphrase;
	/**
	 * @return the host
	 */
	public String getHost() {
		return host;
	}
	/**
	 * @param host the host to set
	 */
	public void setHost(String host) {
		this.host = host;
	}
	/**
	 * @return the user
	 */
	public String getUser() {
		return user;
	}
	/**
	 * @param user the user to set
	 */
	public void setUser(String user) {
		this.user = user;
	}
	/**
	 * @return the port
	 */
	public int getPort() {
		return port;
	}
	/**
	 * @param port the port to set
	 */
	public void setPort(int port) {
		this.port = port;
	}
	/**
	 * @return the pkFilePath
	 */
	public String getPkFilePath() {
		return pkFilePath;
	}
	/**
	 * @param pkFilePath the pkFilePath to set
	 */
	public void setPkFilePath(String pkFilePath) {
		this.pkFilePath = pkFilePath;
	}
	/**
	 * @return the pkPassphrase
	 */
	public String getPkPassphrase() {
		return pkPassphrase;
	}
	/**
	 * @param pkPassphrase the pkPassphrase to set
	 */
	public void setPkPassphrase(String pkPassphrase) {
		this.pkPassphrase = pkPassphrase;
	}
	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		builder.append("ConnectionEssential [host=");
		builder.append(host);
		builder.append(", user=");
		builder.append(user);
		builder.append(", port=");
		builder.append(port);
		builder.append(", pkFilePath=");
		builder.append(pkFilePath);
		builder.append(", pkPassphrase=");
		builder.append(pkPassphrase);
		builder.append("]");
		return builder.toString();
	}
		
}

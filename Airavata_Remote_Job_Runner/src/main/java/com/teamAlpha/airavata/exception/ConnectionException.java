package com.teamAlpha.airavata.exception;

public class ConnectionException extends Exception {
	
	private static final long serialVersionUID = 1L;

	private String message;

	public ConnectionException() {
		super();
	}

	public ConnectionException(String message) {
		super();
		this.message = message;
	}

	public ConnectionException(final Throwable e) {
		super(e);
	}

	/**
	 * @return the message
	 */
	public String getMessage() {
		return message;
	}
}

package com.teamAlpha.airavata.exception;

public class JobException extends Exception{
	
	private static final long serialVersionUID = 1L;

	private String message;

	public JobException() {
		super();
	}

	public JobException(String message) {
		super();
		this.message = message;
	}

	public JobException(final Throwable e) {
		super(e);
	}

	/**
	 * @return the message
	 */
	public String getMessage() {
		return message;
	}
}

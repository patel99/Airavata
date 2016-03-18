package com.teamAlpha.airavata.exception;

public class UserManagementException extends Exception{

	private static final long serialVersionUID = 1L;

	private String message;

	public UserManagementException() {
		super();
	}

	public UserManagementException(String message) {
		super();
		this.message = message;
	}

	public UserManagementException(final Throwable e) {
		super(e);
	}

	/**
	 * @return the message
	 */
	public String getMessage() {
		return message;
	}
}

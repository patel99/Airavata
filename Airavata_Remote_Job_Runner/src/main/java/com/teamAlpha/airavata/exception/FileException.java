package com.teamAlpha.airavata.exception;

public class FileException extends Exception{

	private static final long serialVersionUID = 1L;

	private String message;

	public FileException() {
		super();
	}

	public FileException(String message) {
		super();
		this.message = message;
	}

	public FileException(final Throwable e) {
		super(e);
	}

	/**
	 * @return the message
	 */
	public String getMessage() {
		return message;
	}
}

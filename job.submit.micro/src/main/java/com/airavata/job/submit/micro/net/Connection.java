package com.airavata.job.submit.micro.net;

import com.airavata.job.submit.micro.entity.ConnectionEssential;
import com.airavata.job.submit.micro.exception.ConnectionException;
import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.Session;

public interface Connection {

	/**
	 * Get server session
	 * @param connectionEssential
	 * @return session object
	 * @throws ConnectionException
	 */
	Session getSession(ConnectionEssential connectionEssential) throws ConnectionException;
	
	
	/**
	 * Get exec channel
	 * @param session
	 * @return
	 * @throws ConnectionException
	 */
	ChannelExec getExecChannel(Session session) throws ConnectionException;
	
	
	/**
	 * Get sftp channel
	 * @param session
	 * @return
	 * @throws ConnectionException 
	 */
	ChannelSftp getSftpChannel(Session session) throws ConnectionException;
}

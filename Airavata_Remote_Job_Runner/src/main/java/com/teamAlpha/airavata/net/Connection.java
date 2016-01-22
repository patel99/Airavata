package com.teamAlpha.airavata.net;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.Session;
import com.teamAlpha.airavata.domain.ConnectionEssential;
import com.teamAlpha.airavata.exception.ConnectionException;

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

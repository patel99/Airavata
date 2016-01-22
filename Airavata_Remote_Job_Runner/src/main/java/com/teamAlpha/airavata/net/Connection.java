package com.teamAlpha.airavata.net;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.Session;
import com.teamAlpha.airavata.domain.ConnectionEssential;
import com.teamAlpha.airavata.exception.ConnectionException;

public interface Connection {

	/**
	 * @param connectionEssential
	 * @return session object
	 * @throws ConnectionException
	 */
	Session getSession(ConnectionEssential connectionEssential) throws ConnectionException;
	
	
	ChannelExec getExecChannel(Session session);
	
	
	ChannelSftp getSftpChannel(Session session);
}

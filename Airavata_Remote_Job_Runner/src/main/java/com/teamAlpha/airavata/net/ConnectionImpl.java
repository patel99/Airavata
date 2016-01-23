package com.teamAlpha.airavata.net;

import java.util.Properties;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import com.teamAlpha.airavata.domain.ConnectionEssential;
import com.teamAlpha.airavata.exception.ConnectionException;

@Component
public class ConnectionImpl implements Connection {

	private static final Logger LOGGER = LogManager.getLogger(ConnectionImpl.class);
	
	JSch jsch = new JSch();
	
	Properties config = null;
	Session session = null;
	
	ChannelExec execChannel = null;
	ChannelSftp sftpChannel = null;
	
	@Value ("${channel.type.exec}")
	String channelTypeExec;
	
	@Value ("${channel.type.sftp}")
	String channelTypeSftp;
	
	
	/* (non-Javadoc)
	 * @see com.teamAlpha.airavata.net.Connection#getSession(com.teamAlpha.airavata.domain.ConnectionEssential)
	 */
	@Override
	public Session getSession(ConnectionEssential connectionEssential) throws ConnectionException {
		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("getSession() -> Get user session. Connection Essentials : " + connectionEssential.toString());
		}
		try {
			
			config = new Properties();
			jsch = new JSch();
			
			config.put("StrictHostKeyChecking", "no");
			jsch.addIdentity(connectionEssential.getPkFilePath(), connectionEssential.getPkPassphrase());
			
			session = jsch.getSession(connectionEssential.getUser(), connectionEssential.getHost(),
					connectionEssential.getPort());
			session.setConfig(config);
			
			session.connect();
			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("getSession() -> Session created successfully. Connection Essentials : " + connectionEssential.toString());
			}
			
		} catch (JSchException e) {
			LOGGER.error("getSession() -> Error creating session.", e);
			throw new ConnectionException("Error creating session.");
		}
		return session;
	}

	
	/* (non-Javadoc)
	 * @see com.teamAlpha.airavata.net.Connection#getExecChannel(com.jcraft.jsch.Session)
	 */
	@Override
	public ChannelExec getExecChannel(Session session) throws ConnectionException {
		if(LOGGER.isInfoEnabled()){LOGGER.info("getExecChannel -> Get exec channel.");}
		try {
			execChannel = (ChannelExec) session.openChannel(channelTypeExec);
			if(LOGGER.isDebugEnabled()){LOGGER.debug("getExecChannel -> Exec Channel created successfully");}
		} catch (JSchException e) {
			LOGGER.error("getExecChannel() -> Error creating exec channel.", e);
			throw new ConnectionException("Error creating exec channel");
		}		
		return execChannel;
	}

	
	/* (non-Javadoc)
	 * @see com.teamAlpha.airavata.net.Connection#getSftpChannel(com.jcraft.jsch.Session)
	 */
	@Override
	public ChannelSftp getSftpChannel(Session session) throws ConnectionException {
		if(LOGGER.isInfoEnabled()){LOGGER.info("getSftpChannel -> Get sftp channel.");}
		try {
			sftpChannel = (ChannelSftp) session.openChannel(channelTypeSftp);
			if(LOGGER.isDebugEnabled()){LOGGER.debug("getSftpChannel -> SFTP Channel created successfully");}
		} catch (JSchException e) {
			LOGGER.error("getSftpChannel() -> Error creating SFTP channel.", e);
			throw new ConnectionException("Error creating exec channel");
		}		
		return sftpChannel;
	}
	
	
}

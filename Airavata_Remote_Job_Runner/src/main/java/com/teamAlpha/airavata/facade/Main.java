package com.teamAlpha.airavata.facade;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.stereotype.Component;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import com.teamAlpha.airavata.domain.ConnectionEssential;
import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.net.Connection;

@Component
public class Main {

	@Value ("${private.key.path}")
	String privateKeyPath;
	
	@Value ("${private.key.passphrase}")
	String privateKeyPassphrase;
	
	@Value ("${user.name}")
	String userName;
	
	@Value ("${host.id}")
	String hostId;
	
	@Value ("${host.port}")
	String hostPort;
	
	@Autowired
	Connection connection;
	
	public static void main(String[] args) {
		AbstractApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
		Main main = (Main)context.getBean(Main.class);
		context.close();
		main.monitor();
	}
	
	/*
	 * Demonstrate how to use Connection interface
	 */
	boolean monitor(){
		ConnectionEssential ce = new ConnectionEssential();
		ce.setHost(hostId);
		ce.setUser(userName);
		ce.setPort(22);
		ce.setPkFilePath(privateKeyPath);
		ce.setPkPassphrase(privateKeyPassphrase);
		ChannelExec execChannel = null;
		ChannelSftp sftpChannel = null;
		Session s = null;
		try {
			s = connection.getSession(ce);
			execChannel = connection.getExecChannel(s);
			execChannel.connect();
			sftpChannel = connection.getSftpChannel(s);
			sftpChannel.connect();
		} catch (ConnectionException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JSchException e) {
			// TODO: handle exception
		}finally {
			if(null != execChannel && execChannel.isConnected()){
				execChannel.disconnect();
			}
			if(null != sftpChannel && sftpChannel.isConnected()){
				sftpChannel.disconnect();
			}
			if(null != s && s.isConnected()){
				s.disconnect();
			}
		}
		return true;		
	}

}

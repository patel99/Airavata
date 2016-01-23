package com.teamAlpha.airavata.service;
import java.io.FileOutputStream;

import com.jcraft.jsch.Channel;
import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.exception.FileException;

public interface FileManagement {
	
	boolean putFile(String localFilePath, String remoteFilePath, Channel sftpChannel) throws FileException, ConnectionException;
	
	FileOutputStream getFile(String localFilePath, String remoteFilePath, Channel sftpChannel)  throws ConnectionException, FileException;

}

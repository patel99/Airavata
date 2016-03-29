package com.teamAlpha.airavata.service;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

import com.jcraft.jsch.Channel;
import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.exception.FileException;

public interface FileManagement {
	
	boolean putFile(String localFilePath, String remoteFilePath, Channel sftpChannel) throws FileException, ConnectionException;
	
	InputStream getFile(String localFilePath, String remoteFilePath, Channel sftpChannel)  throws ConnectionException, FileException;
	
	boolean putFile(File file, String remoteFilePath, Channel sftpChannel) throws FileException, ConnectionException;

}

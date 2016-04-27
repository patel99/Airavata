package com.airavata.job.submit.micro.service;
import java.io.File;
import java.io.InputStream;

import com.airavata.job.submit.micro.exception.ConnectionException;
import com.airavata.job.submit.micro.exception.FileException;
import com.jcraft.jsch.Channel;


public interface FileManagement {
	
	boolean putFile(String localFilePath, String remoteFilePath, Channel sftpChannel) throws FileException, ConnectionException;
	
	InputStream getFile(String localFilePath, String remoteFilePath, Channel sftpChannel)  throws ConnectionException, FileException;
	
	boolean putFile(File file, String remoteFilePath, Channel sftpChannel) throws FileException, ConnectionException;

}

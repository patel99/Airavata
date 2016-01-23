package com.teamAlpha.airavata.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.SftpException;
import com.teamAlpha.airavata.exception.ConnectionException;
import com.teamAlpha.airavata.exception.FileException;

@Component
public class FileManagementImpl implements FileManagement {
	private static final Logger LOGGER = LogManager.getLogger(FileManagementImpl.class);

	public boolean putFile(String localFilePath, String remoteFilePath, Channel sftpChannel)
			throws FileException, ConnectionException {
		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("putFile() -> Copying file to the server. Local file path : " + localFilePath
					+ ", Remote file path : " + remoteFilePath);
		}

		try {
			File file = new File(localFilePath);

			sftpChannel.connect();
			System.out.println("Connected");

			((ChannelSftp) sftpChannel).cd(remoteFilePath);
			((ChannelSftp) sftpChannel).put(new FileInputStream(file), file.getName());
			System.out.println("File uploaded");
			sftpChannel.disconnect();
			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("putFile() -> File copied to server successfully. Local file path : " + localFilePath
						+ ", Remote file path : " + remoteFilePath);
			}

		} catch (FileNotFoundException e) {
			LOGGER.error(
					"putFile() -> Error copying file to server. File not found on local file path : " + localFilePath,
					e);
			throw new FileException("Error uploading file.");

		} catch (JSchException | SftpException e) {
			LOGGER.error("putFile() -> Error creating SFTP channel.", e);
			throw new ConnectionException("Error uploading file.");
		}
		return true;
	}

	@Override
	public FileOutputStream getFile(String localFilePath, String remoteFilePath, Channel sftpChannel)
			throws ConnectionException, FileException {
		if (LOGGER.isInfoEnabled()) {
			LOGGER.info("getFile() -> Downloading file from server. Local file path : " + localFilePath
					+ ", Remote file path : " + remoteFilePath);
		}
		FileOutputStream targetFile = null;
		try {
			InputStream inputFile = ((ChannelSftp) sftpChannel).get(remoteFilePath);
			targetFile = new FileOutputStream(localFilePath);
			int c;
			while ((c = inputFile.read()) != -1) {
				targetFile.write(c);
			}

			inputFile.close();

			if (LOGGER.isDebugEnabled()) {
				LOGGER.debug("getFile() -> File downloaded from server successfully. Local file path : " + localFilePath
						+ ", Remote file path : " + remoteFilePath);

			}
		} catch (IOException e) {

			LOGGER.error("getFile() -> Error in I/O operations", e);
			throw new FileException("Error downloading file.");

		} catch (SftpException e) {
			LOGGER.error("getFile() ->  Error creating SFTP channel.", e);
			throw new ConnectionException("Error downloading file.");
		}
		return targetFile;

	}
}
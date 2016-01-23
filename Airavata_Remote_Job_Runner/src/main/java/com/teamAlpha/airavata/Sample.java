package com.teamAlpha.airavata;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.SocketException;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;

public class Sample {

	private static final Logger LOGGER = LogManager.getLogger(Sample.class);
	/**
	 * @param args
	 * @throws IOException
	 * @throws SocketException
	 */
	public static void main(String[] args) throws SocketException, IOException {
		String host = "karst.uits.iu.edu";
		String user = "adhamnas";
		String command1 = "cd /N/dc2/scratch/adhamnas/job-submission \n ls -ltr";
		StringBuffer sb = new StringBuffer();
		try {

			java.util.Properties config = new java.util.Properties();
			config.put("StrictHostKeyChecking", "no");
			// config.put("cipher.s2c", "aes256-cbc");
			JSch jsch = new JSch();
			jsch.addIdentity("F:\\IUB\\Semester2\\SGA\\putty_private_key.ppk", "Ajinkya123$");
			Session session = jsch.getSession(user, host, 22);
			// session.setPassword(password);

			session.setConfig(config);
			session.connect();
			System.out.println("Connected");

			Channel channel = session.openChannel("exec");
			
			((ChannelExec) channel).setCommand(command1);
			channel.setInputStream(null);
			((ChannelExec) channel).setErrStream(System.err);

			InputStream in = channel.getInputStream();
			channel.connect();
			byte[] tmp = new byte[1024];
			while (true) {
				while (in.available() > 0) {
					int i = in.read(tmp, 0, 1024);
					if (i < 0)
						break;
					{
						// System.out.print(new String(tmp, 0, i));
						sb.append(new String(tmp, 0, i));
					}
				}
				if (channel.isClosed()) {
					System.out.println("exit-status: " + channel.getExitStatus());
					break;
				}
				try {
					Thread.sleep(1000);
				} catch (Exception ee) {
				}
			}
			// String[] ar = sb.toString().split(" ");
			System.out.println(sb.toString());
			channel.disconnect();
			File f = new File("F:\\IUB\\Semester2\\SGA\\M1\\hello.c");
			File f2 = new File("F:\\IUB\\Semester2\\SGA\\M1\\pbs.sh");
			// FileOutputStream targetFile = new
			// FileOutputStream("F:\\IUB\\Semester2\\SGA\\M1\\hello.c");
			channel = (ChannelSftp) session.openChannel("sftp");
			channel.connect();
			System.out.println("Connected");
			ChannelSftp sftpChannel = (ChannelSftp) channel;
			sftpChannel.cd("/N/dc2/scratch/adhamnas/job-submission");
			sftpChannel.put(new FileInputStream(f), f.getName());
			sftpChannel.put(new FileInputStream(f2), f2.getName());
			System.out.println("File uploaded");
			channel.disconnect();
			channel = session.openChannel("exec");
			((ChannelExec) channel).setCommand(
					" cd /N/dc2/scratch/adhamnas/job-submission \n mpicc hello.c -o hello.out \n dos2unix pbs.sh");
			channel.setInputStream(null);
			((ChannelExec) channel).setErrStream(System.err);

			in = channel.getInputStream();
			channel.connect();
			tmp = new byte[1024];
			while (true) {
				while (in.available() > 0) {
					int i = in.read(tmp, 0, 1024);
					if (i < 0)
						break;
					{
						System.out.println(new String(tmp, 0, i));
						
						
						// sb.append(new String(tmp, 0, i));
					}
				}
				if (channel.isClosed()) {
					System.out.println("exit-status: " + channel.getExitStatus());
					break;
				}
				try {
					Thread.sleep(1000);
				} catch (Exception ee) {
				}
			}			
			channel.disconnect();

			session.disconnect();
			System.out.println("DONE");
		} catch (Exception e) {
			e.printStackTrace();
			System.out.println(e);
		}
	}
}

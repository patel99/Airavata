package com.teamAlpha.airavata.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.ConnectException;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

@Component
public class Utilities {
	
	private static final Logger LOGGER = LogManager.getLogger(Utilities.class);
	
	public static String getStringFromIS(InputStream in) throws IOException{
		
		BufferedReader br = null;
		String line;
		
		StringBuilder sb = new StringBuilder();
		if(LOGGER.isInfoEnabled()){
			LOGGER.info("getStringFromIS() -> Get string from input stream");
		}
		try {
		br = new BufferedReader(new InputStreamReader(in));
		
			while ((line = br.readLine()) != null) {
				sb.append(line);
			}
			return sb.toString();
		} catch (IOException e) {
			LOGGER.error("getStringFromIS() -> Invalid input stream from server.", e);
			throw new ConnectException("Invalid input stream from server");
		}finally {
			if(null != br){
				br.close();
			}
		}
		
	}
}

package com.teamAlpha.airavata.utils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public class FileUtils {

	public static File getFileFromMultipartFile(MultipartFile multipartFile) throws IOException {

		String tDir = System.getProperty("java.io.tmpdir");		
		File convFile = new File(tDir+"/"+multipartFile.getOriginalFilename());
		FileOutputStream fos = new FileOutputStream(convFile);
		fos.write(multipartFile.getBytes());
		fos.close();
		return convFile;

	}
}

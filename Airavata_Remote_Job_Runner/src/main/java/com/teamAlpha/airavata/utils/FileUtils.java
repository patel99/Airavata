package com.teamAlpha.airavata.utils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public class FileUtils {

	public static File getFileFromMultipartFile(MultipartFile multipartFile) throws IOException {

		File convFile = File.createTempFile(multipartFile.getOriginalFilename().split("\\.")[0],
				multipartFile.getOriginalFilename().split("\\.")[1]);
		convFile.createNewFile();
		FileOutputStream fos = new FileOutputStream(convFile);
		fos.write(multipartFile.getBytes());
		fos.close();
		return convFile;

	}
}

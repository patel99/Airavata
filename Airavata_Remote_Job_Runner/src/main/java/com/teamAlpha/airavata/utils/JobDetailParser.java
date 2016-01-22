package com.teamAlpha.airavata.utils;

import com.teamAlpha.airavata.domain.JobDetails;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.StringTokenizer;

public class JobDetailParser{
	private static ArrayList<JobDetails> jobs = new ArrayList<JobDetails>();
	public static void main(String[] args) throws IOException{
		BufferedReader fileReader;
		int lineCount=0,objectCount=0;
		try {
			fileReader = new BufferedReader(new FileReader("/home/pratik/test.txt"));
		    String line = fileReader.readLine();
		    while(line !=null){
		    	lineCount++;
		    	if(line.startsWith("---")){
		    		line = fileReader.readLine();
		    		break;
		    	}
	        	line = fileReader.readLine();
		    }
		    while (line != null) {
		        lineCount++;
		        objectCount++;
		        // Calling function to parse data using string tokenizer, which will return a object of type JobDetails
		        jobs.add(parseDetails(line));
		        line = fileReader.readLine();
		    }
		    fileReader.close();
		} 
		catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		catch (Exception e){
			e.printStackTrace();
		}
	}
	
	private static JobDetails parseDetails(String temp){
		//System.out.println(temp);
		JobDetails job = new JobDetails();
		int index=0;
		StringTokenizer st = new StringTokenizer(temp);
		while(st.hasMoreTokens()){
			switch(index){
			case 0:
				job.setId(st.nextToken());
				break;
			case 1:
				job.setUserName(st.nextToken());
				break;
			case 2:
				job.setQueueType(st.nextToken());
				break;
			case 3:
				job.setJobName(st.nextToken());
				break;
			case 4:
				job.setSessionId(st.nextToken());
				break;
			case 5:
				job.setNodes(st.nextToken());
				break;
			case 6:
				job.setNoOfTasks(st.nextToken());
				break;
			case 7:
				job.setMemory(st.nextToken());
				break;
			case 8:
				job.setTime(st.nextToken());
				break;
			case 9:
				job.setStatus(st.nextToken());
				break;
			case 10:
				job.setElapTime(st.nextToken());
				break;
			default:
				break;
			}
			index++;
		}
		//System.out.println(job.toString());
		return job;
	}
}
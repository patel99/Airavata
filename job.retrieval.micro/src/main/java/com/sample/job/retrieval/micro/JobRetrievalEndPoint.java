package com.sample.job.retrieval.micro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

@ComponentScan
@EnableAutoConfiguration
public class JobRetrievalEndPoint {

	public static void main(String[] args) {

		SpringApplication.run(JobRetrievalEndPoint.class, args);

	}

}

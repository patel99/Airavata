package com.user.register.micro.endpoint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

@ComponentScan
@EnableAutoConfiguration
public class UserManagementEndPoint {

	public static void main(String[] args) {

		SpringApplication.run(UserManagementEndPoint.class, args);

	}

}

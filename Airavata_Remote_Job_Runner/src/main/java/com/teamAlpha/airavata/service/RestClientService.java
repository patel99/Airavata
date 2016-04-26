package com.teamAlpha.airavata.service;

import javax.ws.rs.core.MultivaluedMap;

import com.sun.jersey.api.client.ClientResponse;

public interface RestClientService {

	ClientResponse get(String url);
	ClientResponse post(String url, MultivaluedMap requestData);
}

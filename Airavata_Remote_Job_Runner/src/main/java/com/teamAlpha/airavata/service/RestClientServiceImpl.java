package com.teamAlpha.airavata.service;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.core.util.MultivaluedMapImpl;

public class RestClientServiceImpl implements RestClientService {

	@Override
	public ClientResponse get(String url) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ClientResponse post(String url, MultivaluedMap requestData) {
		// TODO Auto-generated method stub

		ClientResponse response = null;

		try {

			Client client = Client.create();

			WebResource webResource = client.resource(url);

			response = webResource.type(MediaType.APPLICATION_FORM_URLENCODED_TYPE).post(ClientResponse.class,
					requestData);

			if (response.getStatus() != 200) {
				throw new RuntimeException("Failed : HTTP error code : " + response.getStatus());
			}

		} catch (Exception e) {

			e.printStackTrace();

		}

		return response;
	}

}

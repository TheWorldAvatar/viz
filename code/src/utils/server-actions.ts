/**
 * Server actions for adding, deleting, and editing entities.
 */
'use server';

import { FieldValues } from 'react-hook-form';


export interface CustomAgentResponseBody {
  message: string;
  success?: boolean;
  iri?: string;
}


/**
 * Sends a GET request to the specified agent to execute its task, and return its text if required.
 * 
 * @param {string} agentApi API endpoint.
 */
export async function sendGetRequest(agentApi: string): Promise<string> {
  const res = await sendRequest(agentApi, "GET");
  return res.text();
}

/**
 * Sends a POST request with parameters to the specified agent to execute its task, and return its text if required.
 * 
 * @param {string} agentApi API endpoint.
 * @param {string} jsonBody Parameters in JSONIFIED string.
 */
export async function sendPostRequest(agentApi: string, jsonBody: string): Promise<CustomAgentResponseBody> {
  const response = await sendRequest(agentApi, "POST", "application/json", jsonBody);
  const responseBody: string = await response.text();
  return { success: response.ok, message: responseBody };
}

/**
 * Retrieves the form template for the associated entity type.
 * 
 * @param {string} agentApi API endpoint.
 * @param {string} entityType Type of the entity.
 * @param {FieldValues} form Form storing the input data.
 */
export async function getMatchingInstances(agentApi: string, entityType: string, form: FieldValues): Promise<CustomAgentResponseBody> {
  const url: string = `${agentApi}/${entityType}/search`;
  const reqBody: string = JSON.stringify(form);
  const response = await sendRequest(url, "POST", "application/json", reqBody);
  const responseBody: string = await response.text();
  return { success: response.ok, message: responseBody };
}

/**
 * Add the entity to the knowledge graph.
 * 
 * @param {string} agentApi API endpoint.
 * @param {FieldValues} form Form storing the input data.
 * @param {string} entityType Target entity type.
 */
export async function addEntity(agentApi: string, form: FieldValues, entityType: string): Promise<CustomAgentResponseBody> {
  const reqBody: string = JSON.stringify({
    ...form,
    entity: entityType,
  });
  const response = await sendRequest(`${agentApi}/${entityType}`, "POST", "application/json", reqBody);
  const responseBody: CustomAgentResponseBody = await response.json();
  return { success: response.ok, ...responseBody };
}

/**
 * Update the entity information within the knowledge graph.
 * 
 * @param {string} agentApi API endpoint.
 * @param {string} jsonBody JSON body for updating.
 */
export async function updateEntity(agentApi: string, jsonBody: string): Promise<CustomAgentResponseBody> {
  const response = await sendRequest(agentApi, "PUT", "application/json", jsonBody);
  const responseBody: CustomAgentResponseBody = await response.json();
  return { success: response.ok, ...responseBody };
}


/**
 * Delete the entity associated with the id.
 * 
 * @param {string} agentApi API endpoint.
 * @param {string} id Target entity id.
 * @param {string} entityType Target entity type.
 */
export async function deleteEntity(agentApi: string, id: string, entityType: string): Promise<CustomAgentResponseBody> {
  const response = await sendRequest(`${agentApi}/${entityType}/${id}`, "DELETE", "application/json");
  const responseBody: CustomAgentResponseBody = await response.json();
  return { success: response.ok, ...responseBody };
}

/**
 * This function is a reusable method to send a request to the specified endpoint with any optional values.
 * 
 * @param {string} endpoint The target endpoint for sending the request
 * @param {string} methodType Type of request method - DELETE, GET, PUT, POST
 * @param {string} contentType Type of request content - application/json - Optional for GET request
 * @param {string} jsonBody Optional body parameter to be passed in request
 */
async function sendRequest(
  endpoint: string,
  methodType: string,
  contentType?: string,
  jsonBody?: string,
  bearerToken?: string | string[] // Add optional bearer token
): Promise<Response> {
  const options: RequestInit = {
    method: methodType,
    headers: {
      "Content-Type": contentType,
      ...(bearerToken && { Authorization: `Bearer ${bearerToken}` }), // Add Authorization header if token is provided
    },
  };

  if (jsonBody) {
    options.body = jsonBody;
  }

  const response = methodType === "GET" ? await fetch(endpoint) : await fetch(endpoint, options);
  if (!response.ok) {
    console.error("Failed to complete request: ", response);
  }
  return response;
}
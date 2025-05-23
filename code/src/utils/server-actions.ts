/**
 * Server actions for adding, deleting, and editing entities.
 */
'use server';

import { Paths } from 'io/config/routes';
import { FieldValues } from 'react-hook-form';

import { RegistryFieldValues, FormTemplate, OntologyConcept, PropertyShape } from 'types/form';

export interface CustomAgentResponseBody {
  message: string;
  success?: boolean;
  iri?: string;
}

/**
 * Retrieves all data of the specified type.
 * 
 * @param {string} agentApi API endpoint.
 * @param {string} entityType Type of entity to retrieve.
 * @param {string} identifier Optional identifier of the parent entity.
 * @param {string} subEntityType Optional type of sub entity to retrieve entities associated with the specific parent entity.
 * @param {boolean} requireLabel Optional indicator to retrieve labelled data if requested.
 */
export async function getData(agentApi: string, entityType: string, identifier?: string, subEntityType?: string, requireLabel?: boolean): Promise<RegistryFieldValues[]> {
  // Append identifier to the url if it exist
  let url: string = `${agentApi}/${entityType}`;
  if (requireLabel) {
    url += `/label`;
  }
  if (identifier) {
    url += `/${identifier}`;
    if (subEntityType) {
      url += `/${subEntityType}`;
    }
  }
  const res = await sendRequest(url, "GET");
  const responseData = await res.json();
  let parsedResponse: RegistryFieldValues[];
  // If response is a single object, store it as an array
  if (!Array.isArray(responseData)) {
    parsedResponse = [responseData];
  } else {
    parsedResponse = responseData;
  }
  return parsedResponse;
}

/**
 * Retrieves the geolocation from the API endpoint based on the query parameters.
 * 
 * @param {string} agentApi API endpoint.
 * @param {Record<string, string | undefined>} params query parameters.
 */
export async function getGeolocation(agentApi: string, params: Record<string, string | undefined>): Promise<number[]> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    // Only append the search param if there is a value
    if (value) searchParams.append(key, value);
  });
  const url: string = `${agentApi}?${searchParams.toString()}`;
  const results = await sendGetRequest(url);
  if (results == "There are no coordinates associated with the parameters in the knowledge graph.") {
    return [];
  }
  return JSON.parse(results);
}

/**
 * Retrieves all data of the specified type associated with a lifecycle. Fields are returned with human-readable labels.
 * 
 * @param {string} agentApi API endpoint.
 * @param {string} currentStage Current stage of the lifecycle.
 * @param {string} entityType Type of entity to retrieve.
 */
export async function getLifecycleData(agentApi: string, currentStage: string, entityType: string): Promise<RegistryFieldValues[]> {
  let stagePath: string;
  if (currentStage == Paths.REGISTRY_PENDING) {
    stagePath = "draft";
  } else if (currentStage == Paths.REGISTRY_ACTIVE) {
    stagePath = "service";
  } else if (currentStage == Paths.REGISTRY_ARCHIVE) {
    stagePath = "archive";
  }
  const res = await sendRequest(`${agentApi}/contracts/${stagePath}?type=${entityType}&label=yes`, "GET");
  const responseData = await res.json();
  return responseData;
}


/**
 * Retrieves all service tasks in a lifecycle on the specified day or contract. Fields are returned with human-readable labels.
 * Note that if time and id is provided, time will take precedence over id.
 * 
 * @param {string} agentApi API endpoint.
 * @param {string} contractType The contract's resource identifier as a type.
 * @param {string} id Optional contract ID associated with the tasks.
 * @param {number} time Optional target day in UNIX timestamp format.
 */
export async function getServiceTasks(agentApi: string, contractType: string, id?: string, time?: number): Promise<RegistryFieldValues[]> {
  const url: string = `${agentApi}/contracts/service/${time ?? id}?type=${contractType}`;
  const res = await sendRequest(url, "GET");
  const responseData = await res.json();
  return responseData;
}

/**
 * Retrieves all available ontology types for the specified class.
 * 
 * @param {string} agentApi API endpoint.
 * @param {string} uri Target ontology class.
 */
export async function getAvailableTypes(agentApi: string, uri: string): Promise<OntologyConcept[]> {
  const res = await sendRequest(`${agentApi}/type?uri=${uri}`, "GET");
  return await res.json();
}

/**
* Retrieves the form template for a specific lifecycle event.
* 
* @param {string} agentApi API endpoint.
* @param {string} lifecycleStage The target lifecycle stage ie service or archive.
* @param {string} eventType The target event type: dispatch, report, cancel, terminate, rescind.
* @param {string} identifier The target identifier for a specific order OR use "form" if retrieving only a template.
*/
export async function getLifecycleFormTemplate(endpoint: string, lifecycleStage: string, eventType: string, identifier: string): Promise<PropertyShape[]> {
  const url: string = `${endpoint}/contracts/${lifecycleStage}/${eventType}/${identifier}`;
  const form: string = await sendGetRequest(url);
  return JSON.parse(form).property;
}

/**
 * Retrieves the form template for the associated entity type.
 * 
 * @param {string} agentApi API endpoint.
 * @param {string} entityType Type of the entity.
 * @param {string} identifier Optional identifier of the parent entity.
 */
export async function getFormTemplate(agentApi: string, entityType: string, identifier?: string): Promise<FormTemplate> {
  let url: string = `${agentApi}/form/${entityType}`;
  if (identifier) {
    url += `/${identifier}`;
  }
  const res = await sendRequest(url, "GET");
  return await res.json();
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
async function sendRequest(endpoint: string, methodType: string, contentType?: string, jsonBody?: string): Promise<Response> {
  const options: RequestInit = {
    method: methodType,
    headers: {
      "Content-Type": contentType,
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
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { JsonObject } from 'types/json';
import { ScenarioDimensionsData } from 'types/timeseries';

/**
 * Define a service that fetches supporting data for a given feature based on its IRI, stack endpoint, and a specified scenario ID.
 * This data includes, but is not limited to, metadata and timeseries data associated with the feature. 
 * It will require the feature's IRI, stack name, and the scenario ID in this sequence.
 */
const baseQuery = fetchBaseQuery({
  baseUrl: '',
  fetchFn: async (input, init) => {
    const response = await fetch(input, init);
    const contentType = response.headers.get('content-type');
    const charsetMatch = contentType?.match(/charset=([^;]+)/i);
    const charset = charsetMatch ? charsetMatch[1] : 'utf-8';
    const reader = response.body.getReader();
    const decoder = new TextDecoder(charset);
    let result = '';
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      result += decoder.decode(value, { stream: !done });
    }

    return new Response(result, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  },
});

export const featureInfoAgentApi = createApi({
  reducerPath: 'api',
  baseQuery,
  endpoints: (builder) => ({
    fetchData: builder.query<JsonObject, string>({
      query: (url) => `${url}`,
    }),
    fetchDimensions: builder.query<ScenarioDimensionsData, string>({
      query: (url) => `${url}`,
    }),
  }),
});

// Export hooks for usage in functional components, which are auto-generated based on the defined endpoints
export const { useFetchDataQuery, useFetchDimensionsQuery } = featureInfoAgentApi;
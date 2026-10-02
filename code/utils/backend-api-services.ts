const BackendApis = {
  REGISTRY_BACKEND: process.env.REGISTRY_BACKEND_URL,
  REGISTRY_TASK_ATTACHMENT: process.env.REGISTRY_TASK_ATTACHMENT_URL,
  FILE_EXPORTER: process.env.FILE_EXPORTER_URL,
};

/**
 * Get the backend API URL for a given service key.
 * Throws an error if the service is not configured in the environment variables.
 * 
 * @param service The resource identifier representing the backend service.
 */
export function getBackendApi(service: keyof typeof BackendApis) {
  const url: string = BackendApis[service];
  if (!url) throw new Error(`Backend for ${service} not configured.`);
  return url;
}
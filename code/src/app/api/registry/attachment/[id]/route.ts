import fs from 'fs';
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { ContractDirectory } from "types/backend-agent";
import { buildUrl } from "utils/client-utils";
import { getBackendApi } from "utils/internal-api-services";

/**
 * Get request handler
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ContractDirectory>> {
  let url: string = "";
  let fileList: string[] = [];
  try {
    const urlPrefix: string = getBackendApi("REGISTRY_TASK_ATTACHMENT");
    // Build url with id parameter
    const { id } = await params;

    fileList = await getFiles(id);
    url = buildUrl(urlPrefix, id);

  } catch (_error) {
    console.warn("Ignoring attachment checks as no valid API is configured!");
    return NextResponse.json({
      url,
      files: fileList,
    });
  }

  // Early termination
  if (fileList.length == 0) {
    console.info("No files detected in directory...");
    return NextResponse.json({
      url,
      files: fileList,
    });
  }

  // Get the Accept-Language header from the request
  const acceptLanguageHeader = req.headers.get("accept-language");
  // Get the bearer token from the custom header
  const bearerToken = req.headers.get("x-bearer-token");

  const response = await fetch(url, {
    method: "HEAD", headers: {
      ...(acceptLanguageHeader && { "Accept-Language": acceptLanguageHeader }),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    cache: "no-store",
  });

  return NextResponse.json({
    url,
    files: response.ok ? fileList : [],
  });
}

/**
 * Gets a list of files in the target directory of a specific contract.
 * 
 * @param id The identifier for the target directory for a specific contract 
 */
export async function getFiles(id: string) {
  const contractDir: string = path.join(process.cwd(), "data", id);
  if (!fs.existsSync(contractDir)) return [];
  return fs.readdirSync(contractDir);
}
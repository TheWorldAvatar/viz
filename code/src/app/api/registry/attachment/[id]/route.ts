import fs from 'fs';
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { ContractDirectory } from "types/backend-agent";
import { FileEntry } from 'types/settings';
import { buildUrl } from "utils/client-utils";
import { getBackendApi } from "utils/internal-api-services";

const units: string[] = ["B", "KB", "MB", "GB", "TB"];

/**
 * Get request handler
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ContractDirectory>> {
  let url: string = "";
  let fileList: FileEntry[] = [];
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
export async function getFiles(id: string): Promise<FileEntry[]> {
  const contractDir: string = path.join(process.cwd(), "data", id);
  if (!fs.existsSync(contractDir)) return [];
  const dirContents: fs.Dirent[] = fs.readdirSync(contractDir, { withFileTypes: true });
  return dirContents.filter(content => content.isFile()) // Exclude sub-folders
    .map(file => {
      const stats: fs.Stats = fs.statSync(path.join(contractDir, file.name));
      return {
        name: file.name,
        ext: path.extname(file.name),
        size: formatFileSize(stats.size),
      };
    });
}

/**
 * Formats the file size into a readable number.
 * 
 * @param bytes The file size in bytes.
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  // Reference the target unit index in the units array
  const i: number = Math.floor(Math.log(bytes) / Math.log(1024));

  const size: number = bytes / Math.pow(1024, i);
  return `${size.toFixed(2)} ${units[i]}`;
}
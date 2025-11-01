import * as cheerio from "cheerio";
import { exec } from "child_process";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import { homedir, platform } from "os";
import { join } from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

// Constants
export const DOCS_BASE_URL = "https://developer.4d.com/docs/commands";
const USER_AGENT = "mcp-4d-docs/0.1.0";

/**
 * Get the OS-specific cache directory for storing documentation
 */
export function getCacheDir(): string {
  const sys = platform();
  let cacheBase: string;

  if (sys === "darwin") {
    // macOS
    cacheBase = join(homedir(), "Library", "Caches");
  } else if (sys === "win32") {
    // Windows
    cacheBase = process.env.LOCALAPPDATA || join(homedir(), "AppData", "Local");
  } else {
    // Linux and others
    cacheBase = join(homedir(), ".cache");
  }

  const cacheDir = join(cacheBase, "mcp-4d-docs");
  
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  return cacheDir;
}

/**
 * Encode a 4D command name for URL usage
 * Examples:
 *   "ACTIVITY SNAPSHOT" -> "activity-snapshot"
 *   "ARRAY TO LIST" -> "array-to-list"
 */
export function encodeCommandName(commandName: string): string {
  return commandName.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Generate a cache key for a command name using MD5 hash
 */
export function getCacheKey(commandName: string): string {
  return createHash("md5").update(commandName).digest("hex");
}

/**
 * Get the URL for a 4D command documentation page
 */
export function getCommandUrl(commandName: string): string {
  const encodedName = encodeCommandName(commandName);
  return `${DOCS_BASE_URL}/${encodedName}`;
}

/**
 * Get the cache file path for a command
 */
export function getCacheFilePath(commandName: string): string {
  const cacheDir = getCacheDir();
  const cacheKey = getCacheKey(commandName);
  return join(cacheDir, `${cacheKey}.html`);
}

/**
 * Fetch documentation for a 4D command from the developer website
 */
export async function fetchDocumentation(commandName: string): Promise<string> {
  const cacheFile = getCacheFilePath(commandName);

  // Check cache first
  if (existsSync(cacheFile)) {
    console.error(`Cache hit for command: ${commandName}`);
    return readFileSync(cacheFile, "utf-8");
  }

  // Fetch from web
  const url = getCommandUrl(commandName);

  console.error(`Fetching documentation from: ${url}`);

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const html = await response.text();

  // Parse HTML and extract article from main
  const $ = cheerio.load(html);
  const mainTag = $("main");

  if (mainTag.length === 0) {
    throw new Error(`No <main> tag found for command: ${commandName}`);
  }

  const articleTag = mainTag.find("article");

  if (articleTag.length === 0) {
    throw new Error(`No <article> tag found in <main> for command: ${commandName}`);
  }

  // Remove the first <nav> node inside <article> (breadcrumb navigation)
  articleTag.find('nav').first().remove();

  // Rewrite relative /docs/ links to absolute URLs
  const BASE = 'https://developer.4d.com';
  
  articleTag.find('[href^="/docs/"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      $(el).attr('href', BASE + href);
    }
  });

  articleTag.find('[src^="/docs/"]').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
      $(el).attr('src', BASE + src);
    }
  });

  const articleHtml = $.html(articleTag);

  // Cache the result
  writeFileSync(cacheFile, articleHtml, "utf-8");
  console.error(`Cached documentation for command: ${commandName}`);

  return articleHtml;
}

/**
 * Clear all cached documentation files
 */
export function clearCache(): number {
  const cacheDir = getCacheDir();
  
  if (!existsSync(cacheDir)) {
    return 0;
  }

  const files = readdirSync(cacheDir).filter((file) => file.endsWith(".html"));
  
  for (const file of files) {
    unlinkSync(join(cacheDir, file));
  }

  return files.length;
}

/**
 * Open a 4D command documentation URL in the default web browser
 */
export async function openCommandInBrowser(commandName: string): Promise<string> {
  const url = getCommandUrl(commandName);

  const sys = platform();
  let command: string;

  if (sys === "darwin") {
    command = `open "${url}"`;
  } else if (sys === "win32") {
    command = `start "" "${url}"`;
  } else {
    // Linux and others
    command = `xdg-open "${url}"`;
  }

  try {
    await execAsync(command);
    return `Opened ${url} in default browser`;
  } catch (error) {
    throw new Error(`Failed to open browser: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * @mcp-decorator/plugin-http
 *
 * HTTP operations plugin for MCP Decorator Framework
 */

import {
  Command,
  Param,
  type MCPResponse,
  type Plugin,
} from "@mcp-decorator/core";
import { z } from "zod";

/**
 * HTTP plugin options
 */
export interface HttpOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Default headers to include in all requests */
  headers?: Record<string, string>;
}

let httpOptions: HttpOptions = {
  timeout: 30000,
  headers: {},
};

/**
 * Make HTTP request with timeout
 */
async function makeRequest(
  url: string,
  options: RequestInit
): Promise<{ status: number; headers: Record<string, string>; body: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), httpOptions.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...httpOptions.headers,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const body = await response.text();

    return {
      status: response.status,
      headers,
      body,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${httpOptions.timeout}ms`);
    }
    throw error;
  }
}

/**
 * Format HTTP response
 */
function formatResponse(result: {
  status: number;
  headers: Record<string, string>;
  body: string;
}): string {
  const headerLines = Object.entries(result.headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  return `Status: ${result.status}\n\nHeaders:\n${headerLines}\n\nBody:\n${result.body}`;
}

/**
 * GET request
 */
@Command("http.get", "Make GET request")
class GetCommand {
  @Param(z.string().url().describe("URL to request"))
  url!: string;

  @Param(z.record(z.string()).optional().describe("Request headers"))
  headers?: Record<string, string>;

  async execute(params: {
    url: string;
    headers?: Record<string, string>;
  }): Promise<MCPResponse> {
    try {
      const result = await makeRequest(params.url, {
        method: "GET",
        headers: params.headers,
      });

      return {
        content: [
          {
            type: "text",
            text: formatResponse(result),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error making GET request: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

/**
 * POST request
 */
@Command("http.post", "Make POST request")
class PostCommand {
  @Param(z.string().url().describe("URL to request"))
  url!: string;

  @Param(z.string().optional().describe("Request body"))
  body?: string;

  @Param(z.record(z.string()).optional().describe("Request headers"))
  headers?: Record<string, string>;

  async execute(params: {
    url: string;
    body?: string;
    headers?: Record<string, string>;
  }): Promise<MCPResponse> {
    try {
      const result = await makeRequest(params.url, {
        method: "POST",
        body: params.body,
        headers: params.headers,
      });

      return {
        content: [
          {
            type: "text",
            text: formatResponse(result),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error making POST request: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

/**
 * PUT request
 */
@Command("http.put", "Make PUT request")
class PutCommand {
  @Param(z.string().url().describe("URL to request"))
  url!: string;

  @Param(z.string().optional().describe("Request body"))
  body?: string;

  @Param(z.record(z.string()).optional().describe("Request headers"))
  headers?: Record<string, string>;

  async execute(params: {
    url: string;
    body?: string;
    headers?: Record<string, string>;
  }): Promise<MCPResponse> {
    try {
      const result = await makeRequest(params.url, {
        method: "PUT",
        body: params.body,
        headers: params.headers,
      });

      return {
        content: [
          {
            type: "text",
            text: formatResponse(result),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error making PUT request: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

/**
 * DELETE request
 */
@Command("http.delete", "Make DELETE request")
class DeleteCommand {
  @Param(z.string().url().describe("URL to request"))
  url!: string;

  @Param(z.record(z.string()).optional().describe("Request headers"))
  headers?: Record<string, string>;

  async execute(params: {
    url: string;
    headers?: Record<string, string>;
  }): Promise<MCPResponse> {
    try {
      const result = await makeRequest(params.url, {
        method: "DELETE",
        headers: params.headers,
      });

      return {
        content: [
          {
            type: "text",
            text: formatResponse(result),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error making DELETE request: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }
}

/**
 * HTTP Plugin
 *
 * Provides HTTP request operations
 */
export class HttpPlugin implements Plugin {
  name = "http";
  version = "0.1.0";

  constructor(private options?: HttpOptions) {}

  async init() {
    if (this.options) {
      httpOptions = { ...httpOptions, ...this.options };
    }
  }

  register() {
    return [GetCommand, PostCommand, PutCommand, DeleteCommand];
  }
}

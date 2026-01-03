import { getCookie } from "@/actions/cookie_actions";

// Type definitions
interface ApiClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

interface RequestConfig extends Omit<RequestInit, "body" | "headers"> {
  url: string;
  data?: any;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

interface ApiError<T = any> extends Error {
  response?: {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
  };
  request?: RequestInit;
  config?: RequestConfig;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private credentials: RequestCredentials;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL =
      config.baseURL || process.env.NEXT_PUBLIC_API_URL || "https://ec2-65-2-40-197.ap-south-1.compute.amazonaws.com";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
    this.credentials = config.credentials || "include";
  }

  private buildURL(
    url: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    if (!params) return fullURL;

    const urlObj = new URL(fullURL);
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.append(key, String(value));
    });

    return urlObj.toString();
  }

  private async prepareHeaders(): Promise<Record<string, string>> {
    const headers = { ...this.defaultHeaders };

    try {
      if (typeof window === "undefined") {
        const token = await getCookie("token");
        if (token) {
          headers.Cookie = `token=${token}`;
        }
      }
    } catch (error) {
      console.warn("Failed to get token from cookie:", error);
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: T;

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as T;
    }

    if (!response.ok) {
      if (response.status === 401) {
          // Token expired or invalid
           if (typeof window !== "undefined") {
              // Clear cookie via js if possible (HttpOnly won't work but we can try)
              document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
              if (!window.location.pathname.startsWith("/login")) {
                  window.location.href = "/login";
              }
           }
      }
      const error: ApiError = new Error(
        `HTTP Error: ${response.status} ${response.statusText}`
      );
      error.response = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
      throw error;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { url, data, params, headers: configHeaders, ...restConfig } = config;

    const requestHeaders = {
      ...(await this.prepareHeaders()),
      ...configHeaders,
    };

    // Remove Content-Type for FormData (browser sets it with boundary)
    if (data instanceof FormData) {
      delete requestHeaders["Content-Type"];
    }

    const requestUrl = this.buildURL(url, params);

    const requestConfig: RequestInit = {
      ...restConfig,
      headers: requestHeaders,
      credentials: this.credentials,
    };

    // Add body for methods that support it
    if (
      data &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(
        config.method?.toUpperCase() || "GET"
      )
    ) {
      // Don't stringify FormData
      if (data instanceof FormData) {
        requestConfig.body = data;
      } else {
        requestConfig.body = typeof data === "string" ? data : JSON.stringify(data);
      }
    }

    try {
      console.log(`[ApiClient] Request: ${config.method || 'GET'} ${requestUrl}`);
      const response = await fetch(requestUrl, requestConfig);
      return this.handleResponse<T>(response);
    } catch (error) {
      // Re-throw fetch errors (network errors, etc.)
      throw error;
    }
  }

  // Convenience methods
  async get<T = any>(
    url: string,
    config?: Omit<RequestConfig, "url" | "method">
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: "GET" });
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, "url" | "method" | "data">
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: "POST", data });
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, "url" | "method" | "data">
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: "PUT", data });
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: Omit<RequestConfig, "url" | "method" | "data">
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: "PATCH", data });
  }

  async delete<T = any>(
    url: string,
    config?: Omit<RequestConfig, "url" | "method">
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: "DELETE" });
  }
}

// Create and export the default instance
const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://buildrapi.shivangyadav.com",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;

// Export types for use in other files
export type { ApiResponse, RequestConfig, ApiClientConfig, ApiError };

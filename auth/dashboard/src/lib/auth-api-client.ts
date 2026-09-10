export class AuthApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = "/api/auth") {
    this.baseUrl = baseUrl;
  }

  async getOpenApiSchema(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/open-api/generate-schema`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`OpenAPI request failed (${response.status})`);
    }

    return response.json();
  }
}

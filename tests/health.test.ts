import { describe, expect, test } from "vitest";
import app from "../src/server";

describe("Health check", () => {
  test("GET /health returns 200", async () => {
    const response = await app.request("/health", { method: "GET" });
    const jsonBody = await response.json();
    expect(response.status).toBe(200);
    expect(jsonBody.message).toBe("OK");
    expect(jsonBody.uptime).toBeGreaterThanOrEqual(0);
  });
});

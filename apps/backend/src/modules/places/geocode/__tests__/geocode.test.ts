import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { Hono } from "hono";
import geocode from "../index";

// ???fetch???
const originalFetch = global.fetch;

// fetch????Bun?fetch???????????
const mockFetch = (mockFn: ReturnType<typeof mock>) => {
  const wrapper = mockFn as unknown as typeof fetch;
  wrapper.preconnect = (originalFetch as any).preconnect;
  global.fetch = wrapper;
};

beforeEach(() => {
  // ???????fetch?????
  global.fetch = originalFetch;
});

afterEach(() => {
  // ???????fetch??????
  global.fetch = originalFetch;
});

describe("Geocode API - GET /", () => {
  const app = new Hono().route("/", geocode).onError((err, c) => {
    return c.json(
      {
        error: {
          message: "Internal server error",
        },
      },
      500,
    );
  });

  describe("???????", () => {
    test("address???????", async () => {
      const res = await app.request("/");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("address?????????", async () => {
      const res = await app.request("/?address=");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });
  });

  describe("???", () => {
    test("????????????", async () => {
      const mockResponse = {
        status: "OK",
        results: [
          {
            geometry: {
              location: {
                lat: 35.6581,
                lng: 139.7014,
              },
            },
          },
        ],
      };

      mockFetch(
        mock(async () => {
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request("/?address=?????");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(body.data.lat).toBe(35.6581);
      expect(body.data.lng).toBe(139.7014);
    });

    test("???URL ????????", async () => {
      const mockResponse = {
        status: "OK",
        results: [
          {
            geometry: {
              location: {
                lat: 35.6812,
                lng: 139.7671,
              },
            },
          },
        ],
      };

      let capturedUrl: string = "";
      mockFetch(
        mock(async (url) => {
          capturedUrl = url.toString();
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request("/?address=???");
      expect(res.status).toBe(200);

      // URL???????????????????
      expect(capturedUrl).toContain(encodeURIComponent("???"));
      expect(capturedUrl).toContain("region=JP");
      expect(capturedUrl).toContain("language=ja");
    });

    test("?????????????????????", async () => {
      const mockResponse = {
        status: "OK",
        results: [
          {
            geometry: {
              location: {
                lat: 35.6581,
                lng: 139.7014,
              },
            },
          },
          {
            geometry: {
              location: {
                lat: 35.6812,
                lng: 139.7671,
              },
            },
          },
        ],
      };

      mockFetch(
        mock(async () => {
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request("/?address=??");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(body.data.lat).toBe(35.6581);
      expect(body.data.lng).toBe(139.7014);
    });

    test("???????????", async () => {
      const mockResponse = {
        status: "OK",
        results: [
          {
            geometry: {
              location: {
                lat: 35.6762,
                lng: 139.6503,
              },
            },
          },
        ],
      };

      mockFetch(
        mock(async () => {
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request("/?address=Tokyo Tower");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(body.data.lat).toBe(35.6762);
      expect(body.data.lng).toBe(139.6503);
    });
  });

  describe("?????????", () => {
    test("Google Geocoding API?ZERO_RESULTS???", async () => {
      const mockResponse = {
        status: "ZERO_RESULTS",
      };

      mockFetch(
        mock(async () => {
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request("/?address=???????");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toContain("Google Geocoding API error");
    });

    test("results????", async () => {
      const mockResponse = {
        status: "OK",
        results: [],
      };

      mockFetch(
        mock(async () => {
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request("/?address=test");
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe("No results found");
    });

    test("????????????", async () => {
      mockFetch(
        mock(async () => {
          throw new Error("Network error");
        }),
      );

      const res = await app.request("/?address=??");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe("Failed to geocode address");
    });

    test("???JSON?????", async () => {
      mockFetch(
        mock(async () => {
          return new Response("Invalid JSON", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request("/?address=??");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("Google Geocoding API?REQUEST_DENIED???", async () => {
      const mockResponse = {
        status: "REQUEST_DENIED",
        error_message: "API key is invalid",
      };

      mockFetch(
        mock(async () => {
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request("/?address=??");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toContain("Google Geocoding API error");
    });

    test("Google Geocoding API?OVER_QUERY_LIMIT???", async () => {
      const mockResponse = {
        status: "OVER_QUERY_LIMIT",
      };

      mockFetch(
        mock(async () => {
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request("/?address=??");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toContain("Google Geocoding API error");
    });
  });
});

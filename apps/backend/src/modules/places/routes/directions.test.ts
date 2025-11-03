import { describe, test, expect, mock, beforeEach } from "bun:test";
import { Hono } from "hono";
import directions from "./directions";

// ?????fetch????
const originalFetch = global.fetch;

beforeEach(() => {
  // ???????fetch?????
  global.fetch = originalFetch;
});

describe("Directions API - GET /", () => {
  const app = new Hono().route("/", directions).onError((err, c) => {
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
    test("originLat???", async () => {
      const res = await app.request("/?originLng=139&destLat=35&destLng=139");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("originLng???", async () => {
      const res = await app.request("/?originLat=35&destLat=35&destLng=139");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("destLat???", async () => {
      const res = await app.request("/?originLat=35&originLng=139&destLng=139");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("destLng???", async () => {
      const res = await app.request("/?originLat=35&originLng=139&destLat=35");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("originLat???????????", async () => {
      const res = await app.request(
        "/?originLat=91&originLng=139&destLat=35&destLng=139",
      );
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("originLng???????????", async () => {
      const res = await app.request(
        "/?originLat=35&originLng=181&destLat=35&destLng=139",
      );
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("destLat???????????", async () => {
      const res = await app.request(
        "/?originLat=35&originLng=139&destLat=91&destLng=139",
      );
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("destLng???????????", async () => {
      const res = await app.request(
        "/?originLat=35&originLng=139&destLat=35&destLng=181",
      );
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("mode????????????", async () => {
      const res = await app.request(
        "/?originLat=35&originLng=139&destLat=35&destLng=139&mode=flying",
      );
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });
  });

  describe("???", () => {
    test("?????????????????", async () => {
      const mockResponse = {
        status: "OK",
        routes: [
          {
            legs: [
              {
                distance: {
                  value: 5000,
                  text: "5 km",
                },
                duration: {
                  value: 600,
                  text: "10?",
                },
              },
            ],
            overview_polyline: {
              points: "encoded_polyline_string",
            },
          },
        ],
      };

      global.fetch = mock(async () => {
        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671",
      );
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(body.data.polyline).toBe("encoded_polyline_string");
      expect(body.data.distance).toBe("5 km");
      expect(body.data.duration).toBe("10?");
    });

    test("mode????????????walking?", async () => {
      const mockResponse = {
        status: "OK",
        routes: [
          {
            legs: [
              {
                distance: {
                  value: 3000,
                  text: "3 km",
                },
                duration: {
                  value: 2400,
                  text: "40?",
                },
              },
            ],
            overview_polyline: {
              points: "walking_polyline",
            },
          },
        ],
      };

      let capturedUrl: string = "";
      global.fetch = mock(async (url) => {
        capturedUrl = url.toString();
        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671&mode=walking",
      );
      expect(res.status).toBe(200);

      // URL?mode????????????
      expect(capturedUrl).toContain("mode=walking");

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(body.data.duration).toBe("40?");
    });

    test("??????mode?driving", async () => {
      const mockResponse = {
        status: "OK",
        routes: [
          {
            legs: [
              {
                distance: { value: 5000, text: "5 km" },
                duration: { value: 600, text: "10?" },
              },
            ],
            overview_polyline: { points: "test" },
          },
        ],
      };

      let capturedUrl: string = "";
      global.fetch = mock(async (url) => {
        capturedUrl = url.toString();
        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671",
      );
      expect(res.status).toBe(200);

      // ??????mode?driving????????
      expect(capturedUrl).toContain("mode=driving");
    });

    test("alternatives???????????", async () => {
      const mockResponse = {
        status: "OK",
        routes: [
          {
            legs: [
              {
                distance: { value: 5000, text: "5 km" },
                duration: { value: 600, text: "10?" },
              },
            ],
            overview_polyline: { points: "test" },
          },
        ],
      };

      let capturedUrl: string = "";
      global.fetch = mock(async (url) => {
        capturedUrl = url.toString();
        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671&alternatives=true",
      );
      expect(res.status).toBe(200);

      // alternatives?????????????????
      expect(capturedUrl).toContain("alternatives=true");
    });
  });

  describe("?????????", () => {
    test("Google Directions API??????????????", async () => {
      const mockResponse = {
        status: "ZERO_RESULTS",
      };

      global.fetch = mock(async () => {
        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671",
      );
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toContain("Google Directions API error");
    });

    test("routes?????", async () => {
      const mockResponse = {
        status: "OK",
        routes: [],
      };

      global.fetch = mock(async () => {
        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671",
      );
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe("No routes found");
    });

    test("????????????????", async () => {
      global.fetch = mock(async () => {
        throw new Error("Network error");
      });

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671",
      );
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe("Failed to get directions");
    });

    test("???JSON???????", async () => {
      global.fetch = mock(async () => {
        return new Response("Invalid JSON", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671",
      );
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
    });
  });
});

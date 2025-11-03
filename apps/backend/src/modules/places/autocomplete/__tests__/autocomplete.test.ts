import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { Hono } from "hono";
import autocomplete from "../index";

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

describe("Autocomplete API - GET /", () => {
  const app = new Hono().route("/", autocomplete).onError((err, c) => {
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
    test("input???????", async () => {
      const res = await app.request("/");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("input?????????", async () => {
      const res = await app.request("/?input=");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("latitude???????", async () => {
      const res = await app.request("/?input=??&latitude=91&longitude=139");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("longitude???????", async () => {
      const res = await app.request("/?input=??&latitude=35&longitude=181");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("radius???????", async () => {
      const res = await app.request("/?input=??&radius=50001");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("limit????????", async () => {
      const res = await app.request("/?input=??&limit=0");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("limit????????", async () => {
      const res = await app.request("/?input=??&limit=6");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });
  });

  describe("???", () => {
    test("??input?????????", async () => {
      const mockResponse = {
        suggestions: [
          {
            placePrediction: {
              placeId: "ChIJ51cu8IcbXWARiRtXIothAS4",
              text: {
                text: "???",
                matches: [{ startOffset: 0, endOffset: 3 }],
              },
              structuredFormat: {
                mainText: {
                  text: "???",
                  matches: [{ startOffset: 0, endOffset: 3 }],
                },
                secondaryText: {
                  text: "??",
                  matches: [],
                },
              },
              types: ["administrative_area_level_1", "political"],
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

      const res = await app.request("/?input=??");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(1);
      expect(body.data[0]).toEqual({
        placeId: "ChIJ51cu8IcbXWARiRtXIothAS4",
        description: "???",
        structuredFormatting: {
          mainText: "???",
          secondaryText: "??",
        },
        types: ["administrative_area_level_1", "political"],
      });
    });

    test("???????????", async () => {
      const mockResponse = {
        suggestions: [
          {
            placePrediction: {
              placeId: "test-place-id",
              text: {
                text: "???",
                matches: [{ startOffset: 0, endOffset: 3 }],
              },
              structuredFormat: {
                mainText: {
                  text: "???",
                  matches: [{ startOffset: 0, endOffset: 3 }],
                },
                secondaryText: {
                  text: "???????",
                  matches: [],
                },
              },
              types: ["train_station", "transit_station"],
            },
          },
        ],
      };

      let capturedRequestBody: any = null;
      mockFetch(
        mock(async (url, options) => {
          if (options?.body) {
            capturedRequestBody = JSON.parse(options.body as string);
          }
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request(
        "/?input=??&latitude=35.6581&longitude=139.7014&radius=1000",
      );
      expect(res.status).toBe(200);

      // ?????????????????????????
      expect(capturedRequestBody).toBeDefined();
      expect(capturedRequestBody.locationBias).toBeDefined();
      expect(capturedRequestBody.locationBias.circle.center.latitude).toBe(
        35.6581,
      );
      expect(capturedRequestBody.locationBias.circle.center.longitude).toBe(
        139.7014,
      );
      expect(capturedRequestBody.locationBias.circle.radius).toBe(1000);

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(body.data.length).toBe(1);
    });

    test("??????????", async () => {
      const mockResponse = { suggestions: [] };

      let capturedRequestBody: any = null;
      mockFetch(
        mock(async (url, options) => {
          if (options?.body) {
            capturedRequestBody = JSON.parse(options.body as string);
          }
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request("/?input=???");
      expect(res.status).toBe(200);

      // ????????????????????
      expect(capturedRequestBody.maxResultCount).toBe(5);
      expect(capturedRequestBody.languageCode).toBe("ja");
      expect(capturedRequestBody.includedRegionCodes).toEqual(["JP"]);
    });

    test("????????????????", async () => {
      const mockResponse = { suggestions: [] };

      mockFetch(
        mock(async () => {
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request("/?input=???????");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(0);
    });
  });

  describe("?????????", () => {
    test("Google Places API???????", async () => {
      mockFetch(
        mock(async () => {
          return new Response(
            JSON.stringify({
              error: {
                code: 400,
                message: "Invalid request",
              },
            }),
            {
              status: 400,
              statusText: "Bad Request",
              headers: { "Content-Type": "application/json" },
            },
          );
        }),
      );

      const res = await app.request("/?input=??");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toContain("Google Places API error");
    });

    test("????????????", async () => {
      mockFetch(
        mock(async () => {
          throw new Error("Network error");
        }),
      );

      const res = await app.request("/?input=??");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe(
        "Failed to fetch autocomplete suggestions",
      );
    });

    test("Google Places API????JSON???", async () => {
      mockFetch(
        mock(async () => {
          return new Response("Invalid JSON", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request("/?input=??");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
    });
  });
});

import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";
import directions from "../index";

// 元のfetchを保存
const originalFetch = global.fetch;

// fetchをモックするためのヘルパー関数（Bunのfetch型に合わせる）
const mockFetch = (mockFn: ReturnType<typeof mock>) => {
  const wrapper = mockFn as unknown as typeof fetch;
  // biome-ignore lint/suspicious/noExplicitAny: fetchのpreconnectプロパティにアクセスするため
  wrapper.preconnect = (originalFetch as any).preconnect;
  global.fetch = wrapper;
};

beforeEach(() => {
  // 各テスト前にfetchをリセット
  global.fetch = originalFetch;
});

afterEach(() => {
  // 各テスト後にfetchをリセット
  global.fetch = originalFetch;
});

describe("Directions API - GET /", () => {
  const app = new Hono().route("/", directions).onError((_err, c) => {
    return c.json(
      {
        error: {
          message: "Internal server error",
        },
      },
      500,
    );
  });

  describe("バリデーション", () => {
    test("originLatが欠落している場合", async () => {
      const res = await app.request("/?originLng=139&destLat=35&destLng=139");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("originLngが欠落している場合", async () => {
      const res = await app.request("/?originLat=35&destLat=35&destLng=139");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("destLatが欠落している場合", async () => {
      const res = await app.request("/?originLat=35&originLng=139&destLng=139");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("destLngが欠落している場合", async () => {
      const res = await app.request("/?originLat=35&originLng=139&destLat=35");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("originLatが範囲外の場合", async () => {
      const res = await app.request(
        "/?originLat=91&originLng=139&destLat=35&destLng=139",
      );
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("originLngが範囲外の場合", async () => {
      const res = await app.request(
        "/?originLat=35&originLng=181&destLat=35&destLng=139",
      );
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("destLatが範囲外の場合", async () => {
      const res = await app.request(
        "/?originLat=35&originLng=139&destLat=91&destLng=139",
      );
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("destLngが範囲外の場合", async () => {
      const res = await app.request(
        "/?originLat=35&originLng=139&destLat=35&destLng=181",
      );
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("modeが無効な場合", async () => {
      const res = await app.request(
        "/?originLat=35&originLng=139&destLat=35&destLng=139&mode=flying",
      );
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });
  });

  describe("成功", () => {
    test("正常に経路を取得できる", async () => {
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
                  text: "10分",
                },
              },
            ],
            overview_polyline: {
              points: "encoded_polyline_string",
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

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671",
      );
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(body.data.polyline).toBe("encoded_polyline_string");
      expect(body.data.distance).toBe("5 km");
      expect(body.data.duration).toBe("10分");
    });

    test("modeがwalkingの場合、walkingモードで経路を取得できる", async () => {
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
                  text: "40分",
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
      mockFetch(
        mock(async (url) => {
          capturedUrl = url.toString();
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671&mode=walking",
      );
      expect(res.status).toBe(200);

      // URLにmode=walkingが含まれていることを確認
      expect(capturedUrl).toContain("mode=walking");

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(body.data.duration).toBe("40分");
    });

    test("デフォルトでmodeがdrivingになる", async () => {
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
      mockFetch(
        mock(async (url) => {
          capturedUrl = url.toString();
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671",
      );
      expect(res.status).toBe(200);

      // デフォルトでmode=drivingが含まれていることを確認
      expect(capturedUrl).toContain("mode=driving");
    });

    test("alternativesがtrueの場合、代替経路を取得する", async () => {
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
      mockFetch(
        mock(async (url) => {
          capturedUrl = url.toString();
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671&alternatives=true",
      );
      expect(res.status).toBe(200);

      // alternatives=trueがURLに含まれていることを確認
      expect(capturedUrl).toContain("alternatives=true");
    });
  });

  describe("エラー", () => {
    test("Google Directions APIがエラーを返す場合", async () => {
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

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671",
      );
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toContain("Google Directions API error");
    });

    test("routesが空の場合", async () => {
      const mockResponse = {
        status: "OK",
        routes: [],
      };

      mockFetch(
        mock(async () => {
          return new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671",
      );
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe("No routes found");
    });

    test("ネットワークエラーが発生した場合", async () => {
      mockFetch(
        mock(async () => {
          throw new Error("Network error");
        }),
      );

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671",
      );
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe("Failed to get directions");
    });

    test("無効なJSONが返される場合", async () => {
      mockFetch(
        mock(async () => {
          return new Response("Invalid JSON", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const res = await app.request(
        "/?originLat=35.6581&originLng=139.7014&destLat=35.6812&destLng=139.7671",
      );
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
    });
  });
});

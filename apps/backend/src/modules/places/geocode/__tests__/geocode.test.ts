import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";
import geocode from "../index";

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

describe("Geocode API - GET /", () => {
  const app = new Hono().route("/", geocode).onError((_err, c) => {
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
    test("addressが欠落している場合", async () => {
      const res = await app.request("/");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("addressが空文字列の場合", async () => {
      const res = await app.request("/?address=");
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });
  });

  describe("成功", () => {
    test("正常に住所から座標を取得できる", async () => {
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

      const res = await app.request("/?address=東京タワー");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(body.data.lat).toBe(35.6581);
      expect(body.data.lng).toBe(139.7014);
    });

    test("住所がURLエンコードされている", async () => {
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

      const res = await app.request("/?address=東京");
      expect(res.status).toBe(200);

      // URLが正しくエンコードされていることを確認
      expect(capturedUrl).toContain(encodeURIComponent("東京"));
      expect(capturedUrl).toContain("region=JP");
      expect(capturedUrl).toContain("language=ja");
    });

    test("複数の結果がある場合、最初の結果を返す", async () => {
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

      const res = await app.request("/?address=東京");
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(body.data.lat).toBe(35.6581);
      expect(body.data.lng).toBe(139.7014);
    });

    test("英語の住所も正常に処理できる", async () => {
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

  describe("エラー", () => {
    test("Google Geocoding APIがZERO_RESULTSを返す場合", async () => {
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

      const res = await app.request("/?address=存在しない住所");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toContain("Google Geocoding API error");
    });

    test("resultsが空の場合", async () => {
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

    test("ネットワークエラーが発生した場合", async () => {
      mockFetch(
        mock(async () => {
          throw new Error("Network error");
        }),
      );

      const res = await app.request("/?address=東京");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe("Failed to geocode address");
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

      const res = await app.request("/?address=東京");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    test("Google Geocoding APIがREQUEST_DENIEDを返す場合", async () => {
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

      const res = await app.request("/?address=東京");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toContain("Google Geocoding API error");
    });

    test("Google Geocoding APIがOVER_QUERY_LIMITを返す場合", async () => {
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

      const res = await app.request("/?address=東京");
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.message).toContain("Google Geocoding API error");
    });
  });
});

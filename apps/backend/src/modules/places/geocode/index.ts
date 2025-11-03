import { Hono } from "hono";

import { ENV } from "../../../config/env";
import { validateQuery } from "../../../plugins/validator";
import type { AppBindings } from "../../../types/app";
import { ok } from "../../../utils/response";
import { GeocodeQuerySchema, type GeocodeResponse } from "./schema";

const geocode = new Hono<AppBindings>();

/**
 * GET /geocode
 * Google Geocoding API を使用して住所から座標を取得
 */
geocode.get("/", validateQuery(GeocodeQuerySchema), async (c) => {
  const { address } = c.req.valid("query");

  try {
    const url = \`https://maps.googleapis.com/maps/api/geocode/json?address=\${encodeURIComponent(address)}&key=\${ENV.GOOGLE_MAPS_API_KEY}&region=JP&language=ja\`;
    const response = await fetch(url);
    const data = (await response.json()) as GeocodeResponse;

    if (data.status !== "OK") {
      console.error("Google Geocoding API error:", data.status);
      return c.json(
        {
          error: {
            message: \`Google Geocoding API error: \${data.status}\`,
          },
        },
        500,
      );
    }

    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return ok(c, {
        lat: location.lat,
        lng: location.lng,
      });
    }

    return c.json(
      {
        error: {
          message: "No routes found",
        },
      },
      404,
    );
  } catch (error) {
    console.error("Google Geocoding error:", error);
    return c.json(
      {
        error: {
          message: "Failed to geocode address",
        },
      },
      500,
    );
  }
});

export default geocode;

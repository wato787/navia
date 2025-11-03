import { Hono } from "hono";
import { z } from "zod";

import { ENV } from "../../../config/env";
import { validateQuery } from "../../../plugins/validator";
import type { AppBindings } from "../../../types/app";
import { ok } from "../../../utils/response";

const directions = new Hono<AppBindings>();

/**
 * Google Directions API ???????
 */
const DirectionsQuerySchema = z.object({
  originLat: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= -90 && val <= 90, {
      message: "???-90??90????????????",
    }),
  originLng: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= -180 && val <= 180, {
      message: "???-180??180????????????",
    }),
  destLat: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= -90 && val <= 90, {
      message: "???-90??90????????????",
    }),
  destLng: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val) && val >= -180 && val <= 180, {
      message: "???-180??180????????????",
    }),
  mode: z
    .enum(["driving", "walking", "bicycling", "transit"])
    .default("driving"),
  alternatives: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true"),
});

/**
 * Google Directions API ??????
 */
type DirectionsResponse = {
  status: string;
  routes?: Array<{
    legs: Array<{
      distance: {
        value: number;
        text: string;
      };
      duration: {
        value: number;
        text: string;
      };
    }>;
    overview_polyline: {
      points: string;
    };
  }>;
};

/**
 * GET /directions
 * Google Directions API ????????????
 */
directions.get("/", validateQuery(DirectionsQuerySchema), async (c) => {
  const { originLat, originLng, destLat, destLng, mode, alternatives } =
    c.req.valid("query");

  try {
    const origin = `${originLat},${originLng}`;
    const destination = `${destLat},${destLng}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&alternatives=${alternatives}&key=${ENV.GOOGLE_MAPS_API_KEY}&region=JP&language=ja`;

    const response = await fetch(url);
    const data = (await response.json()) as DirectionsResponse;

    if (data.status !== "OK") {
      console.error("Google Directions API error:", data.status);
      return c.json(
        {
          error: {
            message: `Google Directions API error: ${data.status}`,
          },
        },
        500,
      );
    }

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return ok(c, {
        polyline: route.overview_polyline.points,
        distance: route.legs[0]?.distance?.text,
        duration: route.legs[0]?.duration?.text,
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
    console.error("Google Directions error:", error);
    return c.json(
      {
        error: {
          message: "Failed to get directions",
        },
      },
      500,
    );
  }
});

export default directions;

import { Hono } from "hono";

import type { AppBindings } from "../../types/app";
import autocomplete from "./autocomplete";
import directions from "./directions";
import geocode from "./geocode";

const places = new Hono<AppBindings>();

// ?API ??????????
places.route("/autocomplete", autocomplete);
places.route("/geocode", geocode);
places.route("/directions", directions);

export default places;

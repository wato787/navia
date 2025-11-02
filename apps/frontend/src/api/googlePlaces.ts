export interface GooglePlaceAutocompletePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text?: string;
  };
  types?: string[];
}

export interface GooglePlaceLocation {
  lat: number;
  lng: number;
}

interface GooglePlacesAutocompleteResponse {
  predictions: GooglePlaceAutocompletePrediction[];
  status: string;
  error_message?: string;
}

interface GooglePlaceDetailsResponse {
  result?: {
    geometry?: {
      location?: GooglePlaceLocation;
    };
    name?: string;
    formatted_address?: string;
  };
  status: string;
  error_message?: string;
}

interface GoogleGeocodeResponse {
  results: Array<{
    geometry?: {
      location?: GooglePlaceLocation;
    };
    formatted_address?: string;
  }>;
  status: string;
  error_message?: string;
}

type AutocompleteOptions = {
  location?: [number, number];
  radius?: number;
  sessionToken?: string;
};

const GOOGLE_AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const GOOGLE_PLACE_DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";
const GOOGLE_GEOCODE_URL =
  "https://maps.googleapis.com/maps/api/geocode/json";

function assertSuccess(
  status: string,
  errorMessage?: string,
  allowZeroResults = false,
) {
  if (status === "OK") {
    return;
  }

  if (allowZeroResults && status === "ZERO_RESULTS") {
    return;
  }

  throw new Error(errorMessage || `Google Places API error: ${status}`);
}

export async function getPlacesAutocomplete(
  input: string,
  apiKey: string,
  opts?: AutocompleteOptions,
): Promise<GooglePlaceAutocompletePrediction[]> {
  const params = new URLSearchParams({
    input,
    key: apiKey,
    language: "ja",
    types: "geocode|establishment",
  });

  if (opts?.location) {
    params.append("location", `${opts.location[0]},${opts.location[1]}`);
    params.append("radius", String(opts.radius ?? 5000));
  }

  if (opts?.sessionToken) {
    params.append("sessiontoken", opts.sessionToken);
  }

  const res = await fetch(`${GOOGLE_AUTOCOMPLETE_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Google Places Autocomplete request failed: ${res.status}`);
  }

  const data = (await res.json()) as GooglePlacesAutocompleteResponse;
  assertSuccess(data.status, data.error_message, true);
  if (data.status === "ZERO_RESULTS") {
    return [];
  }

  return data.predictions || [];
}

export async function getPlaceDetails(
  placeId: string,
  apiKey: string,
  sessionToken?: string,
): Promise<GooglePlaceLocation | null> {
  const params = new URLSearchParams({
    place_id: placeId,
    key: apiKey,
    language: "ja",
    fields: "geometry/location",
  });

  if (sessionToken) {
    params.append("sessiontoken", sessionToken);
  }

  const res = await fetch(`${GOOGLE_PLACE_DETAILS_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Google Place Details request failed: ${res.status}`);
  }

  const data = (await res.json()) as GooglePlaceDetailsResponse;
  assertSuccess(data.status, data.error_message, true);

  if (data.status === "ZERO_RESULTS") {
    return null;
  }

  const location = data.result?.geometry?.location;
  return location ?? null;
}

export async function geocodeAddressWithGoogle(
  address: string,
  apiKey: string,
): Promise<GooglePlaceLocation | null> {
  const params = new URLSearchParams({
    address,
    key: apiKey,
    language: "ja",
    region: "jp",
  });

  const res = await fetch(`${GOOGLE_GEOCODE_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Google Geocode request failed: ${res.status}`);
  }

  const data = (await res.json()) as GoogleGeocodeResponse;
  assertSuccess(data.status, data.error_message, true);

  if (data.status === "ZERO_RESULTS") {
    return null;
  }

  const location = data.results?.[0]?.geometry?.location;
  return location ?? null;
}


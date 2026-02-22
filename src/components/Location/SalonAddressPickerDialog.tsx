"use client";

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type SalonAddressSelection = {
  latitude: number;
  longitude: number;
  formatted_address: string;
  google_place_id?: string;
  city: string;
  postal_code: string;
  country: string; // ISO-2 (e.g. "GB")
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCenter?: { lat: number; lng: number };
  onSelect: (selection: SalonAddressSelection) => void;
};

const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };

function getAddressComponent(
  components: google.maps.GeocoderAddressComponent[] | undefined,
  type: string,
  useShort = false,
): string {
  if (!components) return "";
  const component = components.find((c) => c.types.includes(type));
  if (!component) return "";
  return useShort ? component.short_name : component.long_name;
}

function transformGeocoderResult(
  result: google.maps.GeocoderResult,
  lat: number,
  lng: number,
): SalonAddressSelection {
  const components = result.address_components;

  const city =
    getAddressComponent(components, "locality") ||
    getAddressComponent(components, "postal_town") ||
    getAddressComponent(components, "administrative_area_level_2") ||
    "";

  const postal_code = getAddressComponent(components, "postal_code") || "";
  const country = getAddressComponent(components, "country", true) || "";

  return {
    latitude: lat,
    longitude: lng,
    formatted_address: result.formatted_address || "",
    google_place_id: (result as unknown as { place_id?: string }).place_id,
    city,
    postal_code,
    country,
  };
}

export default function SalonAddressPickerDialog({
  open,
  onOpenChange,
  initialCenter,
  onSelect,
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || "",
  });

  const center = useMemo(
    () => initialCenter ?? DEFAULT_CENTER,
    [initialCenter],
  );

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialCenter ?? null,
  );
  const [selection, setSelection] = useState<SalonAddressSelection | null>(
    null,
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string>("");

  const geocodeLatLng = async (lat: number, lng: number) => {
    if (typeof window === "undefined") return;
    if (!window.google?.maps?.Geocoder) {
      setError("Google Maps failed to load.");
      return;
    }

    setIsGeocoding(true);
    setError("");

    try {
      const geocoder = new window.google.maps.Geocoder();
      const { results } = await geocoder.geocode({ location: { lat, lng } });
      const top = results?.[0];
      if (!top) {
        setSelection(null);
        setError("No address found for that location.");
        return;
      }

      setSelection(transformGeocoderResult(top, lat, lng));
    } catch {
      setSelection(null);
      setError("Failed to fetch address. Please try again.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const canUse = Boolean(apiKey) && isLoaded && !loadError;
  const hasRequired =
    Boolean(selection?.city) &&
    Boolean(selection?.country) &&
    Boolean(selection?.postal_code);
  const canConfirm =
    Boolean(marker) &&
    Boolean(selection) &&
    hasRequired &&
    !isGeocoding &&
    canUse;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:!max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Address</DialogTitle>
          <DialogDescription>
            Click on the map to choose a location.
          </DialogDescription>
        </DialogHeader>

        {!apiKey ? (
          <div className="text-sm text-red-600">
            Missing `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
          </div>
        ) : loadError ? (
          <div className="text-sm text-red-600">
            Failed to load Google Maps.
          </div>
        ) : !isLoaded ? (
          <div className="text-sm">Loading map…</div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-md border">
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: 360 }}
                center={marker ?? center}
                zoom={14}
                onClick={(e) => {
                  if (!e.latLng) return;
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  setMarker({ lat, lng });
                  void geocodeLatLng(lat, lng);
                }}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                {marker ? <Marker position={marker} /> : null}
              </GoogleMap>
            </div>

            <div className="rounded-md border p-3 text-sm">
              <div className="font-medium">Selected</div>
              {isGeocoding ? (
                <div className="text-muted-foreground mt-1">
                  Fetching address…
                </div>
              ) : error ? (
                <div className="mt-1 text-red-600">{error}</div>
              ) : selection ? (
                <div className="text-muted-foreground mt-1 space-y-1">
                  <div>{selection.formatted_address}</div>
                  <div>
                    City: {selection.city || "-"} • Postal:{" "}
                    {selection.postal_code || "-"} • Country:{" "}
                    {selection.country || "-"}
                  </div>
                  <div>
                    Lat: {selection.latitude} • Lng: {selection.longitude}
                  </div>
                  {!hasRequired ? (
                    <div className="pt-1 text-red-600">
                      City, postal code, and country are required. Please click
                      a nearby location.
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-muted-foreground mt-1">
                  Click on the map to pick an address.
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="text-white"
                disabled={!canConfirm}
                onClick={() => {
                  if (!selection) return;
                  onSelect(selection);
                  onOpenChange(false);
                }}
              >
                Use This Address
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

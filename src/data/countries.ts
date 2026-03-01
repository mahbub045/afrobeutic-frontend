import { countries as countryData, TCountries } from "countries-list";

export interface Country {
  code: string;
  name: string;
}

// Convert the object exported by countries-list into a sorted array of {code,name}
export const countries: Country[] = Object.entries(countryData as TCountries)
  .map(([code, info]) => ({ code, name: info.name }))
  // sort using an explicit locale so that server and client renderings match
  // Node may default to a different locale than the browser which caused
  // hydration issues (e.g. "Aland" vs "Albania" ordering).
  .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

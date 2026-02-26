import { countries as countryData, TCountries, ICountry } from "countries-list";

export interface Country {
  code: string;
  name: string;
}

// Convert the object exported by countries-list into a sorted array of {code,name}
export const countries: Country[] = Object.entries(countryData as TCountries)
  .map(([code, info]) => ({ code, name: info.name }))
  .sort((a, b) => a.name.localeCompare(b.name));


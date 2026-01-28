"use client";

import { useEffect, useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { getStatesForCountry, STATES_BY_COUNTRY } from "@/lib/states";

export type CountryState = { code: string; name: string };
export type CountryWithStates = { code: string; name: string; states?: CountryState[] };

/**
 * Fallback: same shape as WooCommerce data/countries (code, name, states?).
 * US and CA get states from lib/states; others get empty states.
 */
function getFallbackCountries(): CountryWithStates[] {
  return COUNTRIES.map((c) => ({
    code: c.code,
    name: c.name,
    states: STATES_BY_COUNTRY[c.code]?.length ? [...STATES_BY_COUNTRY[c.code]] : undefined,
  }));
}

export function useCountries(): {
  countries: CountryWithStates[];
  loading: boolean;
  error: string | null;
  getStatesForCountry: (countryCode: string) => CountryState[];
  hasStateDropdown: (countryCode: string) => boolean;
} {
  const [countries, setCountries] = useState<CountryWithStates[]>(getFallbackCountries());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/woocommerce/countries")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText || "Failed to load countries");
        return res.json();
      })
      .then((data: CountryWithStates[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setCountries(data);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load countries");
          setCountries(getFallbackCountries());
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getStates = (countryCode: string): CountryState[] => {
    const country = countries.find((c) => c.code === countryCode);
    if (country?.states?.length) return country.states;
    return getStatesForCountry(countryCode);
  };

  const hasDropdown = (countryCode: string): boolean => {
    const country = countries.find((c) => c.code === countryCode);
    if (country?.states && country.states.length > 0) return true;
    return countryCode === "US" || countryCode === "CA";
  };

  return {
    countries,
    loading,
    error,
    getStatesForCountry: getStates,
    hasStateDropdown: hasDropdown,
  };
}

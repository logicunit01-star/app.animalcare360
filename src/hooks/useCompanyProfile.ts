"use client";

import { useCallback, useEffect, useState } from "react";
import { getUser, mergeCompanyIntoSession, mergeUserMeIntoSession, setUser } from "@/lib/auth";
import {
  getCompanyInfo,
  normalizeCompanyResponse,
  parseEmailVerified,
  type CompanyInfo,
} from "@/lib/company";
import { loadBootstrapData } from "@/lib/hulmClient";

export function useCompanyProfile() {
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCompany = useCallback(async () => {
    const session = getUser();
    if (!session?.accessToken && !session?.username) {
      setCompany(null);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (session.accessToken) {
        const data = await loadBootstrapData(session.accessToken, session.username);

        if (data.user) {
          const current = getUser();
          if (current) setUser(mergeUserMeIntoSession(data.user, current));
        }

        if (data.company) {
          const profile =
            normalizeCompanyResponse(data.company) ?? (data.company as CompanyInfo);
          setCompany(profile);
          const updated = getUser();
          if (updated) setUser(mergeCompanyIntoSession(profile, updated));
          return;
        }
      }

      const apiUsername = getUser()?.username ?? session.username;
      if (!apiUsername) {
        setCompany(null);
        setError("Unable to load company profile.");
        return;
      }

      const profile = await getCompanyInfo(apiUsername, session.accessToken);
      setCompany(profile);
      const current = getUser();
      if (current) setUser(mergeCompanyIntoSession(profile, current));
    } catch (err) {
      setCompany(null);
      setError(err instanceof Error ? err.message : "Unable to load company profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  const needsEmailVerification =
    company !== null && !parseEmailVerified(company.emailVerified);

  return {
    company,
    loading,
    error,
    needsEmailVerification,
    reload: loadCompany,
  };
}

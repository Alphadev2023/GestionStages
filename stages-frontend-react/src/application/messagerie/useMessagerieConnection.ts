import { useEffect } from "react";
import { useAuthStore } from "../auth/useAuthStore";
import { useMessagerieStore } from "./useMessagerieStore";
import { messagerieService } from "../../infrastructure";

export function useMessagerieConnection() {
  const token = useAuthStore((s) => s.token);
  const connect = useMessagerieStore((s) => s.connect);
  const disconnect = useMessagerieStore((s) => s.disconnect);
  const setNonLus = useMessagerieStore((s) => s.setNonLus);

  useEffect(() => {
    if (!token) return;

    messagerieService
      .getNonLus()
      .then((r) => setNonLus(r.data.data))
      .catch(() => {});

    connect(token);

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect, setNonLus]);
}

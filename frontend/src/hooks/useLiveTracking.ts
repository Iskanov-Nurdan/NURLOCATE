import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE, getValidAccessToken } from "../api/client";
import { getLiveLocations } from "../api/tracking";
import type { Location } from "../types";

const POLL_MS = 5000;

type WsMessage = {
  type: string;
  animal_id?: string;
  device_id?: string;
  lat?: number;
  lng?: number;
  battery?: number;
  online?: boolean;
  recorded_at?: string;
};

export function useLiveTracking(enabled = true) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeMode, setRealtimeMode] = useState<"websocket" | "polling">("polling");
  const wsRef = useRef<WebSocket | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getLiveLocations();
      setLocations(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const timer = setInterval(refresh, POLL_MS);

    async function connect() {
      await refresh();
      const token = await getValidAccessToken();
      if (cancelled || !token) return;

      const wsBase = import.meta.env.VITE_WS_URL ?? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
      const wsUrl = `${wsBase}/ws/tracking/?token=${token}`;
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => setRealtimeMode("websocket");
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data as string) as WsMessage;
            if (msg.type !== "location.updated" || !msg.animal_id) return;
            setLocations((prev) => {
              const idx = prev.findIndex((l) => l.animal_id === msg.animal_id);
              const next: Location = {
                id: idx >= 0 ? prev[idx].id : crypto.randomUUID(),
                device: msg.device_id ?? (idx >= 0 ? prev[idx].device : ""),
                lat: String(msg.lat ?? 0),
                lng: String(msg.lng ?? 0),
                accuracy: idx >= 0 ? prev[idx].accuracy : null,
                speed: idx >= 0 ? prev[idx].speed : null,
                altitude: idx >= 0 ? prev[idx].altitude : null,
                battery_level: msg.battery ?? (idx >= 0 ? prev[idx].battery_level : 0),
                signal: idx >= 0 ? prev[idx].signal : null,
                mode: idx >= 0 ? prev[idx].mode : "normal",
                recorded_at: msg.recorded_at ?? new Date().toISOString(),
                received_at: new Date().toISOString(),
                animal_id: msg.animal_id ?? null,
                animal_name: idx >= 0 ? prev[idx].animal_name : null,
                device_serial: idx >= 0 ? prev[idx].device_serial : "",
                online: msg.online ?? true
              };
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = next;
                return copy;
              }
              return [...prev, next];
            });
          } catch {
            /* ignore malformed ws payload */
          }
        };
        ws.onerror = () => setRealtimeMode("polling");
        ws.onclose = () => setRealtimeMode("polling");
      } catch {
        setRealtimeMode("polling");
      }
    }

    connect();

    return () => {
      cancelled = true;
      clearInterval(timer);
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    };
  }, [enabled, refresh]);

  return { locations, loading, refresh, realtimeMode, apiBase: API_BASE };
}

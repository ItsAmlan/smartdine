"use client";

import { useEffect, useState, useRef } from "react";

export default function useSSE(url) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    let stopped = false;

    function connect() {
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "connected") {
            setConnected(true);
          } else {
            setData(parsed);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        if (!stopped) {
          reconnectTimerRef.current = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      stopped = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, [url]);

  return { data, connected };
}

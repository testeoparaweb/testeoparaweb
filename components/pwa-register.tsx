"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // La app sigue funcionando aunque el navegador bloquee el service worker.
    });
  }, []);

  return null;
}

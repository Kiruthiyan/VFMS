"use client";

import { useEffect } from "react";

const METAMASK_EXTENSION_ID = "nkbihfbeogaeaoehlefnkodbefgpgknn";

function isMetaMaskExtensionError(value: unknown): boolean {
  if (typeof value === "string") {
    return (
      value.includes("Failed to connect to MetaMask") ||
      value.includes(METAMASK_EXTENSION_ID)
    );
  }

  if (value instanceof Error) {
    return isMetaMaskExtensionError(`${value.message}\n${value.stack ?? ""}`);
  }

  if (typeof value === "object" && value !== null) {
    const record = value as { message?: unknown; stack?: unknown };
    return isMetaMaskExtensionError(`${record.message ?? ""}\n${record.stack ?? ""}`);
  }

  return false;
}

export function BrowserExtensionErrorGuard() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        isMetaMaskExtensionError(event.message) ||
        isMetaMaskExtensionError(event.filename) ||
        isMetaMaskExtensionError(event.error)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isMetaMaskExtensionError(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection, true);

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
    };
  }, []);

  return null;
}

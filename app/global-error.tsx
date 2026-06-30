"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#fdf9f8",
          color: "#0d0d0d",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "1rem" }}>🍲</div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "0.75rem" }}>
          Mumma&apos;s Menu is taking a short break
        </h1>
        <p style={{ color: "#6b7280", maxWidth: "380px", lineHeight: "1.7", marginBottom: "2rem" }}>
          We hit an unexpected issue. Our team is on it — please try refreshing the page or order
          directly on WhatsApp: +91 97120 00197
        </p>
        <button
          onClick={reset}
          style={{
            background: "#d32f2f",
            color: "#fff",
            border: "none",
            borderRadius: "9999px",
            padding: "0.75rem 2rem",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}

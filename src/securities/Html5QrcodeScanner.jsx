import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

/**
 * Usage: <Html5QrcodeScanner onScan={data => ...} onError={err => ...} />
 */
function Html5QrcodeScanner({ onScan, onError, width = 320, height = 240 }) {
  const scannerRef = useRef();
  const html5QrRef = useRef();
  const isStartedRef = useRef(false);

  useEffect(() => {
    if (!scannerRef.current) return;

    const config = {
      fps: 10,
      qrbox: { width: width - 40, height: height - 40 },
    };

    const html5Qr = new Html5Qrcode(scannerRef.current.id);
    html5QrRef.current = html5Qr;

    html5Qr
      .start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          if (onScan) onScan({ text: decodedText, result: decodedResult });
        },
        (err) => {
          if (onError) onError(err);
        }
      )
      .then(() => {
        isStartedRef.current = true;
      })
      .catch((err) => {
        isStartedRef.current = false;
        if (onError) onError(err);
      });

    return () => {
      const html5Qr = html5QrRef.current;

      // Ensure scanner exists and started before stopping
      if (html5Qr && isStartedRef.current) {
        const stopPromise = html5Qr.stop();
        if (stopPromise && typeof stopPromise.then === "function") {
          stopPromise
            .then(() => html5Qr.clear())
            .catch((err) => {
              if (!String(err).includes("scanner is not running")) {
                console.warn("Scanner stop error:", err);
              }
            });
        } else {
          // Fallback clear if stop didn't return a promise
          html5Qr.clear().catch(() => {});
        }
      } else if (html5Qr) {
        // Scanner never started, still try to clear safely
        html5Qr.clear().catch(() => {});
      }
    };
  }, [onScan, onError, width, height]);

  return (
    <div
      ref={scannerRef}
      id="html5qr-code-full-region"
      style={{ width, height, margin: "0 auto" }}
    />
  );
}

export default Html5QrcodeScanner;

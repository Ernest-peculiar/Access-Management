// src/security/SecurityScan.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { QrReader } from "@blackbox-vision/react-qr-reader";
import { API_BASE_URL } from "../api";
import "./security.css";
import Modal from "../components/Modals";

function SecurityScan() {
  const [phase, setPhase] = useState(1); // 1: scan person, 2: scan device
  const [qrValue, setQrValue] = useState("");
  const [deviceSerial, setDeviceSerial] = useState("");
  const [action, setAction] = useState("in");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);

  // Handles scan for both phases
  const handleScan = (value) => {
    if (phase === 1) {
      setQrValue(value);
      setPhase(2);
    } else if (phase === 2) {
      setDeviceSerial(value);
    }
  };

  // Submit after both scans (or skip device)
  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const tokenVal = Cookies.get("token");
      const payload = {
        qr_value: qrValue,
        device_serial: deviceSerial || null,
        action,
      };
      const res = await axios.post(
        `${API_BASE_URL}/api/security/scan/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokenVal}`,
          },
        }
      );
      setResult(res.data);
      setModalMsg(res.data.log || "Scan successful!");
      setModalSuccess(true);
      setPhase(1);
      setQrValue("");
      setDeviceSerial("");
    } catch (err) {
      setError(err?.response?.data?.detail || "Scan failed.");
      setModalMsg(err?.response?.data?.detail || "Scan failed.");
      setModalSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Ensure modalMsg is set after submit
  useEffect(() => {
    if (result && result.log) {
      setModalMsg(result.log);
    }
    if (error) {
      setModalMsg(error);
    }
  }, [result, error]);

  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .catch(() =>
        alert("Camera access denied. Please allow camera permissions.")
      );
  }, []);

  return (
    <div className="security-scan-page">
      <h2>Security QR Scan</h2>
      {/* Modal for success/error */}
      {modalMsg && (
        <Modal
          message={modalMsg}
          onClose={() => setModalMsg("")}
          isSuccess={modalSuccess}
        />
      )}

      {/* QR Scanner Phases */}
      <div className="security-qr-reader">
        {phase === 1 ? (
          <>
            <p>Step 1: Scan Person QR/Token</p>
            <QrReader
              constraints={{ facingMode: "environment" }}
              scanDelay={500}
              onResult={(res) => {
                if (res?.text && res.text !== qrValue) {
                  handleScan(res.text);
                }
              }}
              videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
              containerStyle={{
                width: "100%",
                maxWidth: "750px",
                height: "400px",
                border: "2px solid #1abc9c",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            />
            <div className="scanner-line"></div>
          </>
        ) : (
          <>
            <p>Step 2: Scan Device QR (optional)</p>
            <QrReader
              constraints={{ facingMode: "environment" }}
              scanDelay={500}
              onResult={(res) => {
                if (res?.text && res.text !== deviceSerial) {
                  handleScan(res.text);
                }
              }}
              videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
              containerStyle={{
                width: "100%",
                maxWidth: "750px",
                height: "400px",
                border: "2px solid #1abc9c",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            />
            <div className="scanner-line"></div>
            <button
              style={{ marginTop: "20px" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              style={{ marginLeft: "10px" }}
              onClick={() => handleSubmit()}
              disabled={loading}
            >
              Skip Device & Submit
            </button>
          </>
        )}
      </div>

      {/* Manual Input */}
      <form onSubmit={handleSubmit} className="security-scan-form">
        <input
          type="text"
          placeholder="QR/Token manually"
          value={qrValue}
          onChange={(e) => setQrValue(e.target.value)}
          disabled={phase !== 1}
        />
        <input
          type="text"
          placeholder="Device Serial (optional)"
          value={deviceSerial}
          onChange={(e) => setDeviceSerial(e.target.value)}
          disabled={phase !== 2}
        />
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="in">Check-In</option>
          <option value="out">Check-Out</option>
        </select>
        <button type="submit" disabled={loading || phase !== 2}>
          {loading ? "Submitting..." : "Submit"}
        </button>
        {phase === 2 && (
          <button
            type="button"
            style={{ marginLeft: "10px" }}
            onClick={() => handleSubmit()}
            disabled={loading}
          >
            Skip Device & Submit
          </button>
        )}
      </form>

      {/* Error / Success */}
      {error && <div className="security-scan-error">{error}</div>}
      {result && (
        <div className="security-scan-result">
          <h4>{result.type === "device" ? "Device Info" : "Person Info"}</h4>
          <pre
            style={{
              background: "#f8f8f8",
              padding: "10px",
              borderRadius: "5px",
              fontSize: "0.95em",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
          {result.person && (
            <>
              <p>
                <strong>Name:</strong> {result.person.full_name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {result.person.email || "N/A"}
              </p>
            </>
          )}
          {result.device && (
            <>
              <p>
                <strong>Device:</strong> {result.device.name}
              </p>
              <p>
                <strong>Serial:</strong> {result.device.serial_number}
              </p>
            </>
          )}
          {result.status && (
            <p>
              <strong>Status:</strong> {result.status}
            </p>
          )}
          {result.log && (
            <p>
              <strong>Log:</strong> {result.log}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SecurityScan;

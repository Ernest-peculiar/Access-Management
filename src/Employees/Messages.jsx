import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Message.css";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");

        const res = await axios.get(`${API_BASE_URL}/api/messages/`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = res.data?.results || [];

        setMessages(data);

        // Store message IDs in cookie
        Cookies.set(
          "viewed_admin_msgs",
          JSON.stringify(data.map((msg) => msg.id)),
          { expires: 7 }
        );
      } catch (e) {
        console.error("❌ Failed to fetch messages:", e);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="messages-root">
      <div className="messages-header">
        <button
          className="messages-back-btn"
          onClick={() => navigate(-1)}
          title="Back"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 19l-7-7 7-7"
              stroke="#247150"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h2 className="messages-title">Admin Messages</h2>
      </div>

      {loading ? (
        <div className="messages-loading">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="messages-empty">No messages found.</div>
      ) : (
        <ul className="messages-list">
          {messages.map((msg) => (
            <li key={msg.id} className="messages-item">
              <div className="messages-content">{msg.content}</div>
              <div className="messages-meta">
                {msg.sender_username} &middot;{" "}
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Messages;

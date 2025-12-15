"use client";

import { useEffect, useState } from "react";

type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

export default function NewsletterSubscribersTool() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/newsletter");
      const data = await response.json();
      if (response.ok) {
        setSubscribers(data.subscribers || []);
      } else {
        setError(data.message || "Failed to load subscribers");
      }
    } catch (err: any) {
      console.error("Error fetching subscribers:", err);
      setError("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    const headers = ["Email", "Subscribed Date"];
    const rows = subscribers.map((sub) => [
      sub.email,
      formatDate(sub.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>Loading subscribers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "4px",
            color: "#c00",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
            Newsletter Subscribers ({subscribers.length})
          </h2>
          {subscribers.length > 0 && (
            <button
              onClick={exportToCSV}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#2276fc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {subscribers.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#f9fafb",
            borderRadius: "4px",
          }}
        >
          No subscribers yet.
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "4px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f6f7f7",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  Subscribed Date
                </th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr
                  key={subscriber.id}
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>
                    {subscriber.email}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>
                    {formatDate(subscriber.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


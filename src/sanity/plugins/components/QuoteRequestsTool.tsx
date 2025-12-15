"use client";

import { useEffect, useState } from "react";

interface QuoteRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  productOrService: string;
  company: string;
  message: string | null;
  createdAt: string;
  status: string;
}

export default function QuoteRequestsTool() {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchQuoteRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/quote-request");
      if (!response.ok) {
        throw new Error("Failed to fetch quote requests");
      }
      const data = await response.json();
      setQuoteRequests(data.quoteRequests || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load quote requests");
      console.error("Error fetching quote requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quote request?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/quote-request?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete quote request");
      }

      // Remove from local state
      setQuoteRequests(quoteRequests.filter((req) => req.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete quote request");
      console.error("Error deleting quote request:", err);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchQuoteRequests();
  }, []);

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
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Product/Service",
      "Company",
      "Message",
      "Status",
      "Date",
    ];
    const rows = quoteRequests.map((request) => [
      request.firstName,
      request.lastName,
      request.email,
      request.phone,
      request.productOrService || "",
      request.company,
      request.message || "",
      request.status,
      formatDate(request.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `quote-requests-${new Date().toISOString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#F59E0B"; // amber
      case "contacted":
        return "#3B82F6"; // blue
      case "completed":
        return "#10B981"; // green
      case "cancelled":
        return "#EF4444"; // red
      default:
        return "#6B7280"; // gray
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading quote requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#FEE2E2",
            border: "1px solid #FCA5A5",
            borderRadius: "4px",
            color: "#991B1B",
          }}
        >
          <p style={{ margin: 0 }}>Error: {error}</p>
          <button
            onClick={fetchQuoteRequests}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#EF4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
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
            Quote Requests ({quoteRequests.length})
          </h2>
          {quoteRequests.length > 0 && (
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

      {quoteRequests.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#f9fafb",
            borderRadius: "4px",
          }}
        >
          No quote requests yet.
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
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "800px",
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
                    Name
                  </th>
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
                    Phone
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Product/Service
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Company
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      width: "100px",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {quoteRequests.map((request) => (
                  <tr
                    key={request.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>
                      {request.firstName} {request.lastName}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>
                      <a
                        href={`mailto:${request.email}`}
                        style={{ color: "#2276fc", textDecoration: "none" }}
                      >
                        {request.email}
                      </a>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>
                      <a
                        href={`tel:${request.phone}`}
                        style={{ color: "#2276fc", textDecoration: "none" }}
                      >
                        {request.phone}
                      </a>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>
                      {request.productOrService || "N/A"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>
                      {request.company}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "9999px",
                          backgroundColor: getStatusColor(request.status) + "20",
                          color: getStatusColor(request.status),
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          textTransform: "capitalize",
                        }}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.875rem" }}>
                      {formatDate(request.createdAt)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.875rem", textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(request.id)}
                        disabled={deletingId === request.id}
                        style={{
                          padding: "0.375rem 0.75rem",
                          backgroundColor: deletingId === request.id ? "#9CA3AF" : "#EF4444",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: deletingId === request.id ? "not-allowed" : "pointer",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (deletingId !== request.id) {
                            e.currentTarget.style.backgroundColor = "#DC2626";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (deletingId !== request.id) {
                            e.currentTarget.style.backgroundColor = "#EF4444";
                          }
                        }}
                      >
                        {deletingId === request.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {quoteRequests.some((r) => r.message) && (
            <div style={{ padding: "1rem", borderTop: "1px solid #e5e7eb" }}>
              <details style={{ marginTop: "1rem" }}>
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: 500,
                    color: "#374151",
                  }}
                >
                  View Messages ({quoteRequests.filter((r) => r.message).length})
                </summary>
                <div style={{ marginTop: "1rem" }}>
                  {quoteRequests
                    .filter((r) => r.message)
                    .map((request) => (
                      <div
                        key={request.id}
                        style={{
                          marginBottom: "1rem",
                          padding: "1rem",
                          backgroundColor: "#f9fafb",
                          borderRadius: "4px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <strong style={{ color: "#111827" }}>
                            {request.firstName} {request.lastName} ({request.company})
                          </strong>
                          <span style={{ color: "#6B7280", fontSize: "0.875rem" }}>
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: "#374151" }}>{request.message}</p>
                      </div>
                    ))}
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

const AdminSubscribers = () => {
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
      const response = await axios.get("/api/newsletter");
      setSubscribers(response.data.subscribers || []);
    } catch (err: any) {
      console.error("Error fetching subscribers:", err);
      setError(err.response?.data?.message || "Failed to load subscribers");
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
    link.setAttribute("download", `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 mx-auto max-w-[1400px] sm:px-6 xl:px-0 py-10">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/admin"
            className="text-[#2958A4] hover:text-[#1F4480] text-[16px] font-medium"
          >
            ← Back to Admin
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[#2958A4] text-[36px] font-medium leading-[44px] tracking-[-1.44px]">
              Newsletter Subscribers
            </h1>
            <p className="text-[#383838] text-[16px] mt-2">
              Total subscribers: {subscribers.length}
            </p>
          </div>
          {subscribers.length > 0 && (
            <button
              onClick={exportToCSV}
              className="px-6 py-2.5 bg-[#2958A4] text-white rounded-full hover:bg-[#1F4480] transition-colors text-[16px] font-medium"
            >
              Export CSV
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-[#2958A4] text-[18px]">Loading subscribers...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : subscribers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-1">
            <p className="text-[#383838] text-[18px]">No subscribers yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F6F7F7] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-[16px] font-medium text-[#383838]">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-[16px] font-medium text-[#383838]">
                      Subscribed Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subscribers.map((subscriber) => (
                    <tr
                      key={subscriber.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-[16px] text-[#383838]">
                        {subscriber.email}
                      </td>
                      <td className="px-6 py-4 text-[16px] text-[#383838]">
                        {formatDate(subscriber.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscribers;


"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function Home() {
  const [data, setData] = useState({
    summary: { total_monthly_leak_amount: 0, leak_score: 0, categories: {} },
    subscriptions: [],
  });

  const [selectedSub, setSelectedSub] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

  const handleFileUpload = async (e) => {
    if (e.target.files.length > 0) {
      setIsScanning(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          "https://vaultify-rtxr.onrender.com/api/upload-statement",
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        setData({
          summary: result.summary,
          subscriptions: result.subscriptions,
        });

        setIsScanning(false);
        setHasUploaded(true);
      } catch (error) {
        console.error("Upload failed:", error);
        setIsScanning(false);
        alert(
          "Failed to connect to backend. Make sure FastAPI is running on port 8000!",
        );
      }
    }
  };

  const chartData = data.summary?.categories
    ? Object.keys(data.summary.categories).map((key) => ({
        name: key,
        value: data.summary.categories[key],
      }))
    : [];

  return (
    <main className="min-h-screen bg-[#F7F9FC] p-8 font-sans text-gray-900 relative">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Leak Detector
            </h1>
            <p className="text-gray-500 mt-2">
              Autonomous Recurring Payment & Subscription Audit
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Total Monthly Leak
            </p>
            <p className="text-5xl font-black text-rose-600 tracking-tighter">
              ${data.summary.total_monthly_leak_amount}
            </p>
          </div>
        </header>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold mb-2">Upload Bank Statement</h2>
          <p className="text-sm text-gray-500 mb-4">
            Upload a PDF or CSV statement to scan for hidden subscriptions and
            price hikes.
          </p>

          <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors bg-gray-50/50">
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.csv,.txt"
            />

            {isScanning ? (
              <div className="flex items-center space-x-3 text-indigo-600 font-semibold">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning transactions with AI...</span>
              </div>
            ) : hasUploaded ? (
              <div className="text-emerald-600 font-semibold text-center">
                ✅ Statement successfully analyzed! Displaying detected leaks
                below.
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">
                  Click to upload statement file
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, CSV or TXT up to 10MB
                </p>
              </div>
            )}
          </label>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-6">Leakage by Category</h2>
            <div className="h-48 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `$${value}`}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  No category data available
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-4 text-sm font-medium text-gray-600 flex-wrap">
              {chartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center items-center text-center">
            <h2 className="text-lg font-bold mb-2">Overall Leak Score</h2>
            <p className="text-sm text-gray-500 mb-6">
              100 = Critical Financial Drain
            </p>

            <div className="relative w-32 h-32 flex items-center justify-center bg-rose-50 rounded-full border-8 border-rose-100">
              <span className="text-4xl font-black text-rose-600">
                {data.summary.leak_score}
              </span>
            </div>
          </section>
        </div>

        <section>
          <h2 className="text-xl font-bold mb-4">Actionable Subscriptions</h2>
          <div className="grid gap-4">
            {data.subscriptions && data.subscriptions.length > 0 ? (
              data.subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center transition-all hover:shadow-md"
                >
                  <div>
                    <h3 className="text-lg font-bold">{sub.merchant_name}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                      {sub.category}
                    </p>

                    {sub.status === "price_hike" && (
                      <span className="inline-block mt-3 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                        ↑ Price hiked from ${sub.previous_monthly_price}
                      </span>
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end gap-3">
                    <p className="text-2xl font-bold">
                      ${sub.current_monthly_price}
                    </p>

                    <button
                      onClick={() => setSelectedSub(sub)}
                      className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-600 hover:shadow transition-all cursor-pointer"
                    >
                      {sub.action_plan?.action_type === "cancel_or_downgrade"
                        ? "Cancel Service"
                        : "Renegotiate"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-xl text-center text-gray-500 border border-gray-200">
                No subscriptions detected yet. Upload a statement to scan!
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedSub && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">
                Action Plan: {selectedSub.merchant_name}
              </h3>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-2">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Recommended Action
              </p>
              <p className="text-gray-800 font-medium leading-relaxed">
                {selectedSub.action_plan?.guidance || "No guidance generated."}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSub(null)}
                className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

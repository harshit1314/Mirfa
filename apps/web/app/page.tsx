"use client";

import { useState } from "react";

type TxRecord = {
  id: string;
  partyId: string;
  createdAt: string;
  payload_nonce: string;
  payload_ct: string;
  payload_tag: string;
  dek_wrap_nonce: string;
  dek_wrapped: string;
  dek_wrap_tag: string;
  alg: "AES-256-GCM";
  mk_version: number;
};

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const [partyId, setPartyId] = useState("party_123");
  const [jsonPayload, setJsonPayload] = useState(
    JSON.stringify({ amount: 100, currency: "AED" }, null, 2)
  );
  const [transactionId, setTransactionId] = useState("");
  const [encryptedRecord, setEncryptedRecord] = useState<TxRecord | null>(null);
  const [decryptedPayload, setDecryptedPayload] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleEncryptAndSave = async () => {
    clearMessages();
    setLoading(true);

    try {
      const payload = JSON.parse(jsonPayload);

      const response = await fetch(`${API_URL}/tx/encrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId, payload }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Encryption failed");
      }

      const record: TxRecord = await response.json();
      setTransactionId(record.id);
      setEncryptedRecord(record);
      setSuccess(
        `✅ Encrypted & Saved! Transaction ID: ${record.id.substring(0, 8)}...`
      );
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    clearMessages();
    setLoading(true);

    try {
      if (!transactionId) {
        throw new Error("Please enter a transaction ID");
      }

      const response = await fetch(`${API_URL}/tx/${transactionId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Fetch failed");
      }

      const record: TxRecord = await response.json();
      setEncryptedRecord(record);
      setSuccess("✅ Encrypted record fetched!");
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    clearMessages();
    setLoading(true);

    try {
      if (!transactionId) {
        throw new Error("Please enter a transaction ID");
      }

      const response = await fetch(`${API_URL}/tx/${transactionId}/decrypt`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Decryption failed");
      }

      const data: { payload: object } = await response.json();
      setDecryptedPayload(data.payload);
      setSuccess("✅ Decrypted successfully!");
    } catch (err) {
      setError(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔐 Secure Transactions
          </h1>
          <p className="text-gray-600">
            Powered by Envelope Encryption (AES-256-GCM)
          </p>
        </header>

        <main className="grid gap-8">
          {/* Left Column: Encrypt & Save */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Encrypt & Store
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Party ID
                </label>
                <input
                  type="text"
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  placeholder="e.g., party_123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON Payload
                </label>
                <textarea
                  value={jsonPayload}
                  onChange={(e) => setJsonPayload(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleEncryptAndSave}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {loading ? "Encrypting..." : "🔒 Encrypt & Save"}
              </button>
            </div>
          </div>

          {/* Right Column: Retrieve & Decrypt */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Retrieve & Decrypt
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleFetch}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {loading ? "Fetching..." : "📥 Fetch"}
                </button>
                <button
                  onClick={handleDecrypt}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {loading ? "Decrypting..." : "🔓 Decrypt"}
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Encrypted Record Display */}
          {encryptedRecord && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Encrypted Record
              </h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm font-mono">
                {JSON.stringify(encryptedRecord, null, 2)}
              </pre>
            </div>
          )}

          {/* Decrypted Payload Display */}
          {decryptedPayload && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Decrypted Payload
              </h3>
              <pre className="bg-green-50 p-4 rounded-lg overflow-auto text-sm font-mono text-green-800">
                {JSON.stringify(decryptedPayload, null, 2)}
              </pre>
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>
            Made with ❤️ for Mirfa | Secure Transactions Mini-App Challenge
          </p>
        </footer>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Lock, Unlock, Database, Save, Search, History } from "lucide-react";

export default function Home() {
    const [partyId, setPartyId] = useState("party_123");
    const [payload, setPayload] = useState('{\n  "amount": 100,\n  "currency": "AED"\n}');
    const [lastRecord, setLastRecord] = useState<any>(null);
    const [decryptResult, setDecryptResult] = useState<any>(null);
    const [searchId, setSearchId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const handleEncrypt = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_URL}/tx/encrypt`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partyId, payload: JSON.parse(payload) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to encrypt");
            setLastRecord(data);
            setSearchId(data.id);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFetch = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_URL}/tx/${searchId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch");
            setLastRecord(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDecrypt = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_URL}/tx/${searchId}/decrypt`, {
                method: "POST",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to decrypt");
            setDecryptResult(data.payload);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen p-8 max-w-4xl mx-auto space-y-8">
            <header className="border-b border-white/10 pb-4 mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
                    <Lock size={32} className="text-blue-400" />
                    Mirfa Secure Transactions
                </h1>
                <p className="text-neutral-400 mt-2">AES-256-GCM Envelope Encryption Service</p>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-2">
                    <span>⚠️ {error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Step 1: Encrypt & Save */}
                <section className="bg-neutral-900 border border-white/10 p-6 rounded-xl shadow-xl space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Save size={20} className="text-blue-400" />
                        1. Encrypt & Save
                    </h2>
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-400">Party ID</label>
                        <input
                            className="w-full bg-black border border-white/20 p-2 rounded focus:outline-none focus:border-blue-500 transition-colors"
                            value={partyId}
                            onChange={(e) => setPartyId(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-400">JSON Payload</label>
                        <textarea
                            className="w-full h-32 bg-black border border-white/20 p-2 rounded focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                            value={payload}
                            onChange={(e) => setPayload(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleEncrypt}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Encrypt & Store"}
                    </button>
                </section>

                {/* Step 2: Fetch & Decrypt */}
                <section className="bg-neutral-900 border border-white/10 p-6 rounded-xl shadow-xl space-y-4 text-white">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Unlock size={20} className="text-indigo-400" />
                        2. Fetch & Decrypt
                    </h2>
                    <div className="space-y-2">
                        <label className="text-sm text-neutral-400">Record ID</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 bg-black border border-white/20 p-2 rounded focus:outline-none focus:border-indigo-500 transition-colors"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                placeholder="ID from step 1"
                            />
                            <button
                                onClick={handleFetch}
                                className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded border border-white/10"
                            >
                                <Search size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleDecrypt}
                            disabled={loading || !searchId}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded transition-all disabled:opacity-50"
                        >
                            Decrypt
                        </button>
                    </div>
                    {decryptResult && (
                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-sm font-semibold text-green-400 mb-2">Original Payload:</p>
                            <pre className="text-xs font-mono text-neutral-300 overflow-x-auto">
                                {JSON.stringify(decryptResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </section>
            </div>

            {/* Record Inspection */}
            {lastRecord && (
                <section className="bg-neutral-900 border border-white/10 p-6 rounded-xl shadow-xl space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-neutral-200">
                        <Database size={20} className="text-amber-400" />
                        Encrypted Meta-Data Inspection
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div className="space-y-1">
                            <p className="text-neutral-500">ID: <span className="text-amber-200">{lastRecord.id}</span></p>
                            <p className="text-neutral-500">Created At: <span className="text-neutral-300">{lastRecord.createdAt}</span></p>
                            <p className="text-neutral-500">Algorithm: <span className="text-neutral-300">{lastRecord.alg}</span></p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-neutral-500">Payload CT: <span className="text-neutral-400 truncate block">{lastRecord.payload_ct}...</span></p>
                            <p className="text-neutral-500">DEK Wrapped: <span className="text-neutral-400 truncate block">{lastRecord.dek_wrapped}...</span></p>
                        </div>
                    </div>
                </section>
            )}

            <footer className="pt-8 border-t border-white/10 text-center text-sm text-neutral-500">
                <p>Mirfa Interview Assessment &bull; Secure Storage MVP</p>
            </footer>
        </main>
    );
}

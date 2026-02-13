import Fastify from "fastify";
import cors from "@fastify/cors";
import { EnvelopeEncryption, generateMasterKey } from "@mirfa/crypto";
import { TxStore } from "./store";
// Initialize encryption with master key
// In production, this should be loaded from environment/vault
const masterKey = process.env.MASTER_KEY
    ? Buffer.from(process.env.MASTER_KEY, "hex")
    : generateMasterKey();
console.log("🔐 Master Key initialized");
const envelope = new EnvelopeEncryption(masterKey);
const store = new TxStore();
// Create Fastify instance
const app = Fastify({
    logger: true,
});
// Register CORS
await app.register(cors, {
    origin: true,
});
// POST /tx/encrypt - Encrypt payload
app.post("/tx/encrypt", async (request, reply) => {
    try {
        const { partyId, payload } = request.body;
        if (!partyId || typeof partyId !== "string") {
            return reply.status(400).send({
                error: "INVALID_REQUEST",
                message: "partyId is required",
            });
        }
        if (!payload || typeof payload !== "object") {
            return reply.status(400).send({
                error: "INVALID_REQUEST",
                message: "payload must be a valid object",
            });
        }
        const record = envelope.encryptPayload(payload, partyId);
        store.save(record);
        return reply.status(201).send(record);
    }
    catch (error) {
        app.log.error(error);
        return reply.status(500).send({
            error: "ENCRYPTION_FAILED",
            message: "Failed to encrypt payload",
        });
    }
});
// GET /tx/:id - Get encrypted record
app.get("/tx/:id", async (request, reply) => {
    try {
        const { id } = request.params;
        if (!store.exists(id)) {
            return reply.status(404).send({
                error: "NOT_FOUND",
                message: "Transaction record not found",
            });
        }
        const record = store.get(id);
        return reply.send(record);
    }
    catch (error) {
        app.log.error(error);
        return reply.status(500).send({
            error: "RETRIEVAL_FAILED",
            message: "Failed to retrieve transaction",
        });
    }
});
// POST /tx/:id/decrypt - Decrypt payload
app.post("/tx/:id/decrypt", async (request, reply) => {
    try {
        const { id } = request.params;
        if (!store.exists(id)) {
            return reply.status(404).send({
                error: "NOT_FOUND",
                message: "Transaction record not found",
            });
        }
        const record = store.get(id);
        const result = envelope.decryptPayload(record);
        // Check if decryption failed
        if (typeof result === "string") {
            return reply.status(400).send({
                error: "DECRYPTION_ERROR",
                message: result,
            });
        }
        return reply.send({ payload: result });
    }
    catch (error) {
        app.log.error(error);
        return reply.status(500).send({
            error: "DECRYPTION_FAILED",
            message: "Failed to decrypt payload",
        });
    }
});
// Health check
app.get("/health", async (request, reply) => {
    return reply.send({ status: "ok" });
});
// Start server
const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "0.0.0.0";
try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`✅ Server running at http://${HOST}:${PORT}`);
}
catch (error) {
    app.log.error(error);
    process.exit(1);
}
export default app;
//# sourceMappingURL=server.js.map
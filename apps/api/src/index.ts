import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { seal, unseal, type TxSecureRecord } from "@mirfa/crypto";
import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import "dotenv/config";

const app = Fastify({ logger: true });
const isProd = process.env.NODE_ENV === "production";
const dbPath = isProd ? "/tmp/db.sqlite" : "db.sqlite";
const db = new Database(dbPath);

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    partyId TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    payload_nonce TEXT NOT NULL,
    payload_ct TEXT NOT NULL,
    payload_tag TEXT NOT NULL,
    dek_wrap_nonce TEXT NOT NULL,
    dek_wrapped TEXT NOT NULL,
    dek_wrap_tag TEXT NOT NULL,
    alg TEXT NOT NULL,
    mk_version INTEGER NOT NULL
  )
`);

const MASTER_KEY = process.env.MASTER_KEY || "";
if (!MASTER_KEY || MASTER_KEY.length !== 64) {
    console.error("CRITICAL: MASTER_KEY must be 32 bytes hex (64 chars)");
    process.exit(1);
}

app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
});

// Add preflight handler
app.options("*", async (_request, reply) => {
    reply
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        .header("Access-Control-Allow-Headers", "Content-Type,Authorization")
        .code(204)
        .send();
});

// Zod schemas
const EncryptSchema = z.object({
    partyId: z.string(),
    payload: z.any(),
});

const DecryptSchema = z.object({
    id: z.string(),
});

// Routes
app.get("/", async () => {
    return { status: "ok", message: "Mirfa API is running" };
});

app.post("/tx/encrypt", async (request, reply) => {
    const result = EncryptSchema.safeParse(request.body);
    if (!result.success) {
        return reply.status(400).send({ error: result.error });
    }

    const { partyId, payload } = result.data;

    try {
        const sealed = seal(partyId, payload, MASTER_KEY);
        const id = nanoid();
        const createdAt = new Date().toISOString();

        const record: TxSecureRecord = {
            id,
            createdAt,
            ...sealed,
        };

        const stmt = db.prepare(`
      INSERT INTO transactions (
        id, partyId, createdAt, payload_nonce, payload_ct, payload_tag, 
        dek_wrap_nonce, dek_wrapped, dek_wrap_tag, alg, mk_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            record.id, record.partyId, record.createdAt, record.payload_nonce, record.payload_ct, record.payload_tag,
            record.dek_wrap_nonce, record.dek_wrapped, record.dek_wrap_tag, record.alg, record.mk_version
        );

        return record;
    } catch (err: any) {
        return reply.status(500).send({ error: err.message });
    }
});

app.get("/tx/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const record = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as TxSecureRecord | undefined;

    if (!record) {
        return reply.status(404).send({ error: "Record not found" });
    }

    return record;
});

app.post("/tx/:id/decrypt", async (request, reply) => {
    const { id } = request.params as { id: string };

    const record = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id) as TxSecureRecord | undefined;

    if (!record) {
        return reply.status(404).send({ error: "Record not found" });
    }

    try {
        const payload = unseal(record, MASTER_KEY);
        return { payload };
    } catch (err: any) {
        return reply.status(400).send({ error: err.message });
    }
});

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || "4000");
        await app.listen({ port, host: "0.0.0.0" });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

if (process.env.NODE_ENV !== "production") {
    start();
}

export default async (req: any, res: any) => {
    await app.ready();
    app.server.emit("request", req, res);
};

"use strict";var S=Object.create;var d=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var O=Object.getOwnPropertyNames;var R=Object.getPrototypeOf,I=Object.prototype.hasOwnProperty;var w=(e,t)=>{for(var r in t)d(e,r,{get:t[r],enumerable:!0})},u=(e,t,r,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of O(t))!I.call(e,o)&&o!==r&&d(e,o,{get:()=>t[o],enumerable:!(s=f(t,o))||s.enumerable});return e};var y=(e,t,r)=>(r=e!=null?S(R(e)):{},u(t||!e||!e.__esModule?d(r,"default",{value:e,enumerable:!0}):r,e)),A=e=>u(d({},"__esModule",{value:!0}),e);var b={};w(b,{default:()=>X});module.exports=A(b);var l=y(require("fastify")),_=y(require("@fastify/cors")),c=require("zod"),i=require("@mirfa/crypto"),g=y(require("better-sqlite3")),m=require("nanoid"),C=require("dotenv/config"),n=(0,l.default)({logger:!0}),h=process.env.NODE_ENV==="production",k=h?"/tmp/db.sqlite":"db.sqlite",T=new g.default(k);T.exec(`
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
`);var p=process.env.MASTER_KEY||"";(!p||p.length!==64)&&(console.error("CRITICAL: MASTER_KEY must be 32 bytes hex (64 chars)"),process.exit(1));n.register(_.default,{origin:!0,methods:["GET","POST","PUT","DELETE","OPTIONS"],allowedHeaders:["Content-Type","Authorization"],preflightContinue:!1,optionsSuccessStatus:204});n.options("*",async(e,t)=>{t.code(204).send()});var x=c.z.object({partyId:c.z.string(),payload:c.z.any()}),M=c.z.object({id:c.z.string()});n.get("/",async()=>({status:"ok",message:"Mirfa API is running"}));n.post("/tx/encrypt",async(e,t)=>{let r=x.safeParse(e.body);if(!r.success)return t.status(400).send({error:r.error});let{partyId:s,payload:o}=r.data;try{let E=(0,i.seal)(s,o,p),N=(0,m.nanoid)(),L=new Date().toISOString(),a={id:N,createdAt:L,...E};return T.prepare(`
      INSERT INTO transactions (
        id, partyId, createdAt, payload_nonce, payload_ct, payload_tag, 
        dek_wrap_nonce, dek_wrapped, dek_wrap_tag, alg, mk_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(a.id,a.partyId,a.createdAt,a.payload_nonce,a.payload_ct,a.payload_tag,a.dek_wrap_nonce,a.dek_wrapped,a.dek_wrap_tag,a.alg,a.mk_version),a}catch(E){return t.status(500).send({error:E.message})}});n.get("/tx/:id",async(e,t)=>{let{id:r}=e.params,s=T.prepare("SELECT * FROM transactions WHERE id = ?").get(r);return s||t.status(404).send({error:"Record not found"})});n.post("/tx/:id/decrypt",async(e,t)=>{let{id:r}=e.params,s=T.prepare("SELECT * FROM transactions WHERE id = ?").get(r);if(!s)return t.status(404).send({error:"Record not found"});try{return{payload:(0,i.unseal)(s,p)}}catch(o){return t.status(400).send({error:o.message})}});var U=async()=>{try{let e=parseInt(process.env.PORT||"4000");await n.listen({port:e,host:"0.0.0.0"}),console.log(`Server listening on port ${e}`)}catch(e){n.log.error(e),process.exit(1)}};process.env.NODE_ENV!=="production"&&U();var X=async(e,t)=>{await n.ready(),n.server.emit("request",e,t)};

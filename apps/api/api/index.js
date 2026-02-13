"use strict";var L=Object.create;var d=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var f=Object.getOwnPropertyNames;var R=Object.getPrototypeOf,A=Object.prototype.hasOwnProperty;var I=(e,r)=>{for(var t in r)d(e,t,{get:r[t],enumerable:!0})},u=(e,r,t,o)=>{if(r&&typeof r=="object"||typeof r=="function")for(let a of f(r))!A.call(e,a)&&a!==t&&d(e,a,{get:()=>r[a],enumerable:!(o=S(r,a))||o.enumerable});return e};var l=(e,r,t)=>(t=e!=null?L(R(e)):{},u(r||!e||!e.__esModule?d(t,"default",{value:e,enumerable:!0}):t,e)),h=e=>u(d({},"__esModule",{value:!0}),e);var P={};I(P,{default:()=>C});module.exports=h(P);var y=l(require("fastify")),g=l(require("@fastify/cors")),c=require("zod"),p=require("@mirfa/crypto"),_=l(require("better-sqlite3")),N=require("nanoid"),v=require("dotenv/config"),n=(0,y.default)({logger:!0}),w=process.env.NODE_ENV==="production",k=w?"/tmp/db.sqlite":"db.sqlite",T=new _.default(k);T.exec(`
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
`);var i=process.env.MASTER_KEY||"";(!i||i.length!==64)&&(console.error("CRITICAL: MASTER_KEY must be 32 bytes hex (64 chars)"),process.env.NODE_ENV==="production"?n.setErrorHandler(async(r,t,o)=>(console.error(r),o.status(500).send({error:"Server configuration error",code:"CONFIG_ERROR"}))):process.exit(1));n.register(g.default,{origin:!0,methods:["GET","POST","PUT","DELETE","OPTIONS"],allowedHeaders:["Content-Type","Authorization"],preflightContinue:!1,optionsSuccessStatus:204});n.options("*",async(e,r)=>{r.header("Access-Control-Allow-Origin","*").header("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS").header("Access-Control-Allow-Headers","Content-Type,Authorization").code(204).send()});var U=c.z.object({partyId:c.z.string(),payload:c.z.any()}),M=c.z.object({id:c.z.string()});n.get("/",async()=>({status:"ok",message:"Mirfa API is running"}));n.post("/tx/encrypt",async(e,r)=>{let t=U.safeParse(e.body);if(!t.success)return r.status(400).send({error:t.error});let{partyId:o,payload:a}=t.data;try{let E=(0,p.seal)(o,a,i),m=(0,N.nanoid)(),O=new Date().toISOString(),s={id:m,createdAt:O,...E};return T.prepare(`
      INSERT INTO transactions (
        id, partyId, createdAt, payload_nonce, payload_ct, payload_tag, 
        dek_wrap_nonce, dek_wrapped, dek_wrap_tag, alg, mk_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(s.id,s.partyId,s.createdAt,s.payload_nonce,s.payload_ct,s.payload_tag,s.dek_wrap_nonce,s.dek_wrapped,s.dek_wrap_tag,s.alg,s.mk_version),s}catch(E){return r.status(500).send({error:E.message})}});n.get("/tx/:id",async(e,r)=>{let{id:t}=e.params,o=T.prepare("SELECT * FROM transactions WHERE id = ?").get(t);return o||r.status(404).send({error:"Record not found"})});n.post("/tx/:id/decrypt",async(e,r)=>{let{id:t}=e.params,o=T.prepare("SELECT * FROM transactions WHERE id = ?").get(t);if(!o)return r.status(404).send({error:"Record not found"});try{return{payload:(0,p.unseal)(o,i)}}catch(a){return r.status(400).send({error:a.message})}});var x=async()=>{try{let e=parseInt(process.env.PORT||"4000");await n.listen({port:e,host:"0.0.0.0"}),console.log(`Server listening on port ${e}`)}catch(e){n.log.error(e),process.exit(1)}};process.env.NODE_ENV!=="production"&&x();var C=n;

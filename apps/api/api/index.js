"use strict";var O=Object.create;var d=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var f=Object.getOwnPropertyNames;var A=Object.getPrototypeOf,R=Object.prototype.hasOwnProperty;var h=(e,r)=>{for(var t in r)d(e,t,{get:r[t],enumerable:!0})},y=(e,r,t,s)=>{if(r&&typeof r=="object"||typeof r=="function")for(let a of f(r))!R.call(e,a)&&a!==t&&d(e,a,{get:()=>r[a],enumerable:!(s=S(r,a))||s.enumerable});return e};var l=(e,r,t)=>(t=e!=null?O(A(e)):{},y(r||!e||!e.__esModule?d(t,"default",{value:e,enumerable:!0}):t,e)),I=e=>y(d({},"__esModule",{value:!0}),e);var C={};h(C,{default:()=>P});module.exports=I(C);var u=l(require("fastify")),_=l(require("@fastify/cors")),c=require("zod"),p=require("@mirfa/crypto"),g=l(require("better-sqlite3")),N=require("nanoid"),v=require("dotenv/config"),n=(0,u.default)({logger:!0}),w=process.env.NODE_ENV==="production",k=w?"/tmp/db.sqlite":"db.sqlite",T=new g.default(k);T.exec(`
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
`);var i=process.env.MASTER_KEY||"";(!i||i.length!==64)&&(console.error("CRITICAL: MASTER_KEY must be 32 bytes hex (64 chars)"),process.exit(1));n.register(_.default,{origin:!0,methods:["GET","POST","PUT","DELETE","OPTIONS"],allowedHeaders:["Content-Type","Authorization"],preflightContinue:!1,optionsSuccessStatus:204});n.options("*",async(e,r)=>{r.header("Access-Control-Allow-Origin","*").header("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS").header("Access-Control-Allow-Headers","Content-Type,Authorization").code(204).send()});var U=c.z.object({partyId:c.z.string(),payload:c.z.any()}),M=c.z.object({id:c.z.string()});n.get("/",async()=>({status:"ok",message:"Mirfa API is running"}));n.post("/tx/encrypt",async(e,r)=>{let t=U.safeParse(e.body);if(!t.success)return r.status(400).send({error:t.error});let{partyId:s,payload:a}=t.data;try{let E=(0,p.seal)(s,a,i),m=(0,N.nanoid)(),L=new Date().toISOString(),o={id:m,createdAt:L,...E};return T.prepare(`
      INSERT INTO transactions (
        id, partyId, createdAt, payload_nonce, payload_ct, payload_tag, 
        dek_wrap_nonce, dek_wrapped, dek_wrap_tag, alg, mk_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(o.id,o.partyId,o.createdAt,o.payload_nonce,o.payload_ct,o.payload_tag,o.dek_wrap_nonce,o.dek_wrapped,o.dek_wrap_tag,o.alg,o.mk_version),o}catch(E){return r.status(500).send({error:E.message})}});n.get("/tx/:id",async(e,r)=>{let{id:t}=e.params,s=T.prepare("SELECT * FROM transactions WHERE id = ?").get(t);return s||r.status(404).send({error:"Record not found"})});n.post("/tx/:id/decrypt",async(e,r)=>{let{id:t}=e.params,s=T.prepare("SELECT * FROM transactions WHERE id = ?").get(t);if(!s)return r.status(404).send({error:"Record not found"});try{return{payload:(0,p.unseal)(s,i)}}catch(a){return r.status(400).send({error:a.message})}});var x=async()=>{try{let e=parseInt(process.env.PORT||"4000");await n.listen({port:e,host:"0.0.0.0"}),console.log(`Server listening on port ${e}`)}catch(e){n.log.error(e),process.exit(1)}};process.env.NODE_ENV!=="production"&&x();var P=async(e,r)=>{await n.ready(),n.server.emit("request",e,r)};

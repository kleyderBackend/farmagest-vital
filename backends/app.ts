import express from "express";
import cors from "cors";
import type { Express } from "express";

export const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.json({
        message:"API funcionando"
    });
});


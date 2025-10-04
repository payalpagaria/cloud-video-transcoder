import 'dotenv/config';
import express from "express";
import dotenv from "dotenv"
import uploadRouter from "./routes/uploadRoute.js";
import cors from 'cors'
dotenv.config();
const PORT=process.env.PORT || 8000
const app=express()
app.use(cors({
  origin: '',  // your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use('/upload',uploadRouter)


app.use(express.json())
app.listen(PORT,()=>console.log(`The server is started on port ${PORT}`))
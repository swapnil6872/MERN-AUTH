import express from "express";
import cors from "cors";
import 'dotenv/config.js';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import AuthRouter from '../server/routes/authRoutes.js'

const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true}));

//api endpoits
app.get('/',(req,res)=>{
  res.send("Api is working")
})

app.use('/api/auth',AuthRouter)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

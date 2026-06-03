import dotenv from "dotenv";
import cors from "cors"
import express from "express"
import dns from "dns"
import { connectDB } from "./Backend/module/db.js";
import userRoutes from "./Backend/route/user.route.js"
import rentalRoutes from "./Backend/route/rentalItem.route.js"

dns.setServers(["1.1.1.1","8.8.8.8"])
dotenv.config()
const app=express()
const PORT=process.env.PORT || 5000


//middlewares
app.use(cors())

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/user",userRoutes)
app.use("/item",rentalRoutes)




app.get("/",(req,res)=>{
    res.send("server is Active")
})


app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}/`);
  connectDB()
});
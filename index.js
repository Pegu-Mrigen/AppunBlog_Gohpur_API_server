import express from "express";
import userRouter from "./routes/userRoute.js";
import postRouter from "./routes/postRoute.js";
import commentRouter from "./routes/commentRoute.js";
import webhookRouter from "./routes/webhookRoute.js";
import connectDB from "./lib/connectDB.js";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import cors from "cors"

const app = express();

app.use(cors(process.env.CLIENT_URL)); // Add this line to enable CORS
app.use(clerkMiddleware());
app.use("/webhooks", webhookRouter); //TOP OF express.json()  MIDDLEWARE TO USE BODY PARSER

app.use(express.json()); //BELLOW WEBHOOK ROUTER TO USE THE MIDDLEWARE


 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// console.log("first listen3")
// console.log("first listen43")
// console.log(process.env.test)

// app.get("/auth-state", (req, res) => {
//   const authState = req.auth;
//   res.json(authState);
// });
// app.get("/protect", (req, res) => {
//   const {userId} = req.auth;
//   if(!userId){
//     return res.status(401).json({ message: "Unauthorized" });

//   }
//   res.status(200).json({ message: "content" });

// });
// app.get("/protect2", requireAuth(), (req, res) => {
//   res.status(200).json({ message: "content" });
// });




app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message || "Something went wrong",
    status: err.status,
    stack: err.stack,
  });
});

app.listen(3000, (err, res) => {
  connectDB();
  console.log("first liEsftren");
});

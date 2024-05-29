require("dotenv").config();
const express = require("express");
const connctToDb = require("./config/connectToDb");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const imageRoutes = require("./routes/imageRoutes");

const cors = require("cors");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// connect to database
connctToDb();

// initial express app
const app = express();

// middleware
// parse request body
app.use(express.json());

// cors policy
/* app.use(
  cors({
    origin: "http://localhost:3000",
    headers
    credentials: true,
  })
); */
app.use(
  cors("*")
);

app.get("/test",(req,res)=>{
  res.json({message :"hellow server is run"})
})

// Routes (auth Routes)
app.use("/api/auth", authRoutes);

// Routes (users Routes)
app.use("/api/users", usersRoutes);

// Rotes of (Images)
app.use("/api/images", imageRoutes);

app.use(notFound);
// error handler middleware
app.use(errorHandler);

const port = process.env.PORT || 3500;

app.listen(port, () =>
  console.log(
    `app is running in ${process.env.NODE_ENV} connected on port ${port}`
  )
);

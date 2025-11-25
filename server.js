import express from "express";
import dotenv from "dotenv";
import authRoutes from "./auth.js";
import bullhornRoutes from "./bullhorn.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/bullhorn", bullhornRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});







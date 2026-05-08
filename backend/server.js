const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { initializeDatabase } = require("./bootstrap");
const { Product, Zone, User, Movement } = require("./models/associations");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/zone-types", require("./routes/zoneTypeRoutes"));
app.use("/api/zones", require("./routes/zones"));
app.use("/api/products", require("./routes/products"));
app.use("/api/movements", require("./routes/movements"));
app.use("/api/alerts", require("./routes/alerts"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/inventory-calendar", require("./routes/inventoryCalendarRoutes"));
app.use("/api/ai-alerts", require("./routes/aiAlerts"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));


const PORT = process.env.PORT || 5000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  });

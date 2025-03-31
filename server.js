const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const mongoose = require("mongoose");
const connectDB = require("./database/db");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION", err);
  process.exit(1);
  // shutdown();
});

const app = require("./app");

connectDB();

const port = process.env.PORT || 8080;

if (process.argv.includes("--production")) {
  process.env.NODE_ENV = "production";
} else {
  process.env.NODE_ENV = "development";
}

const server = app.listen(port, "127.0.0.1", () => {
  console.log(`Waiting for request on port ${port}...`);
});

// GRAFEFULLY shut down on SIGINT (Ctrl + C) or SIGTERM (Container stopping)
async function shutdown() {
  console.log("Shutting down....");

  //Close Mongoose Connectin
  await mongoose.connection.close();
  console.log("MongoDB Database Connection closed");

  //Stop Express server
  server.close(() => {
    console.log("Server stopped");
    process.exit(1);
  });
}

// shutdown().then(() => console.log("Shutdown complete"));

// Listens for Signal terminations
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLE REJECTION", err.name, err.message);
  shutdown();
});

const http = require("http");

// Simple HTTP server to satisfy Render's port binding requirement
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "healthy",
        service: "Solana Telegram Bot",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
      })
    );
    return;
  }

  // Default response for other routes
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      error: "Not Found",
      message: "This is a Telegram bot service. Use /health for status.",
    })
  );
});

// Use the PORT environment variable that Railway provides, or default to 3000
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 HTTP server listening on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}`);
  console.log(`🚂 Railway deployment ready`);
});

// Handle server errors
server.on("error", (error) => {
  console.error("❌ Server error:", error);
  if (error.code === "EADDRINUSE") {
    console.error(
      `⚠️ Port ${PORT} is already in use. Please try a different port.`
    );
  }
});

// Import and start the main application
try {
  require("./dist/index.js");
  console.log("✅ Bot application started successfully");
} catch (error) {
  console.error("❌ Failed to start bot application:", error);
  process.exit(1);
}

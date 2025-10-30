import http from "http";

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
        message: "Bot is monitoring for tokens"
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

// Use the PORT environment variable that Render provides
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 HTTP server listening on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}`);
  console.log(`✅ Render deployment ready`);
});

// Keep alive function to ping our own endpoint
function keepAlive() {
  const options = {
    host: 'localhost',
    port: PORT,
    path: '/health',
    method: 'GET',
    headers: {
      'User-Agent': 'Solana-Bot-Keep-Alive'
    }
  };

  const req = http.request(options, (res) => {
    res.on('data', () => {}); // Consume the response data
    res.on('end', () => {
      console.log(`✅ Ping successful at ${new Date().toISOString()}`);
    });
  });

  req.on('error', (e) => {
    console.log(`❌ Ping error: ${e.message}`);
  });

  req.end();
}

// Send a ping every 14 minutes to keep the service awake
setInterval(keepAlive, 14 * 60 * 1000);
console.log('⏰ Keep-alive ping scheduled every 14 minutes');

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
async function startBot() {
  try {
    await import("./dist/index.js");
    console.log("✅ Bot application started successfully");
    
    // Start the keep-alive ping after the bot starts
    keepAlive(); // Initial ping
  } catch (error) {
    console.error("❌ Failed to start bot application:", error);
    process.exit(1);
  }
}

// Start the bot
startBot();

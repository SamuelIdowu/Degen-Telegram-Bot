const { execSync } = require("child_process");

console.log("🔍 Testing TypeScript compilation...");

try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Build completed successfully!");
  console.log("🚀 Ready for Railway deployment");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}

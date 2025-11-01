// middleware/debugLogger.js
export const debugLogger = (req, res, next) => {
  console.log("🟦 [REQUEST DEBUG] -----------------------------");
  console.log("📩 req.method:", req.method);
  console.log("📍 req.originalUrl:", req.originalUrl);
  console.log("📩 req.body:", req.body);
  console.log("📨 req.headers:", req.headers);
  console.log("🌐 req.ip:", req.ip);
  console.log("👤 req.userAgent:", req.get("user-agent"));
  console.log("🟦 ---------------------------------------------");

  // Intercept the response before it’s sent
  const originalSend = res.send;
  res.send = function (body) {
    console.log("🟩 [RESPONSE DEBUG] ----------------------------");
    try {
      const responsePayload =
        typeof body === "string" ? JSON.parse(body) : body;
      console.log("📦 Response:", responsePayload);
    } catch (err) {
      console.log("📦 Response (raw):", body);
    }
    console.log("🟩 ---------------------------------------------");
    originalSend.call(this, body);
  };

  next();
};

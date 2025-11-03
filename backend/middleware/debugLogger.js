const debugLogger = (req, res, next) => {
  console.log("\n");
  console.log("\x1b[34m[REQUEST DEBUG] -----------------------------\\x1b[0m");
  console.log(`\x1b[36m${req.method} ${req.originalUrl}\x1b[0m`);
  console.log("\n\x1b[33m[Headers]:\x1b[0m", req.headers);
  console.log("\n\x1b[33m[Body]:\x1b[0m", req.body);
  console.log("\x1b[34m---------------------------------------------\\x1b[0m");

  const originalSend = res.send;
  res.send = function (body) {
    console.log("\x1b[32m[RESPONSE DEBUG] ----------------------------\x1b[0m");
    try {
      const responsePayload =
        typeof body === "string" ? JSON.parse(body) : body;
      console.log("\n\x1b[33m[Payload]:\x1b[0m", responsePayload);
    } catch (err) {
      console.log("\n\x1b[33m[Payload (raw)]:\x1b[0m", body);
    }
    console.log("\x1b[32m---------------------------------------------\\x1b[0m");
    originalSend.call(this, body);
  };

  next();
};

module.exports = { debugLogger };
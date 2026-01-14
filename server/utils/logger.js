const logger = {
  info: (msg, meta = {}) => console.log(`[INFO] ${msg}`, meta),
  warn: (msg, meta = {}) => console.warn(`[WARN] ${msg}`, meta),
  error: (msg, meta = {}) => console.error(`[ERROR] ${msg}`, meta),
  bot: (botName, msg, meta = {}) => console.log(`[BOT:${botName}] ${msg}`, meta)
};

module.exports = logger;

import fs from "fs";
import path from "path";

const logFile = path.join(process.cwd(), "logs", "transactions.log");

// Pastikan folder logs ada
if (!fs.existsSync(path.dirname(logFile))) {
  fs.mkdirSync(path.dirname(logFile));
}

const logger = {
  info: (msg) => {
    const line = `[INFO] ${new Date().toISOString()} - ${msg}\n`;
    fs.appendFileSync(logFile, line);
    console.log(line.trim());
  },
  warn: (msg) => {
    const line = `[WARN] ${new Date().toISOString()} - ${msg}\n`;
    fs.appendFileSync(logFile, line);
    console.warn(line.trim());
  },
  error: (msg) => {
    const line = `[ERROR] ${new Date().toISOString()} - ${msg}\n`;
    fs.appendFileSync(logFile, line);
    console.error(line.trim());
  },
};

export default logger;

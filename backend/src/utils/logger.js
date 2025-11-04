const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDir();
  }

  // Ensure log directory exists
  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Get current timestamp
  getTimestamp() {
    return new Date().toISOString();
  }

  // Get log file path
  getLogFilePath(type = 'app') {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${type}-${date}.log`);
  }

  // Write to log file
  writeToFile(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const logMessage = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };

    const logString = JSON.stringify(logMessage) + '\n';
    const logFile = this.getLogFilePath(level);

    fs.appendFile(logFile, logString, (err) => {
      if (err) console.error('Error writing to log file:', err);
    });
  }

  // Log info message
  info(message, data = null) {
    console.log(`[INFO] ${this.getTimestamp()} - ${message}`, data || '');
    this.writeToFile('info', message, data);
  }

  // Log warning message
  warn(message, data = null) {
    console.warn(`[WARN] ${this.getTimestamp()} - ${message}`, data || '');
    this.writeToFile('warn', message, data);
  }

  // Log error message
  error(message, error = null) {
    console.error(`[ERROR] ${this.getTimestamp()} - ${message}`, error || '');
    this.writeToFile('error', message, error ? {
      message: error.message,
      stack: error.stack
    } : null);
  }

  // Log debug message (only in development)
  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${this.getTimestamp()} - ${message}`, data || '');
    }
  }

  // Log HTTP request
  logRequest(req, res, duration) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    this.info('HTTP Request', logData);
  }

  // Log database query
  logQuery(query, duration) {
    this.debug('Database Query', { query, duration: `${duration}ms` });
  }

  // Log authentication event
  logAuth(event, userId, success = true) {
    const message = `Authentication ${event}: ${success ? 'Success' : 'Failed'}`;
    this.info(message, { userId, event, success });
  }
}

module.exports = new Logger();


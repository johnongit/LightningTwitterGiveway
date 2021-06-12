const { isEmpty, omit } = require("lodash");
const { createLogger, format, transports } = require("winston");

const { combine, timestamp, printf, colorize, errors, metadata } = format;

const isObject = (variable) => {
  return Object.prototype.toString.call(variable) === "[object Object]";
};

const withTimestampFormat = printf(
  ({ level, message, metadata: rawMetadata, timestamp }) => {
    const formattedMessage = isObject(message)
      ? JSON.stringify(message, null, 4)
      : message;

    const metadata = omit(rawMetadata, ["timestamp"]);

    return !!metadata && !isEmpty(metadata)
      ? `${timestamp} [${level}]: ${formattedMessage} ${JSON.stringify(
          metadata,
          null,
          4
        )}`
      : `${timestamp} [${level}]: ${formattedMessage}`;
  }
);

const loggerFormat = combine(
  colorize(),
  errors({ stack: true }),
  timestamp(),
  withTimestampFormat,
  metadata()
);

const logger = createLogger({
  level: "info",
  format: loggerFormat,
  transports: [
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: loggerFormat,
    })
  );
}

module.exports = logger;

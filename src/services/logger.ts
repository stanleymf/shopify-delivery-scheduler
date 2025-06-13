import winston from 'winston';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LoggerOptions {
  level: LogLevel;
  service: string;
  environment: string;
}

export class Logger {
  private logger: winston.Logger;

  constructor(options: LoggerOptions) {
    const { level, service, environment } = options;

    const format = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          service,
          message,
          ...meta,
        });
      })
    );

    this.logger = winston.createLogger({
      level,
      format,
      defaultMeta: { service, environment },
      transports: [
        new winston.transports.Console({
          format: environment === 'development' 
            ? winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
              )
            : format,
        }),
      ],
    });
  }

  error(message: string, meta?: Record<string, any>): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  child(meta: Record<string, any>): Logger {
    const childLogger = this.logger.child(meta);
    const child = Object.create(this);
    child.logger = childLogger;
    return child;
  }
} 
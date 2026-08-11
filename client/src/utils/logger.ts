/**
 * Утилита для логирования с различными уровнями
 */
export class Logger {
    private static instance: Logger;
    private level: LogLevel = LogLevel.INFO;
    private context: string = 'App';

    private constructor() { }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Установка уровня логирования
     * @param level - Уровень
     */
    public setLevel(level: LogLevel): void {
        this.level = level;
    }

    /**
     * Установка контекста
     * @param context - Контекст логирования
     */
    public setContext(context: string): void {
        this.context = context;
    }

    /**
     * Логирование ошибки
     * @param message - Сообщение
     * @param args - Дополнительные аргументы
     */
    public error(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.ERROR) {
            console.error(`[${this.formatTimestamp()}] [${this.context}] ERROR: ${message}`, ...args);
        }
    }

    /**
     * Логирование предупреждения
     * @param message - Сообщение
     * @param args - Дополнительные аргументы
     */
    public warn(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.WARN) {
            console.warn(`[${this.formatTimestamp()}] [${this.context}] WARN: ${message}`, ...args);
        }
    }

    /**
     * Логирование информационного сообщения
     * @param message - Сообщение
     * @param args - Дополнительные аргументы
     */
    public info(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.INFO) {
            console.info(`[${this.formatTimestamp()}] [${this.context}] INFO: ${message}`, ...args);
        }
    }

    /**
     * Логирование отладочного сообщения
     * @param message - Сообщение
     * @param args - Дополнительные аргументы
     */
    public debug(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(`[${this.formatTimestamp()}] [${this.context}] DEBUG: ${message}`, ...args);
        }
    }

    /**
     * Логирование трассировки
     * @param message - Сообщение
     * @param args - Дополнительные аргументы
     */
    public trace(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.TRACE) {
            console.trace(`[${this.formatTimestamp()}] [${this.context}] TRACE: ${message}`, ...args);
        }
    }

    /**
     * Форматирование временной метки
     * @returns Строка с временем
     */
    private formatTimestamp(): string {
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
}

/**
 * Уровни логирования
 */
export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
    TRACE = 4
}

/**
 * Создание логгера для конкретного модуля
 * @param context - Контекст модуля
 * @returns Экземпляр логгера
 */
export function createLogger(context: string): Logger {
    const logger = Logger.getInstance();
    logger.setContext(context);
    return logger;
}
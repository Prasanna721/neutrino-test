import RabbitMQ from "@neutrino-package/rabbitmq";
import {
  getRabbitMQRoutingKey,
  PublishMessageParams,
  RABBITMQ_EXCHANGE_TYPE,
  RABBITMQ_NT_EXCHANGE,
} from "@neutrino-package/rabbitmq/config";
import { LogLevel } from "@neutrino-package/supabase/types";

/**
 * Interface representing the structure of a log message.
 */
export interface LogMessage {
  timestamp: number;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

/**
 * Utility class for creating log messages.
 */
export const createLogMessage = (
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): LogMessage => {
  return {
    timestamp: Date.now(),
    level,
    message,
    meta,
  };
};

export class LogPublisher {
  private static instance: LogPublisher;
  private rabbitMQ: RabbitMQ;
  private exchange: string;
  private exchangeType: string;

  /**
   * Initializes a new instance of LogPublisher.
   * @param exchange - The exchange name (default: "neutrino-test-exchange").
   * @param exchangeType - The exchange type (default: "topic").
   */
  constructor(
    exchange: string = RABBITMQ_NT_EXCHANGE,
    exchangeType: string = RABBITMQ_EXCHANGE_TYPE
  ) {
    const conn_url = process.env.RABBITMQ_CONN_URL;
    this.rabbitMQ = conn_url ? new RabbitMQ(conn_url) : new RabbitMQ();

    this.exchange = exchange;
    this.exchangeType = exchangeType;
  }

  /**
   * Returns the singleton instance of LogPublisher.
   */
  public static getInstance(): LogPublisher {
    if (!LogPublisher.instance) {
      LogPublisher.instance = new LogPublisher();
    }
    return LogPublisher.instance;
  }

  /**
   * Publishes a log message to the RabbitMQ exchange.
   * The routing key is dynamically determined based on the log level.
   *
   * @param log - The log message to publish.
   */
  public async publishLog(testSuiteID: string, log: LogMessage): Promise<void> {
    try {
      // const routingKey = getRabbitMQRoutingKey(testSuiteID);
      const routingKey = `logs.#`;

      const content = Buffer.from(JSON.stringify(log));

      const params: PublishMessageParams = {
        exchange: this.exchange,
        routingKey,
        message: content,
        exchangeType: this.exchangeType,
      };

      await this.rabbitMQ.publishMessage(params);
    } catch (error) {
      console.error("Error publishing log:", error);
    }
  }

  /**
   * Closes the RabbitMQ connection.
   */
  public async close(): Promise<void> {
    await this.rabbitMQ.close();
  }

  /**
   * Static method to directly publish a log message using the singleton instance.
   *
   * @param log - The log message to publish.
   */
  public static async publish(
    testSuiteID: string,
    log: LogMessage
  ): Promise<void> {
    await LogPublisher.getInstance().publishLog(testSuiteID, log);
  }
}

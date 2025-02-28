import { Options, ConsumeMessage } from 'amqplib';


export const RABBITMQ_NT_EXCHANGE = 'neutrino-test-exchange';
export const RABBITMQ_EXCHANGE_TYPE = 'topic';
export const getRabbitMQRoutingKey = (testSuiteID: string) => `logs.${testSuiteID}`;


//
// Interface for RabbitMQ connection configuration
//
export interface RabbitMQConfig {
    protocol?: string;
    hostname?: string;
    port?: number;
    username?: string;
    password?: string;
    vhost?: string;
}

  
//
// Interface for publishing messages
//
export interface PublishMessageParams {
    exchange: string;
    routingKey: string;
    message: unknown;
    exchangeType?: string;
    options?: Options.Publish;
}
  
//
// Interface for consumer parameters
//
export interface StartConsumerParams {
    exchange: string;
    queue: string;
    routingKey: string;
    exchangeType?: string;
    consumerTag?: string;
    onMessage: (message: any, rawMsg: ConsumeMessage) => void;
    queueOptions?: Options.AssertQueue;
}
  
/**
 * Helper to create a RabbitMQConfig from an environment variable.
 * Expects a URL in the form: amqp://username:password@hostname:port/vhost
 */
export function getRabbitMQConfigFromEnv(envVar = 'RABBITMQ_URL'): RabbitMQConfig {
    const urlString = process.env[envVar];
    if (!urlString) {
    throw new Error(`Environment variable ${envVar} is not set`);
    }
    const url = new URL(urlString);
    return {
    protocol: url.protocol.replace(':', ''), 
    hostname: url.hostname,
    port: Number(url.port) || 5672,
    username: url.username,
    password: url.password,
    vhost: url.pathname !== '/' ? url.pathname : '/', 
    };
}
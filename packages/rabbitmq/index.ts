// package/rabbitmq/index.ts
import * as amqp from 'amqplib';
import { Connection, Channel, Options, ConsumeMessage } from 'amqplib';
import { PublishMessageParams, RabbitMQConfig, StartConsumerParams } from './config';

const DEFAULT_CONN_URL = "amqp://guest:guest@127.0.0.1:5672/";
const DEFAULT_OPTIONS: RabbitMQConfig = {
    protocol: 'amqp',
    hostname: '127.0.0.1',
    port: 5672,
    username: 'guest',
    password: 'guest',
    vhost: '/',
};

/**
 * RabbitMQ helper class for publishing messages and starting consumers.
 */
class RabbitMQ {
    private config: RabbitMQConfig = DEFAULT_OPTIONS;
    private conn_url: string;
    private connection: Connection | null = null;
    private channels: Record<string, Channel> = {};

    constructor(conn_url: string = DEFAULT_CONN_URL) {
        this.conn_url = conn_url;
    }

    /**
     * Establishes a connection to RabbitMQ.
     * @returns {Promise<Connection>} The established connection.
     */
    public async connect(): Promise<Connection> {
        if (!this.connection) {
        try {
            this.connection = await amqp.connect(this.conn_url);
            this.connection.on('error', (err: Error) => {
            console.error('RabbitMQ connection error:', err);
            this.connection = null;
            });
            this.connection.on('close', () => {
            console.warn('RabbitMQ connection closed');
            this.connection = null;
            });
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
        }
        return this.connection;
    }

    /**
     * Creates or retrieves an existing channel.
     * @param {string} channelName - Identifier for the channel.
     * @returns {Promise<Channel>} The RabbitMQ channel.
     */
    public async createChannel(channelName: string = 'default'): Promise<Channel> {
        if (!this.channels[channelName]) {
            const connection = await this.connect();
            const channel = await connection.createChannel();
            this.channels[channelName] = channel;
        }
        return this.channels[channelName];
    }

    /**
     * Publishes a message to the specified exchange and routing key.
     * @param {PublishMessageParams} params - Parameters for publishing.
     */
    public async publishMessage({
        exchange,
        routingKey,
        message,
        exchangeType = 'direct',
        options = {},
    }: PublishMessageParams): Promise<void> {
        const channel = await this.createChannel('publisher');
        await channel.assertExchange(exchange, exchangeType, { durable: true });
        const content = Buffer.from(JSON.stringify(message));
        channel.publish(exchange, routingKey, content, options);
        console.log(
            `Published message to exchange '${exchange}' with routing key '${routingKey}':`,
            message
        );
    }

    /**
     * Starts a consumer that listens on a specific queue and processes messages.
     * @param {StartConsumerParams} params - Consumer setup parameters.
     */
    public async startConsumer({
        exchange,
        queue,
        routingKey,
        exchangeType = 'direct',
        consumerTag,
        onMessage,
        queueOptions = {},
    }: StartConsumerParams): Promise<void> {
        const channel = await this.createChannel('consumer');
        await channel.assertExchange(exchange, exchangeType, { durable: true });
        const q = await channel.assertQueue(queue, { durable: true, ...queueOptions });
        await channel.bindQueue(q.queue, exchange, routingKey);

        console.log(`[*] Waiting for messages in queue: ${q.queue}`);

        channel.consume(
        q.queue,
        (msg: ConsumeMessage | null) => {
            if (msg) {
            try {
                const content = JSON.parse(msg.content.toString());
                onMessage(content, msg);
                channel.ack(msg);
            } catch (error) {
                console.error('Error processing message:', error);
                // Reject message without requeuing
                channel.nack(msg, false, false);
            }
            }
        },
        { consumerTag }
        );
    }

    /**
     * Closes the RabbitMQ connection gracefully.
     */
    public async close(): Promise<void> {
        if (this.connection) {
        await this.connection.close();
        this.connection = null;
        console.log('RabbitMQ connection closed.');
        }
    }
}

export default RabbitMQ;

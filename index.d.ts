export type QoS = 0 | 1 | 2;

export interface MqttStorage {
	getItem(key: string): string | null | undefined;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

export interface ClientConstructorOptions {
	uri: string;
	clientId: string;
	storage?: MqttStorage;
	webSocket?: typeof WebSocket;
}

export interface ConnectOptions {
	userName?: string;
	password?: string;
	willMessage?: Message;
	timeout?: number;
	keepAliveInterval?: number;
	cleanSession?: boolean;
	mqttVersion?: 3 | 4;
}

export interface SubscribeOptions {
	qos?: QoS;
	timeout?: number;
}

export interface UnsubscribeOptions {
	timeout?: number;
}

export interface ConnectionLostResponse {
	errorCode: number;
	errorMessage?: string;
	returnCode: number;
}

export interface ConnectFailure {
	error: Error;
	returnCode: number;
}

export class Message {
	constructor(payload: string | Uint8Array);

	readonly payloadString: string;
	readonly payloadBytes: Uint8Array;
	destinationName: string;
	qos: QoS;
	retained: boolean;
	duplicate: boolean;
}

export class Client {
	constructor(options: ClientConstructorOptions);

	readonly uri: string;
	readonly clientId: string | null;
	trace: ((...args: unknown[]) => void) | null;

	connect(options?: ConnectOptions): Promise<void>;
	disconnect(): Promise<void>;
	isConnected(): boolean;
	subscribe(filter: string, options?: SubscribeOptions): Promise<void>;
	unsubscribe(filter: string, options?: UnsubscribeOptions): Promise<void>;
	send(message: Message): void;
	send(topic: string, payload: string | Uint8Array, qos?: QoS, retained?: boolean): void;
	getTraceLog(): unknown[];
	startTrace(): void;
	stopTrace(): void;

	on(event: 'connectionLost', listener: (response: ConnectionLostResponse) => void): this;
	on(event: 'messageReceived', listener: (message: Message) => void): this;
	on(event: 'messageDelivered', listener: (message: Message) => void): this;
	on(event: string, listener: (...args: unknown[]) => void): this;
	once(event: 'connectionLost', listener: (response: ConnectionLostResponse) => void): this;
	once(event: string, listener: (...args: unknown[]) => void): this;
	removeAllListeners(event?: string): this;
}

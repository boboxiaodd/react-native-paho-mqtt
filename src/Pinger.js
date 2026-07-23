/** @flow */

import WireMessage from './WireMessage';
import { DISCONNECT_REASON, ERROR, MESSAGE_TYPE } from './constants';
import ClientImplementation from './ClientImplementation';
import BackgroundTimer from '@boterop/react-native-background-timer';
import { format } from './util';
import { getErrorMessage } from './errors';

/**
 * Repeat keepalive requests, monitor responses.
 * @ignore
 */
export default class {
  _client: ClientImplementation;
  _keepAliveIntervalMs: number;
  pingReq: ArrayBuffer = new WireMessage(MESSAGE_TYPE.PINGREQ).encode();
  timeout: ?number;
  awaitingResponse: boolean = false;

  constructor(client: ClientImplementation, keepAliveIntervalSeconds: number) {
    this._client = client;
    this._keepAliveIntervalMs = keepAliveIntervalSeconds * 1000;
  }

  _doPing() {
    this.timeout = null;
    this._client._trace('Pinger.doPing', 'send PINGREQ');

    if (!this._client.connected) {
      return;
    }

    if (this.awaitingResponse) {
      this._client._disconnected(
        ERROR.PING_TIMEOUT.code,
        format(ERROR.PING_TIMEOUT),
        0,
        { reason: DISCONNECT_REASON.PING_TIMEOUT }
      );
      return;
    }

    const socket = this._client.socket;
    if (!socket || socket.readyState !== 1) {
      this._client._disconnected(
        ERROR.SOCKET_CLOSE.code,
        format(ERROR.SOCKET_CLOSE, ['unknown', 'Socket is not open', 'unknown']),
        0,
        { reason: DISCONNECT_REASON.SOCKET_CLOSED }
      );
      return;
    }

    try {
      socket.send(this.pingReq);
      this.awaitingResponse = true;
      this.timeout = BackgroundTimer.setTimeout(() => this._doPing(), this._keepAliveIntervalMs);
    } catch (error) {
      const socketErrorMessage = getErrorMessage(error);
      this._client._disconnected(
        ERROR.SOCKET_ERROR.code,
        format(ERROR.SOCKET_ERROR, [socketErrorMessage]),
        0,
        { reason: DISCONNECT_REASON.SOCKET_ERROR, socketErrorMessage }
      );
    }
  }

  start() {
    this.awaitingResponse = false;
    this.reset();
  }

  reset() {
    if (this.timeout !== null && this.timeout !== undefined) {
      BackgroundTimer.clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (this._keepAliveIntervalMs > 0 && this._client.connected && !this.awaitingResponse) {
      this.timeout = BackgroundTimer.setTimeout(() => this._doPing(), this._keepAliveIntervalMs);
    }
  }

  responseReceived() {
    this.awaitingResponse = false;
    this.reset();
  }

  cancel() {
    if (this.timeout !== null && this.timeout !== undefined) {
      BackgroundTimer.clearTimeout(this.timeout);
    }
    this.timeout = null;
    this.awaitingResponse = false;
  }
}

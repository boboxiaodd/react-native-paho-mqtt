/** @flow */

import WireMessage from './WireMessage';
import { MESSAGE_TYPE } from './constants';
import ClientImplementation from './ClientImplementation';

/**
 * Repeat keepalive requests, monitor responses.
 * @ignore
 */
export default class {
  _client: ClientImplementation;
  _keepAliveIntervalMs: number;
  _runAfter: Function;
  pingReq: ArrayBuffer = new WireMessage(MESSAGE_TYPE.PINGREQ).encode();
  timeout: ?number;

  constructor(client: ClientImplementation, keepAliveIntervalSeconds: number , runAfter: Function) {
    this._client = client;
    this._keepAliveIntervalMs = keepAliveIntervalSeconds * 1000;
    this._runAfter = runAfter ? runAfter : setTimeout;
    this.reset();
  }

  _doPing() {
    this._client._trace('Pinger.doPing', 'send PINGREQ');
    if(this._client.socket) {
      this._client.socket.send(this.pingReq);
      this._runAfter(() => this._doPing(), this._keepAliveIntervalMs);
    }else{
      this._client._trace('Pinger.doPing', 'socket closed');
    }
  }

  reset() {
    // if (this.timeout) {
      // clearTimeout(this.timeout);
      // this.timeout = null;
    // }
    if (this._keepAliveIntervalMs > 0) {
      this._runAfter(() => this._doPing(), this._keepAliveIntervalMs);
    }
  }

  cancel() {
    // clearTimeout(this.timeout);
    // this.timeout = null;
  }
}

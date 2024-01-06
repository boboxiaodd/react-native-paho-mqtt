/** @flow */

import WireMessage from './WireMessage';
import { MESSAGE_TYPE } from './constants';
import ClientImplementation from './ClientImplementation';
import BackgroundTimer from 'react-native-background-timer';

/**
 * Repeat keepalive requests, monitor responses.
 * @ignore
 */
export default class {
  _client: ClientImplementation;
  _keepAliveIntervalMs: number;
  pingReq: ArrayBuffer = new WireMessage(MESSAGE_TYPE.PINGREQ).encode();
  timeout: ?number;

  constructor(client: ClientImplementation, keepAliveIntervalSeconds: number) {
    this._client = client;
    this._keepAliveIntervalMs = keepAliveIntervalSeconds * 1000;
    this.reset();
  }

  _doPing() {
    this._client._trace('Pinger.doPing', 'send PINGREQ');
    if(this._client.socket) {
      if(this._client.socket.readyState === WebSocket.OPEN){
        this._client.socket.send(this.pingReq);
        this.timeout = BackgroundTimer.setTimeout(() => this._doPing(), this._keepAliveIntervalMs); 
      }
    }else{
      this._client._trace('Pinger.doPing', 'socket closed');
    }
  }

  reset() {
    if (this.timeout) {
      BackgroundTimer.clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (this._keepAliveIntervalMs > 0) {
      BackgroundTimer.setTimeout(() => this._doPing(), this._keepAliveIntervalMs);
    }
  }

  cancel() {
    BackgroundTimer.clearTimeout(this.timeout);
    this.timeout = null;
  }
}

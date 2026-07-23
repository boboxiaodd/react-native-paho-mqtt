/* @flow */

import { DISCONNECT_REASON, ERROR } from './constants';

const WEBSOCKET_CLOSE_REASONS = {
  1000: 'Normal closure',
  1001: 'Endpoint going away',
  1002: 'Protocol error',
  1003: 'Unsupported data',
  1005: 'No status code received',
  1006: 'Abnormal closure',
  1007: 'Invalid frame payload data',
  1008: 'Policy violation',
  1009: 'Message too big',
  1010: 'Missing WebSocket extension',
  1011: 'Unexpected server condition',
  1012: 'Service restart',
  1013: 'Try again later',
  1014: 'Bad gateway',
  1015: 'TLS handshake failure'
};

export function getDisconnectReason(errorCode: number): string {
  switch (errorCode) {
    case ERROR.OK.code:
      return DISCONNECT_REASON.MANUAL;
    case ERROR.CONNECT_TIMEOUT.code:
      return DISCONNECT_REASON.CONNECT_TIMEOUT;
    case ERROR.PING_TIMEOUT.code:
      return DISCONNECT_REASON.PING_TIMEOUT;
    case ERROR.CONNACK_RETURNCODE.code:
      return DISCONNECT_REASON.CONNACK_REFUSED;
    case ERROR.SOCKET_ERROR.code:
      return DISCONNECT_REASON.SOCKET_ERROR;
    case ERROR.SOCKET_CLOSE.code:
      return DISCONNECT_REASON.SOCKET_CLOSED;
    case ERROR.INVALID_MQTT_MESSAGE_TYPE.code:
      return DISCONNECT_REASON.PROTOCOL_ERROR;
    case ERROR.INTERNAL_ERROR.code:
    case ERROR.MALFORMED_UTF.code:
    case ERROR.MALFORMED_UNICODE.code:
      return DISCONNECT_REASON.INTERNAL_ERROR;
    default:
      return DISCONNECT_REASON.UNKNOWN;
  }
}

export function getErrorMessage(error: any): string {
  if (!error) {
    return 'Unknown error';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error.message === 'string' && error.message) {
    return error.message;
  }
  if (typeof error.data === 'string' && error.data) {
    return error.data;
  }
  if (typeof error.type === 'string' && error.type) {
    return error.type;
  }
  return 'Unknown error';
}

export function getWebSocketCloseDetails(event: any = {}): Object {
  const webSocketCode = typeof event.code === 'number' ? event.code : undefined;
  const protocolReason = webSocketCode === undefined ? undefined : WEBSOCKET_CLOSE_REASONS[webSocketCode];
  const webSocketReason = event.reason || protocolReason || 'Unknown reason';
  const wasClean = typeof event.wasClean === 'boolean' ? event.wasClean : undefined;

  return { webSocketCode, webSocketReason, wasClean };
}

export function createDisconnectResponse({
  errorCode,
  errorMessage,
  returnCode = 0,
  phase,
  reason,
  webSocketCode,
  webSocketReason,
  wasClean,
  socketErrorMessage
}: Object): Object {
  const response: any = {
    errorCode,
    errorMessage,
    returnCode,
    reason: reason || getDisconnectReason(errorCode),
    phase
  };

  if (webSocketCode !== undefined) {
    response.webSocketCode = webSocketCode;
  }
  if (webSocketReason !== undefined) {
    response.webSocketReason = webSocketReason;
  }
  if (wasClean !== undefined) {
    response.wasClean = wasClean;
  }
  if (socketErrorMessage !== undefined) {
    response.socketErrorMessage = socketErrorMessage;
  }

  const error: any = new Error(errorMessage);
  error.name = 'MqttError';
  Object.keys(response).forEach(key => {
    error[key] = response[key];
  });
  response.error = error;

  return response;
}

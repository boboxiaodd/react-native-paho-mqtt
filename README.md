# Usage
```
yarn add https://github.com/boboxiaodd/react-native-paho-mqtt
```


# Change

#### 1. add `react-native-background-timer` to replace `setTimeout`, becase setTimeout will not work when app in background.
#### 2. fixed `INVALID_STATE_ERR` error, when app in background for a long time
#### 3. `client.connect` add `returnCode` to check is MQTT 4,5 CONNACK
```
  4: 'Connection Refused: bad user name or password',
  5: 'Connection Refused: not authorized'
```
Example
```javascript
import { Client } from 'react-native-paho-mqtt';
import BackgroundTimer from 'react-native-background-timer';

let client = null;
function connect_mqtt(){
      client.connect({
          userName: "user",
          password: "pass",
          cleanSession: false,
          keepAliveInterval: 30,
      }).then(() => {
          console.info('mqtt connected!');
      }).catch((responseObject) => {
          console.log('connect fail:' , responseObject);
          if (responseObject.returnCode === 4 || responseObject.returnCode === 5) {
              logout(); //password error(maybe token expired) do logout
          }else{
              BackgroundTimer.setTimeout(() => {connect_mqtt();},1000);
          }
      });
}
client = new Client({
    uri: "ws://x.x.x.x/mqtt",
    clientId: "client_id",
    storage: {
        setItem: (key, item) => {
            mmkv.setString(key,item); //i use react-native-mmkv-storage , you can use other store engine
        },
        getItem: (key) => {
            mmkv.getString(key)
        },
        removeItem: (key) => {
            mmkv.removeItem(key);
        },
    }
});
client.on('connectionLost', (responseObject) => {
    if (responseObject.errorCode !== 0) {
        BackgroundTimer.setTimeout(() => {connect_mqtt();}, 1000);
    }
});
client.on('messageReceived', (message) => {
    parse_mqtt_message(message.topic,JSON.parse(message.payloadString));
});
connect_mqtt();
```



# Eclipse Paho JavaScript client forked for React Native
[![npm version](https://badge.fury.io/js/react-native-paho-mqtt.svg)](https://badge.fury.io/js/react-native-paho-mqtt) [![Build Status](https://travis-ci.org/rh389/react-native-paho-mqtt.svg?branch=master)](https://travis-ci.org/rh389/react-native-paho-mqtt)

A fork of [paho-client](https://www.npmjs.com/package/paho-client), this project exists to provide an ES6-ready, Promise-based, react-native compatible version of the Eclipse Paho client

### Compatibility note

Due to a React Native binary websocket bug, this library will *not work* with React Native 0.46.0 on Android, but should be ok on other platforms. RN 0.47 and RN<=0.45 are fine on all platforms as far as I know.

### Documentation

Reference documentation (for the base Paho client) is online at: [http://www.eclipse.org/paho/files/jsdoc/index.html](http://www.eclipse.org/paho/files/jsdoc/index.html)

## Getting Started

The included code below is a very basic sample that connects to a server using WebSockets and subscribes to the topic ```World```, once subscribed, it then publishes the message ```Hello``` to that topic. Any messages that come into the subscribed topic will be printed to the Javascript console.

This requires the use of a broker that supports WebSockets natively, or the use of a gateway that can forward between WebSockets and TCP.

```js
import { Client, Message } from 'react-native-paho-mqtt';

//Set up an in-memory alternative to global localStorage
const myStorage = {
  setItem: (key, item) => {
    myStorage[key] = item;
  },
  getItem: (key) => myStorage[key],
  removeItem: (key) => {
    delete myStorage[key];
  },
};

// Create a client instance
const client = new Client({ uri: 'ws://iot.eclipse.org:80/ws', clientId: 'clientId', storage: myStorage });

// set event handlers
client.on('connectionLost', (responseObject) => {
  if (responseObject.errorCode !== 0) {
    console.log(responseObject.errorMessage);
  }
});
client.on('messageReceived', (message) => {
  console.log(message.payloadString);
});

// connect the client
client.connect()
  .then(() => {
    // Once a connection has been made, make a subscription and send a message.
    console.log('onConnect');
    return client.subscribe('World');
  })
  .then(() => {
    const message = new Message('Hello');
    message.destinationName = 'World';
    client.send(message);
  })
  .catch((responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.log('onConnectionLost:' + responseObject.errorMessage);
    }
  })
;

```

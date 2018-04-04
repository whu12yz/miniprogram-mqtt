import Paho from './paho-mqtt'
import uuid from './uuid';

class mqtt {
  constructor(mqttConfig) {
    this.globalData = {
      handler: null,
      userInfo: null,
      client: null,
      onMessageArrived: {},
      subscribed: {}
    }
    this.mqttConfig = mqttConfig
  }
  subscribe (topic, subscribeOptions) {
    // 订阅
    const client = this.globalData.client;
    if(! subscribeOptions.onFailure) {
      subscribeOptions.onFailure = (err) => {
        console.log(err);
        this.subscribe(topic, subscribeOptions)
      }
    }
    if (client && client.isConnected()) {
      //缓存已订阅的topic
      console.log(`subscribe success: ${topic}`);
      this.globalData.subscribed[topic] = JSON.stringify(subscribeOptions)
      return client.subscribe(topic, subscribeOptions);
    }
    //处理订阅的时候client可能还没连接成功的情况
  }
  publish(topic, message, qos = 0, retained = false) {
    // 发布
    const client = this.globalData.client;
    if (client && client.isConnected()) {
      let payload = new Paho.Message(message);
      payload.destinationName = topic;
      payload.qos = qos;
      payload.retained = retained;
      return client.send(payload);
    }
  }
  //重新订阅
  resub() {
    for(let topic in this.globalData.subscribed) {
      this.subscribe(topic, JSON.parse(this.globalData.subscribed[topic]))
    }
  }

  setOnMessageArrived(topic, onMessageArrived) {
    if (typeof onMessageArrived === 'function') {
      this.globalData.onMessageArrived[topic] = onMessageArrived
    }
  }

  setOnConnectionLost (onConnectionLost) {
    if (typeof onConnectionLost === 'function') {
      this.globalData.onConnectionLost = onConnectionLost
    }
  }

  __onMessageArrive(client) {
    client.onMessageArrived = (msg) => {
      if (typeof this.globalData.onMessageArrived[msg.topic] === 'function') {
        try {
          return this.globalData.onMessageArrived[msg.topic](msg)
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  __onConnectionLost(client) {
    client.onConnectionLost = (responseObject) => {
      if (typeof this.globalData.onConnectionLost === 'function') {
        return this.globalData.onConnectionLost(responseObject)
      }
      if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
      }
    }
  }

  init () {
    return new Promise((resolve, reject) => {
      const client = new Paho.Client(this.mqttConfig.host, this.mqttConfig.port, uuid())
      delete this.mqttConfig.host
      delete this.mqttConfig.port

      let $$config = {
        useSSL: true,
        cleanSession: true,
        keepAliveInterval: 200,
        reconnect: true,
      }
      $$config = { ...$$config, ...this.mqttConfig }
      $$config.onSuccess = () => {
        console.log('connected');
        this.globalData.client = client
        //订阅已缓存的topic
        this.resub()
        this.__onMessageArrive(client)
        this.__onConnectionLost(client)
        resolve()
      },
      $$config.onFailure = (error) => {
        console.log(error);
        reject(err)
      }

      client.connect($$config);
    })
  }

}
export default mqtt

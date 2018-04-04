### 小程序接入mqtt
***
##### 初始化
```javascript
import Mqtt from 'miniprogram-mqtt'
const mqtt = new Mqtt({
        //必填参数
        host: 'host', //mqtt服务器
        port: null, //端口
        userName: '', //账户名
        password: '' //密码

        //可选参数
        reconnect: true //是否重连 default true
        cleanSession: false //是否保持会话记录 default false
})

//constructor不支持异步，为了保证订阅成功需要等待init完成再进行订阅操作
await mqtt.init() 
```
##### 订阅
```javascript
mqtt.subscribe(topic, options: Object)
options = {
  qos: 0  //quality of service  0,1,2从低到高  default 0
  onSuccess: function() {} 
  onFailure: function() {}
}
```
##### 设置消息到达回调
```javascript
//目前只支持设置一个回调,重复设置会覆盖掉之前的设置
mqtt.setOnMessageArrived(topic, function(msg) {
  console.log(msg)
})
```
##### 发布消息
```javascript
mqtt.publish(topic, message: String)
```

##ToDo
- [ ] 添加设置多个回调，以及cancel指定回调
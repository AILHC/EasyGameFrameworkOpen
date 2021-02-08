## 前言

事件机制,相信很多人都知道，了解，也经常用到。

在设计模式中，它叫 **观察者模式**（又叫发布-订阅模式）。

它无处不在:

在Java中，它是**Java**的核心库**java.utils.Observable**，

在**C#**中，为它提供了语法糖支持:**event关键字**

在web浏览器的Javascript中，有内置的事件机制:window.addEventListener,Event

在Nodejs中，也有内置库events

在游戏引擎中也都是内置的存在

1. CocosCreator的**cc.EventTarget**
2. Laya的**Laya.EventDispatcher**
3. 其他引擎都有

使用这种模式可以让我们**更好地解耦**游戏业务逻辑。

**但是**

这些事件机制的在Js和ts中的实现没能让我觉得满意（我都是使用过），总觉得缺了点什么。

1. 携带数据没类型提示
   1. 消息发送者，没法获得要发送消息携带的数据类型提示
   2. 消息接收者，没法获得发送过来的数据类型提示
2. 面对复杂的通信情况，没内置支持
   1. 想在消息发送点，接收到，消息接收器返回的数据(如果自己实现，将回调包在数据中传给消息接收者，让它执行这个回调)
   2. 事件发出去了，但消息接收者还没注册，错过了
3. 不内置支持状态管理
   1. 很多时候，我们会遇到类似这种需求：
      1. 很多地方需要监听角色等级变化事件然后去角色信息接口取角色等级状态做业务处理
      2. 也就是我们需要在多个地方监听同一个状态变化，然后去某个接口取出当前状态做业务处理。
   2. 这样的处理重复而不优雅。

突然有一天逛**掘金**，看到这么一个文章分享:

[构建复杂应用的神器，FBroadcast](https://zhuanlan.zhihu.com/p/181668358)

看完后，脑子里只有一个字: 这就是我想要的神器

- 虽然它是用dart写给flutter
- 但没关系，借鉴一下，用typescript重写一下
- (ps:部分说明也是复制过来的)

我喜欢逛掘金，虽然他们大多是分享web前端相关的知识，但也有很多可以借鉴用到游戏前端的地方。受益匪浅。

## 介绍

一个基于TypeScript的一套**高效灵活**的广播系统，可以帮助开发者**轻松**、**有序**的构建具有**极具复杂性的关联交互**和**状态变化**的游戏和应用。

## 特性

- 基础事件机制的支持
- 消息支持携带任意类型的数据(并有类型提示)
- 支持函数this绑定或任意类型作为环境，一行代码就可以移除环境内所有的接收者
- 易于构建局部/全局的状态管理
- 支持双向通信
- 支持不可思议的粘性广播
- 基于TypeScript并提供极度舒适的类型提示

## 安装/获取

* 源码获取

  ```bash
  git clone https://github.com/AILHC/EasyGameFrameworkOpen
  //文件路径：EasyGameFrameworkOpen/packages/broadcast
  ```

  

* npm 安装

  ```bash
  npm i @ailhc/broadcast
  ```

  

* 注意⚠️

  * 如果所在项目不支持直接使用npm包

    - 则需要到dist文件夹下，取出可以使用的模块规范类型的文件

    - 比如CocosCreator3D，支持systemjs规范
      - 则可以拿systemjs文件夹下的文件，复制到项目中，设置为插件就可以引入使用了

## 使用

* 通过 broadcast 来注册，发送广播非常简便

```ts
//注册接收器
this._broadcast.on("testA", (str) => {
    //do something
})
//发送消息
this._broadcast.broadcast("testA", "string")
```

* broadcast允许在注册/发送消息时，携带任意类型数据，并支持类型提示

  ![](https://coding-pages-bucket-434147-7588795-4574-367535-1255530080.cos.ap-guangzhou.myqcloud.com/img/20201227212518.png)

* broadcast允许在注册消息时，给自己透传数据（而非通过闭包取闭包外数据的方式）

  > 灵感来自Laya的EventDispatcher

  ![](https://coding-pages-bucket-434147-7588795-4574-367535-1255530080.cos.ap-guangzhou.myqcloud.com/img/20201227212736.png)

  闭包使用不当容易出问题。

* 开发者可以选择将特定类型的消息进行持久化，这样就能轻易实现广播式的全局状态管理。

  > ⚠️注意，一个消息类型一旦持久化就只能通过 brocast.offAll(key) 来从广播系统中移除该类型的消息。

  ```ts
  broadcast.broadcast(
              //消息类型key
              "objTypeTest",
              //数据
              {a:1,b:"",c:false},
              //回调
              undefined,
              //持久化
              true
              )
  ```

  

* 粘性广播

  ```ts
  broadcast.stickyBroadcast(
      //消息类型key
      "stringTypeTest",
      //数据
      "");
  ```

当广播系统中没有对应类型的接收器时，**粘性广播** 将会暂时滞留在系统中，直到有该类型的接收器被注册，则会立即发出广播（当广播系统中有对应类型的接收器时，就和普通广播具有相同的表现）。

* 双向通信

  > 双向沟通，双倍效率

broadcast支持在广播发送点接收接收器返回的消息。

```ts
//发送消息
broadcast.broadcast(
    //消息类型key
    "numberTypeTest",
    //数据
    1,
    ////接收器返回的消息
    (data) => {
        // do something
    })

//注册接收器
broadcast.on("numberTypeTest", (data, callback) => {
            

    /// do something
    var result = logic();

    // 返回消息
    callback(result);
})
```

* 支持函数this绑定或任意类型作为 环境绑定

  在CocosCreator中注册事件可以这样

  ```ts
  this.node.on(cc.Node.EventType.TOUCH_START, this.showAnimView, this)
  ```

  这个this可以用来调用showAnimView这个方法，不至于调用的方法里使用this时丢失this

  而在broadcast中也支持，还支持在环境解构时，开发者可以方便的一次性移除所有在该环境中注册的接收器。

  ```ts
  broadcast.offAllByContext(this)
  ```

* 支持批量注册接收者

  ```ts
  broadcast.on([
      {
          //消息类型
          key: "numberTypeTest",
          //接收器
          listener: this.onNumberTypeTest,
          //环境
          context: this
      },
      {
          //消息类型
          key: "stringTypeTest",
          //接收器
          listener: this.onStringTypeTest,
          //环境
          context: this
      }
      //
  ])
  ```

  基本的使用就这些了

  具体的使用例子可以克隆仓库:[EasyGameFramework](https://github.com/AILHC/EasyGameFrameworkOpen)

  看基于CocosCreator2.4.2的demo examples/egf-ccc-full/assets/tests/broadcastTest

  打开这个场景:broadcastTest.fire

  看demo之前，需要安装环境哦，

  安装 npm ，然后到egf-ccc-full 根目录 

  ```bash
  npm install
  ```

## 极度舒适的类型提示演示

```ts
//需要消息定义者，定义时添加如下类型声明
declare global {
    interface ITestKey extends broadcast.IMsgKey {
        testA: "testA",
        testB: "testB",
        testC: "testC",
        testD: "testD",
        //消息类型key提示
        objTypeTest: "objTypeTest"
    }
    interface ITestValueType extends broadcast.IMsgValueType {
        testA: string,
        testB: string,
        testC: string,
        testD: string,
        //对应消息类型的发消息和收消息的类型声明
        objTypeTest: { a: number, b: string, c: boolean }

    }
    interface ITestResultType extends broadcast.IResultType {
        testC: string,
        //双向通信返回数据类型声明
        objTypeTest: { callbackDataA: { hahah: string } }
    }
}
//然后在实例化broadcast时，注入类型
export default class TestBroadcast extends cc.Component {
    private _broadcast: Broadcast<ITestKey, ITestValueType, ITestResultType>
    start() {
        this._broadcast = new Broadcast<ITestKey, ITestValueType, ITestResultType>();
    }
}
```

### 演示

![](https://coding-pages-bucket-434147-7588795-4574-367535-1255530080.cos.ap-guangzhou.myqcloud.com/img/broadcast类型提示演示.gif)

## demo测试展示

![](https://coding-pages-bucket-434147-7588795-4574-367535-1255530080.cos.ap-guangzhou.myqcloud.com/img/broadcast测试.gif)

 
## [CHANGELOG](packages/broadcast/CHANGELOG.md)


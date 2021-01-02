# `@ailhc/xstate2c3d`
> 将xstate转为systemjs规范给c3d使用
## 问题
因为xstate非web版引用了node的变量: progress.env
解决方案
1. 对xstate的package.json做了些许改动，让main指向 xstate.web.js，因为xstate非web版有些变量会导致运行报错，删除module字段
2. 修改生成后的index.js 
```ts
exports({
        ActionTypes: void 0,
        InterpreterStatus: void 0,
        Machine: Machine,
        SpecialTargets: void 0,
        createMachine: createMachine,
        doneInvoke: doneInvoke,
        forwardTo: forwardTo,
        interpret: interpret,
        mapState: mapState,
        matchState: matchState,
        matchesState: matchesState,
        send: send$1,
        sendParent: sendParent,
        sendUpdate: sendUpdate,
        spawn: spawn
      });
      var process = { env: { NODE_ENV: "production" } }
```
## 使用
复制dist/system文件夹下lib和types到c3d项目，将index.js设置为插件
在任意脚本引用就可以
```ts
import { createMachine, interpret } from "@ailhc/xstate2c3d"
```




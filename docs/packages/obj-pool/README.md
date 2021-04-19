# `@ailhc/obj-pool`

## 简介
这是一个通用的对象池管理模块，可以使用对象池管理器对全局多个对象池进行管理，也可以使用单个对象池。对象池管理的对象可以不实现对应的接口，而通过向对象池实例注册通用的对象获取和回收处理函数

## 特性
1. 全局管理多个对象池
2. 对象无需实现对象池对象接口也可进行获取和回收处理
3. 简洁可扩展的API
4. 智能类型提示
****
## 安装
1. 通过npm安装
	
    	npm i @ailhc/layer   
2. 本地link npm包
	
    a. clone 项目仓库
    
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
        
    b. 在packages/layer文件夹下 

    	npm link
    
    c. 在项目游戏项目目录下 
    	
        npm link @ailhc/layer    
3. 使用源码
    a. clone 项目仓库
    
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
    b. 直接复制packages/layer/src下的ts源码到项目文件夹下使用(排除index.ts)
## 使用
1. 基础使用

```ts
//使用全局管理器
const mgr = new ObjPoolMgr();
//实现对象池接口
class ClassA implements objPool.IObj{
    onGet(){

    }
    onFree(){

    }
    onKill(){

    }
}
mgr.createObjPool({sign:"test1",clas:ClassA});
const ins1 = mgr.get("test1");

//注入通用对象处理函数
//这样对于没有实现IObj接口的对象也可以
const objPool = new BaseObjPool();

objPool.init(
    {
        sign: "pool1",
        objHandler: {
            onGet(obj: objPool.IObj, onGetData: any) {

            },
            onCreate(obj): void {

            },
            onFree(obj): void {

            },
            onKill(obj): void {

            }

        }
    }
)
```
2. 提示更加智能
```ts
interface ITestObjKeyType {
    TestObj1: "TestObj1",
    TestObj2: "TestObj2",
    TestObj3: "TestObj3"
}
interface ITestObjGetDataMap {
    TestObj1: { num: number },
    TestObj2: { name: string },
    TestObj3: { name: string }
}
const poolMgr = new ObjPoolMgr<ITestObjKeyType, ITestObjGetDataMap>();
poolMgr.createByClass("TestObj1", TestObj1);
poolMgr.createByFunc("TestObj2", () => {
    return new TestObj2();
});
poolMgr.preCreate("TestObj1", 5);
//get 这里get可以获得对应"TestObj1"的传参类型提示
const testObj1: TestObj1 = poolMgr.get("TestObj1", { num: 2 });

//批量获取
const testObj2s: TestObj2[] = poolMgr.getMore("TestObj2", { name: "testObj2" }, 4);

```
3. 阈值控制
```ts
const objPool = new BaseObjPool();

objPool.init(
    {
        sign: "pool1",
        objHandler: {
            onGet(obj: objPool.IObj, onGetData: any) {

            },
            onCreate(obj): void {

            },
            onFree(obj): void {

            },
            onKill(obj): void {

            }

        },
        //阈值
        threshold: 100
    }
)
//回收对象，如果对象池里的数量大于等于100，则这个obj就会被kill掉（销毁）;
objPool.free(obj);

```

## [CHANGELOG](packages/obj-pool/CHANGELOG.md)

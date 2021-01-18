## 介绍
   
display-ctrl是一个基于TypeScript的零依赖、跨引擎、高效、灵活、高可扩展的显示控制库(UI框架库)

您可以根据项目，以及项目所使用的引擎，定制资源处理和控制器基类。

合理的抽象底层，让您可以继承管理器基类，使用基类接口就可以简单扩展出符合自身需求的接口。

同时这个库使用了TypeScript的高阶的类型推断，给您带来极度舒适的接口调用体验。

这个库无任何依赖，可单独使用。

在仓库中同时提供了基于CocosCreator2.4.2和CocosCreator3D实现的库(包含layer层级管理库的实现)
1. [dpctrl-ccc](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/dpctrl-ccc)
2. [dpctrl-c3d](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/dpctrl-c3d)

github:[EasyGameFramework](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/display-ctrl) 
## 特性
* 跨引擎，适用于任何适用ts/js的游戏/应用项目
* 基于TypeScript，使用高阶类型编程，提供极度舒适的类型提示
* 高可扩展
* 高可定制
* 零依赖，可单独使用
## 如何使用？
### 安装
1. 通过npm安装
	
    	npm i @ailhc/display-ctrl   
2. 本地link npm包
	
    a. clone 项目仓库
    
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
    b. 在packages/display-ctrl文件夹下 
    
    	npm link
    
    c. 在项目游戏项目目录下 
    	
        npm link @ailhc/display-ctrl    
3. 使用源码
	
    a. clone 项目仓库
    
        git clone https://github.com/AILHC/EasyGameFrameworkOpen
    b. 直接复制packages/display-ctrl/src下的ts源码到项目文件夹下使用
### 定制一下
#### 实现引擎层
> 不同的引擎或者项目都需要做点相应的实现，很简单的

1. 控制器基类实现
```ts
import { } from "@ailhc/display-ctrl";
export class NodeCtrl implements displayCtrl.ICtrl<cc.Node> {
    key?: string | any;

    isLoading?: boolean;
    isLoaded?: boolean;
    isInited?: boolean;
    isShowed?: boolean;
    needShow?: boolean;
    needLoad?: boolean;
    isShowing?: boolean;
    visible: boolean;
    onLoadData: any;
    protected node: cc.Node;
    protected _mgr: displayCtrl.IMgr;
    constructor(dpcMgr?: displayCtrl.IMgr) {
        this._mgr = dpcMgr;
    }


    onInit(config?: displayCtrl.IInitConfig<any, any>): void {

    }
    onShow(config?: displayCtrl.IShowConfig<any, any, any>): void {
        if (this.node) {
            this.node.active = true;
        }
    }
    getRess(): any[] | string[] {
        return undefined;
    }
    getNode(): cc.Node {
        return this.node;
    }
    onUpdate(updateData: any): void {
    }
    getFace<T = any>(): T {
        return this as any;
    }
    onDestroy(destroyRes?: boolean): void {
        if (this.node) {
            this.node.destroy();
        }
    }

    onHide() {
        if (this.node) {
            this.node.active = false;
        }
    }
    forceHide() {
        this.node && (this.node.active = false);
        this.isShowed = false;
    }
    onResize() {
    }
}
```
我已经提供了两个CocosCreator版本的实现参考
* CocosCreator3d的实现[dpctrl-c3d](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/dpctrl-c3d)
* CocosCreator2.4.2的实现[dpctrl-ccc](https://github.com/AILHC/EasyGameFrameworkOpen/tree/main/packages/dpctrl-ccc)
可以直接安装(同上)

2. 资源处理接口定制
每个项目都有自己的资源处理需求，所以这部分逻辑解耦出来，让使用者注入资源处理器。
```ts
//egf-ccc-full DpcTestMainComp.ts
const dpcMgr = new DpcMgr<IDpcTestViewKeyMap, any, IDpcTestViewShowDataMap>();

        dpcMgr.init(
            {
                loadRes: (config) => {
                    const onLoadData: IDpcTestOnLoadData = config.onLoadData;
                    onLoadData?.showLoading && dtM.uiMgr.showDpc("LoadingView");
                    cc.assetManager.loadAny(config.ress,
                        { bundle: "resources" },
                        (finish, total) => {
                            console.log(`${config.key}加载中:${finish}/${total}`);
                            onLoadData?.showLoading && dtM.uiMgr.updateDpc("LoadingView", { finished: finish, total: total })
                        },
                        (err, items) => {
                            if (err) {
                                console.error(`加载失败`, err);
                                config.error && config.error();
                            } else {
                                config.complete && config.complete();
                            }
                            onLoadData?.showLoading && dtM.uiMgr.hideDpc("LoadingView");
                        })
                },
                releaseRes: (ctrlIns) => {
                    const ress = ctrlIns.getRess();
                    if (ress && ress.length) {
                        let asset: cc.Asset;
                        ress.forEach((res: { path: string }) => {
                            asset = cc.resources.get(res.path);
                            if (asset) {
                                cc.assetManager.releaseAsset(asset);
                            }
                        });

                    }
                }

            }
        )
```

#### 开始使用

**基础使用（以CocosCreator2.4.2为例):创建一个普通的界面**
* 创建一个简单的界面的prefab
在测试场景，新建一个node节点，放点图片，spine动画什么的。

然后拖到resources/display-ctrl-test-views下

删掉场景中的界面节点
* 新建一个界面控制器代码文件
```ts
// DepResView.ts
// 增加界面key声明，为了调用显示接口时有类型提示
declare global {
    interface IDpcTestViewKeyMap {
        DepResView: "DepResView"
    }
}
export class DepResView extends NodeCtrl {
    static typeKey = "DepResView";
    private static _ress: { path: string, type: any }[];
    //界面prefab资源路径
    public static prefabUrl = "display-ctrl-test-views/DepResView";
    onLoadData: IDpcTestOnLoadData = { showLoading: true };
    //实现getRess接口返回依赖资源数组
    getRess() {
        if (!DepResView._ress) {
            DepResView._ress = [
                { path: DepResView.prefabUrl, type: cc.Prefab },
                { path: "test-txts/txt1", type: cc.TextAsset }
            ]
        }
        return DepResView._ress;
    }
    //实现onInit接口，实例化显示节点
    onInit() {
        super.onInit()
        this.node = getPrefabNodeByPath(DepResView.prefabUrl);
        this.node.getChildByName("close-icon").on(cc.Node.EventType.MOUSE_DOWN, () => {
            dtM.uiMgr.hideDpc(this.key);
        })

    }
    //实现onShow接口，添加显示节点到Canvas(最好是使用层级管理，比如我框架提供的layer层级管理库)
    onShow(config: displayCtrl.IShowConfig) {
        super.onShow(config);
        const canvas =  cc.director.getScene().getChildByName("Canvas");
        canvas.addChild(this.node);
    }
    onHide() {
        super.onHide();
    }
}
```

**来一串基本操作:调用管理器接口**
1. 显示
```ts
//简单调用显示
dtM.uiMgr.showDpc("DepResView");//打出双引号就有类型提示了
//传数据调用显示

dtM.uiMgr.showDpc("MutiInsView",onShowData);//打出双引号就有类型提示了
```
所传数据也有类型提示，需要在任意地方声明（最好是在对应的控制器代码文件中声明）
这里以MutiInsView为例，具体可见: 
[examples\egf-ccc-full\assets\tests\display-ctrl\view-ctrls\MutiInsView.ts](https://github.com/AILHC/EasyGameFrameworkOpen/blob/main/examples/egf-ccc-full/assets/tests/display-ctrl/view-ctrls/MutiInsView.ts)
```ts
declare global {
    interface IDpcTestViewKeyMap {
        MutiInsView: "MutiInsView"
    }
    interface IDpcTestViewShowDataMap {
        MutiInsView: { preStr: string, clickCount: number };
    }
}
```
2. 更新
当业务需要使用数据让指定界面更新渲染时调用,以加载界面为例
```ts
//开始加载
dtM.uiMgr.updateDpc("LoadingView", { finished: 0, total: 1 });
//加载结束
dtM.uiMgr.updateDpc("LoadingView", { finished: 1, total: 1 });

```
这个更新所传的数据也可以有类型提示,详情可见:[examples\egf-ccc-full\assets\tests\display-ctrl\view-ctrls\MutiInsView.ts](https://github.com/AILHC/EasyGameFrameworkOpen/blob/main/examples/egf-ccc-full/assets/tests/display-ctrl/view-ctrls/LoadingView.ts)
```ts
declare global {
    interface IDpcTestViewKeyMap {
        LoadingView: "LoadingView"
    }
    interface IDpcTestUpdateDataMap {
        LoadingView: { finished: number, total: number }
    }
}
```

2. 隐藏
```ts
dtM.uiMgr.hideDpc("DepResView");//打出双引号就有类型提示了
```
3. 销毁
```ts
dtM.uiMgr.destroyDpc(dtM.uiMgr.keys.DepResView, true);//第二个参数可以选择是否销毁资源
```

**自定义资源处理显示控制器**

在业务开发中，可能有些界面的资源处理逻辑特殊，需要自定义，框架提供了自定义资源处理的接口
1. 创建一个自定义资源处理显示控制器

```ts
//需要继承displayCtrl.IResHandler,管理器会调用控制器实现的这个接口而不是通用处理器的接口
export class CustomResHandleView extends NodeCtrl implements displayCtrl.IResHandler {
    static typeKey = "CustomResHandleView";
    private static _ress: string[];
    private static _monsterNames = ["BuleMonster", "GreenMonster", "PurpleMonster", "RedMonster", "YellowMonster"];
    private static _monsterIconDir = "monster_icon";
    private static prefabUrl: string = "display-ctrl-test-views/CustomResHandleView";
    private _monsterIconRess: { path: string, type: any }[];
    //自定义资源加载
    loadRes(config: displayCtrl.IResLoadConfig): void {
        dtM.uiMgr.showDpc({
            typeKey: dtM.uiMgr.keys.LoadingView,
            showedCb: () => {
                const randomMonsterNameIndexs = getSomeRandomInt(0, CustomResHandleView._monsterNames.length - 1, 2);
                const ress = [];
                this._monsterIconRess = ress;
                randomMonsterNameIndexs.forEach(element => {
                    ress.push({ path: CustomResHandleView._monsterIconDir + "/" + CustomResHandleView._monsterNames[element], type: cc.SpriteFrame });
                });
                ress.push({ path: CustomResHandleView.prefabUrl, type: cc.Prefab });
                ress.push({ path: "test-txts/txt1", type: cc.TextAsset });
                cc.assetManager.loadAny(ress, { bundle: "resources" }, (finished: number, total: number, item) => {
                    dtM.uiMgr.updateDpc(dtM.uiMgr.keys.LoadingView,
                        {
                            finished: finished, total: total
                        })
                }, (err, data) => {
                    if (err) {
                        config.error();
                    } else {
                        config.complete();
                    }
                    dtM.uiMgr.hideDpc("LoadingView");
                });
            }
        })
    }
    //自定义资源释放
    releaseRes(): void {
        cc.assetManager.releaseAsset(cc.resources.get(CustomResHandleView.prefabUrl));
    }
    //省略代码
}
```
            
**管理器的其他接口**

具体的接口声明可以看:[dp-ctrl-interfaces.ts](https://github.com/AILHC/EasyGameFrameworkOpen/blob/main/packages/display-ctrl/src/dp-ctrl-interfaces.ts) 中的IMgr
* 获取依赖资源,可用于获取多个控制器依赖的资源，批量预加载
* 获取单例控制器实例
* 预加载指定控制器
* 创建控制器实例
等等
## 其他可能性
  其实游戏主角也可以是显示控制器实例
  
  通过IShowConfig定制更多可能性，比如页面显示动画播放完回调
  
  利用管理器的基础接口扩展出管理栈式UI的逻辑

### 我在哪？

**游戏开发之路有趣但不易,**

**玩起来才能一直热情洋溢。**

关注我, 一起玩转游戏开发！

你的关注是我持续更新的动力~

让我们在这游戏开发的道路上并肩前行

在以下这些渠道可以找到我和我的创作:

公众号搜索:玩转游戏开发

或扫码:<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/abd0c14c9c954e56af20adb71fa00da9~tplv-k3u1fbpfcp-zoom-1.image" alt="img" style="zoom:50%;" />



一起讨论技术的 QQ 群: 1103157878



博客主页: https://pgd.vercel.app/

掘金: https://juejin.cn/user/3069492195769469

github: https://github.com/AILHC
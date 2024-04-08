import { isArr } from "assets/src/framework/tools/TypeUtil";
import { __private } from "cc";
import { Constructor } from "cc";
import { Asset, AssetManager, assetManager, director, SceneAsset } from "cc";
declare module "cc" {
    interface Asset {
        $resUrl?: string;
    }
}
declare global {
    interface IModuleMap {
        resMgr?: IResMgr
    }
    type ProgressCb = (finished: number, total: number) => void;
    type CompleteCb<T> = (err: Error | null, data?: T) => void;

    interface IResMgr {
        /**
         * init
         * 初始化
         */
        init (): void;
        /**
         * 判断是否加载
         * @param path 
         */
        isLoaded (path: string | string[]): boolean;
        /**
         * 获取资源,并自动引用
         * @param path <bundleName>/相对bundle内的路径,可以是数组
         * @param autoRef 是否自动引用,默认:是
         */
        get<T extends Asset> (path: string, autoRef?: boolean, type?: Constructor<T>): T;
        get<T extends Asset> (path: string[], autoRef?: boolean, type?: Constructor<T>): T[];
        /**
         * 加载资源
         * @param pathOrUrl 路径 <bundleName>/相对bundle内的路径
         * @param onProgress  
         * @param autoRef 是否自动引用，默认:否
         */
        load<T extends Asset> (pathOrUrl: string, onProgress?: ProgressCb, autoRef?: boolean, type?: Constructor<T>): Promise<T>;
        load<T extends Asset> (pathOrUrl: string[], onProgress?: ProgressCb, autoRef?: boolean): Promise<T[]>;
        /**
         * 加载文件夹资源
         * @param path <bundleName>/相对bundle内的路径
         * @param onProgress 
         */
        loadDir<T extends Asset> (path: string, onProgress?: ProgressCb): Promise<T[]>
        /**
         * 加载场景
         * @param path 路径 <bundleName>/相对bundle内的路径
         * @param autoActivate 激活
         */
        loadScene (path: string, autoActivate?: boolean): Promise<SceneAsset>;
        /**
         * 预加载资源,还需要load来完成加载
         * @param paths 路径 或 路径数组 <bundleName>/相对bundle内的路径
         * @param onProgress 进度回调 
         */
        preload (paths: string | string[], onProgress?: ProgressCb): Promise<boolean>
        /**
         * 预加载场景
         * @param path <bundleName>/相对bundle内的路径
         */
        preloadScene (path: string): Promise<boolean>
        /**
         * 释放资源
         * @param asset 
         * @param force 
         */
        release (asset: Asset, force?: boolean): void
        /**
         * 批量释放资源
         * @param ress 
         * @param force
         * @param type 类型 
         */
        releaseRess<T extends Asset> (ress: string[], force?: boolean, type?: Constructor<T>): void
    }
}

export class ResMgr implements IModule, IResMgr {

    $key = "resMgr";
    init (): void {

    }
    isLoaded (path: string | string[]) {
        if(typeof path == "string") {
            return !!this._getResInternal(path);
        } else {
            let isLoaded = true;
            for(let index = 0; index < path.length; index++) {
                const element = path[index];
                if(!this._getResInternal(element)) {
                    //TODO 可能下一帧才销毁
                    isLoaded = false;
                    return isLoaded;
                }

            }
        }

    }
    get<T extends Asset> (path: string, autoRef?: boolean, type?: Constructor<T>): T;
    get<T extends Asset> (path: string[], autoRef?: boolean, type?: Constructor<T>): T[];
    get<T extends Asset> (path: string | string[], autoRef: boolean = true, type?: Constructor<T>): T | T[] {
        let asset: Asset;
        if(typeof path == "string") {
            asset = this._getResInternal(path, type);
            autoRef && asset?.addRef();//引用

            return asset as T;
        } else {
            const assets: T[] = [];
            for(const onePath of path) {
                asset = this._getResInternal(onePath);
                assets.push(asset as T);
                autoRef && asset?.addRef();
            }
        }
    }
    load<T extends Asset> (pathOrUrl: string, onProgress?: ProgressCb, autoRef?: boolean, type?: Constructor<T>): Promise<T>;
    load<T extends Asset> (pathOrUrl: string[], onProgress?: ProgressCb, autoRef?: boolean): Promise<T[]>;
    load<T extends Asset> (pathOrUrl: string | string[], onProgress?: ProgressCb, autoRef?: boolean, type?: Constructor<T>): Promise<T | T[]> {
        return new Promise((res, rej) => {

            if(typeof pathOrUrl === "string" || (isArr(pathOrUrl) && pathOrUrl.length == 1)) {
                const path = typeof pathOrUrl === "string" ? pathOrUrl : pathOrUrl[0]
                this._loadInternal(path, (err, asset) => {
                    onProgress?.(1, 1);
                    if(err) {
                        rej(err);
                    } else {
                        autoRef && (asset as Asset).addRef();//引用
                        res(asset as T);
                    }
                }, type);
            } else if(isArr(pathOrUrl) && pathOrUrl.length > 1) {
                const totalCount = pathOrUrl.length;
                let loadedCount = 0;
                let successCount = 0;
                let errors: Error[];
                const assets: T[] = [];
                const onLoadComplete: CompleteCb<Asset> = (err, asset) => {
                    if(err) {
                        if(!errors) errors = [];
                        errors.push(err);
                    }
                    if(asset) {
                        successCount++;
                        autoRef && asset.addRef();//引用
                        assets.push(asset as T);
                        onProgress?.(successCount, totalCount);
                    }

                    loadedCount++;
                    if(loadedCount >= totalCount) {
                        if(errors) {
                            rej(errors);
                        } else {
                            res(assets);
                        }
                    }
                };
                for(const path of pathOrUrl) {
                    this._loadInternal(path, onLoadComplete);
                }
            } else {
                res([]);
            }


        });

    }
    loadDir<T extends Asset> (path: string, onProgress?: ProgressCb): Promise<T[]> {
        return new Promise((res, rej) => {
            const { reason, bundleName } = this._getBundleName(path);
            if(reason) {
                rej(reason);
                return;
            }
            this._loadBundle(bundleName)
                .then((bundle) => {
                    const resPath = path.slice(bundleName.length + 1);
                    bundle.loadDir(resPath.replace("/.", ""), null, (err, assets) => {
                        if(!err) {
                            assets.forEach((value) => { value.addRef() });
                            res(assets as T[]);
                        } else {
                            rej(err);
                        }

                    });

                })
                .catch((reason) => {
                    rej(reason);
                });
        });


    }
    private _loadInternal<T extends Asset> (pathOrUrl: string, onComplete: CompleteCb<T | T[]>, type?: Constructor<T>) {
        //判断是否远程资源
        if(pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
            assetManager.loadRemote(pathOrUrl, null, (err, asset) => {
                if(!err) {

                    asset.$resUrl = pathOrUrl;
                }
                onComplete(err, asset as T);
            });
        } else {
            const { reason, bundleName } = this._getBundleName(pathOrUrl);
            if(reason) {
                onComplete(reason);
                return;
            }

            this._loadBundle(bundleName)
                .then((bundle) => {
                    const resPath = pathOrUrl.slice(bundleName.length + 1);
                    bundle.load(resPath, type as any, null, (err, asset) => {
                        if(!err) {
                            asset.$resUrl = pathOrUrl;
                        }
                        onComplete(err, asset as T);
                    });
                })
                .catch((reason) => {
                    onComplete(reason);
                });
        }
    }

    loadScene (path: string, autoActivate?: boolean): Promise<SceneAsset> {

        return new Promise((res, rej) => {
            const { reason, bundleName } = this._getBundleName(path);
            if(reason) {
                rej(reason);
                return;
            }
            this._loadBundle(bundleName)
                .then((bundle) => {
                    const resPath = path.slice(bundleName.length + 1);
                    bundle.load(resPath, (err, asset) => {
                        if(!err) {
                            if(autoActivate) director.runScene(asset as SceneAsset);
                            res(asset as SceneAsset);

                        } else {
                            rej(err);
                        }
                    });
                })
                .catch(rej);
        });
    }
    preload (paths: string | string[], onProgress?: ProgressCb): Promise<boolean> {
        return new Promise((res, rej) => {
            const { reason, bundleNames } = this._getBundleNames(paths);
            if(reason) {

                rej(reason);
                return;
            }
            let errors: any[];
            let finishCount = 0;
            const totalLoadCount = paths.length;
            const onLoaded = (err) => {
                finishCount++;
                if(err) {
                    if(!errors) errors = [];
                    errors.push(err)
                } else {
                    onProgress?.(finishCount, totalLoadCount);
                }


                if(finishCount >= totalLoadCount) {
                    if(errors) {
                        rej(errors);
                        return;
                    }
                    res(true);
                }
            }
            let bundleName: string;
            let path: string;
            for(let i = 0; i < totalLoadCount; i++) {
                bundleName = bundleNames[i];
                path = paths[i];
                this._loadBundle(bundleName)
                    .then((bundle) => {
                        const resPath = path.slice(bundleName.length + 1);
                        bundle.preload(resPath, onLoaded);

                    })
                    .catch(onLoaded)
            }
        });

    }
    preloadScene (path: string): Promise<boolean> {
        return new Promise((res, rej) => {
            const { reason, bundleName } = this._getBundleName(path);
            if(reason) {
                rej(reason);
                return;
            }

            this._loadBundle(bundleName)
                .then((bundle) => {
                    const resPath = path.slice(bundleName.length + 1);
                    bundle.preloadScene(resPath, (err) => {
                        if(err) { rej(err); return; }
                        res(true);
                    });
                })
                .catch(rej)

        })
    }
    release (asset: Asset, force: boolean = false) {
        if(force) {
            assetManager.releaseAsset(asset);
        } else {
            asset.decRef();
        }
    }
    releaseRess<T extends Asset> (ress: string[], force: boolean, type?: Constructor<T>) {
        ress && ress.forEach((res) => {
            const asset = this._getResInternal(res, type);
            if(!asset) return;
            if(force) {
                assetManager.releaseAsset(asset);
            } else {
                asset.decRef();
            }
        })
    }
    private _getResInternal (path: string, type?: Constructor<Asset>): Asset {
        const { reason, bundleName } = this._getBundleName(path);
        if(reason) return;
        const bundle = assetManager.getBundle(bundleName);
        if(!bundle) return;
        const resPath = path.slice(bundleName.length + 1);
        const asset = bundle.get(resPath, type);

        return asset;
    }
    private _getBundleName (path: string): { reason: any, bundleName: string } {

        const strs = path.split("/");
        let reason = undefined;

        if(strs.length < 2) {
            reason = `[ResMgr]: pathOrUrl is error:${path}`;
        }
        const bundleName = strs[0];
        if(bundleName.trim() === "") {
            reason = `[ResMgr]: bundleName is empty${path}`;
        }
        return { reason, bundleName };
    }
    private _getBundleNames (paths: string | string[]): { reason: any, bundleNames: string[] } {
        if(typeof paths === "string") {
            paths = [paths];
        }
        let bundleNames: string[] = [];
        let reason = undefined;
        let strs: string[];
        for(let path of paths) {
            strs = path.split("/");

            if(strs.length < 2) {
                reason = `[ResMgr]: pathOrUrl is error${path}`;
                bundleNames = undefined;
                break;
            }
            const bundleName = strs[0];

            if(bundleName.trim() === "") {
                reason = `[ResMgr]: bundleName is empty${path}`;
                bundleNames = undefined;
                break;
            } else {
                bundleNames.push(bundleName);
            }
        }

        return { reason, bundleNames };
    }
    private _loadBundle (bundleNameOrUrl: string): Promise<AssetManager.Bundle> {
        return new Promise((res, rej) => {
            const bundle = assetManager.getBundle(bundleNameOrUrl);
            if(bundle) {
                res(bundle);
                return;
            }
            this._loadBundleAndDeps(bundleNameOrUrl, (err, bundle) => {
                if(!err) {
                    res(bundle);
                } else {
                    rej(err);
                }
            });
        })
    }
    private _loadBundleAndDeps (bundleNameOrUrl: string, onComplete: (err: Error, bundle?: AssetManager.Bundle) => void) {

        assetManager.loadBundle(bundleNameOrUrl, null, (err, bundle) => {
            if(!err) {
                const depBundleNames = bundle.deps;
                if(depBundleNames.length === 0) {
                    onComplete(err, bundle);
                } else {
                    let loadedDepCount = 0;
                    const loadDepComplete = (depLoadErr: Error, depBundle: AssetManager.Bundle) => {
                        if(!depLoadErr) {
                            loadedDepCount++;
                        } else {
                            onComplete(err);
                        }
                        if(loadedDepCount >= depBundleNames.length) {
                            onComplete(undefined, bundle);
                        }

                    };
                    for(const depBundleName of depBundleNames) {
                        this._loadBundleAndDeps(depBundleName, loadDepComplete);
                    }
                }
            } else {
                onComplete(err);
            }

        });
    }
    public printResRef (includeBundleNames?: string[], ignoreInternal = true) {
        const bundles = assetManager.bundles;
        console.group("【资源引用】");
        let refInfos: { path: string, type: string, refCount: number }[] = [] as any;
        bundles.forEach((bundle) => {
            if(includeBundleNames && !includeBundleNames.includes(bundle.name)) return;
            if(ignoreInternal && bundle.name === "internal") return;
            let resCache: AssetManager.Cache = bundle["_config"]["paths"];
            let resPath: string;
            let res: Asset;
            resCache.forEach((infos: __private._cocos_asset_asset_manager_config__IAddressableInfo[], key) => {
                infos.forEach((info) => {

                    res = bundle.get(info.path, info.ctor);
                    if(res) {
                        resPath = `${bundle.name}/${info.path}`;
                        refInfos.push({ path: resPath, type: info.ctor.name, refCount: res.refCount });
                    }

                })
            })
        });
        console.table(refInfos);
        console.groupEnd();
    }

}
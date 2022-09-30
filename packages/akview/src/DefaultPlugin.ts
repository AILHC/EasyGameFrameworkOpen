import { DefaultEventBus } from "./DefaultEventBus";
import { DefaultTemplateHandler } from "./DefaultTemplateHandler";
import { DefaultViewAgent } from "./DefaultViewAgent";
import { LRU2QCacheHandler } from "./LRU2QCacheHandler";

declare global {
    interface IAkViewDefaultPluginOption {
        /**
         * 默认模板处理配置
         */
        tplHandlerOption?: IAkViewDefaultTplHandlerOption;
        /**
         * 默认缓存处理配置
         */
        cacheHandlerOption?: akView.ILRU2QCacheHandlerOption;
    }
}
export class DefaultPlugin implements akView.IPlugin {
    viewMgr: akView.IMgr;
    onUse(opt: IAkViewDefaultPluginOption) {
        opt = opt || {};
        this.viewMgr["_tplHandler"] = new DefaultTemplateHandler(opt.tplHandlerOption);
        this.viewMgr["_eventBus"] = new DefaultEventBus();
        this.viewMgr.cacheHandler = new LRU2QCacheHandler(opt.cacheHandlerOption);
        this.viewMgr.registViewAgentClass("Default", DefaultViewAgent);
    }
}

import { DefaultEventBus } from "./default-event-bus";
import { DefaultTemplateHandler } from "./default-template-handler";
import { DefaultViewAgent } from "./default-view-agent";
import { LRU2QCacheHandler } from "./lru2q-cache-handler";

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
        this.viewMgr["_cacheHandler"] = new LRU2QCacheHandler(opt.cacheHandlerOption);
        this.viewMgr.registViewAgentClass("Default", DefaultViewAgent);
    }
}

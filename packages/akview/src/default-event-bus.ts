export class DefaultEventBus implements akView.IEventBus {
    viewMgr: akView.IMgr;
    handleMethodMap: Map<String | string, akView.ICallableFunction[]> = new Map();
    onRegist(): void {}
    on(eventKey: AkViewEventKeyType | String, method: Function, caller?: any, args?: any[], offBefore?: boolean): void {
        let methods = this.handleMethodMap.get(eventKey);
        if (!methods) {
            methods = [];
            this.handleMethodMap.set(eventKey, methods);
        }
        if (!method) return;
        let callableFunction: akView.ICallableFunction;
        if (typeof method === "object") {
            callableFunction = method;
        } else {
            callableFunction = {
                method: method,
                caller: caller,
                args: args
            };
        }
        if (offBefore) {
            this.off(eventKey, callableFunction.method, callableFunction.caller);
        }
        methods.push(callableFunction);
    }
    once(eventKey: AkViewEventKeyType | String, method: Function, caller?: any, args?: any[]): void {
        const callableFunction: akView.ICallableFunction = {
            method: method,
            caller: caller,
            args: args,
            once: true
        };

        this.on(eventKey, callableFunction as any, null, null, true);
    }
    off(eventKey: AkViewEventKeyType | String, method: Function, caller?: any): void {
        let callableFuncs = this.handleMethodMap.get(eventKey);
        if (callableFuncs) {
            let cfunc: akView.ICallableFunction;
            for (let i = callableFuncs.length - 1; i >= 0; i--) {
                cfunc = callableFuncs[i];
                if (cfunc.method === method && cfunc.caller === caller) {
                    callableFuncs[i] = callableFuncs[callableFuncs.length - 1];
                    callableFuncs.pop();
                }
            }
        }
    }
    emit<EventDataType = any>(eventKey: AkViewEventKeyType | String, eventData?: EventDataType): void {
        let methods = this.handleMethodMap.get(eventKey);
        if (methods) {
            let cfunc: akView.ICallableFunction;
            for (let i = methods.length - 1; i >= 0; i--) {
                cfunc = methods[i];
                if (cfunc.once) {
                    methods[i] = methods[methods.length - 1];
                    methods.pop();
                }
                cfunc.method.call(cfunc.caller, cfunc.args, eventData);
            }
        }
    }
    /**
     * 监听
     * @param viewId
     * @param eventKey
     * @param method
     */
    onViewEvent(
        viewId: string,
        eventKey: AkViewEventKeyType | String,
        method: Function,
        caller?: any,
        args?: any[]
    ): void {
        const idKey = this.getIdEventKey(viewId, eventKey);
        this.on(idKey, method, caller, args);
    }
    /**
     * 监听一次，执行完后取消监听
     * @param viewId
     * @param eventKey
     * @param method
     */
    onceViewEvent(
        viewId: string,
        eventKey: AkViewEventKeyType | String,
        method: Function,
        caller?: any,
        args?: any[]
    ): void {
        const idKey = this.getIdEventKey(viewId, eventKey);
        this.once(idKey, method, caller, args);
    }
    /**
     * 取消监听
     * @param viewId
     * @param eventKey
     * @param method
     */
    offViewEvent(viewId: string, eventKey: AkViewEventKeyType | String, method: Function, caller?: any): void {
        const idKey = this.getIdEventKey(viewId, eventKey);
        this.off(idKey, method, caller);
    }
    /**
     * 触发事件
     * @param viewId
     * @param eventKey
     * @param eventData 事件数据，作为回调参数中的最后的传入，比如method.apply(method._caller,method._args,eventData);
     */
    emitViewEvent<EventDataType extends any = any>(
        viewId: string,
        eventKey: AkViewEventKeyType | String,
        eventData?: EventDataType
    ): void {
        const idKey = this.getIdEventKey(viewId, eventKey);
        if (eventData) {
            !(eventData as IAkViewEventData).viewId && ((eventData as IAkViewEventData).viewId = viewId);
        }

        this.emit(idKey, eventData);

        // this.emit(eventKey, Object.assign({ viewId: viewId }, eventData));
        this.emit(eventKey, eventData);
    }
    protected getIdEventKey(viewId: string, eventKey: any) {
        return viewId + "_*_" + eventKey;
    }
}

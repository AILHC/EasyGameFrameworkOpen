export class DefaultEventBus implements akView.IEventBus {
    viewMgr: akView.IMgr;
    handleMethodMap: Map<String | string, akView.ICallableFunction[]> = new Map();
    onRegist(): void {}
    onAkEvent<EventDataType extends unknown = IAkViewEventData>(
        eventKey: String | keyof IAkViewEventKeys,
        method: akView.EventCallBack<EventDataType>,
        caller?: any,
        args?: any[],
        offBefore?: boolean
    ): void {
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
            this.offAkEvent(eventKey, callableFunction.method, callableFunction.caller);
        }
        methods.push(callableFunction);
    }
    onceAkEvent<EventDataType extends unknown = IAkViewEventData>(
        eventKey: String | keyof IAkViewEventKeys,
        method: akView.EventCallBack<EventDataType>,
        caller?: any,
        args?: any[]
    ): void {
        const callableFunction: akView.ICallableFunction = {
            method: method,
            caller: caller,
            args: args,
            once: true
        };

        this.onAkEvent(eventKey, callableFunction as any, null, null, true);
    }
    offAkEvent(eventKey: AkViewEventKeyType | String, method: Function, caller?: any): void {
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
    emitAkEvent<EventDataType = any>(eventKey: AkViewEventKeyType | String, eventData?: EventDataType): void {
        let methods = this.handleMethodMap.get(eventKey);
        if (methods) {
            let cfunc: akView.ICallableFunction;
            for (let i = methods.length - 1; i >= 0; i--) {
                cfunc = methods[i];
                if (cfunc.once) {
                    methods[i] = methods[methods.length - 1];
                    methods.pop();
                }
                cfunc.method.call(cfunc.caller, eventData, cfunc.args);
            }
        }
    }
    onAkViewEvent<EventDataType extends unknown = IAkViewEventData>(
        viewId: string,
        eventKey: String | keyof IAkViewEventKeys,
        method: akView.EventCallBack<EventDataType>,
        caller?: any,
        args?: any[],
        offBefore?: boolean
    ): void {
        const idKey = this.getIdEventKey(viewId, eventKey);
        this.onAkEvent(idKey, method, caller, args);
    }
    onceAkViewEvent<EventDataType extends unknown = IAkViewEventData>(
        viewId: string,
        eventKey: String | keyof IAkViewEventKeys,
        method: akView.EventCallBack<EventDataType>,
        caller?: any,
        args?: any[]
    ): void {
        const idKey = this.getIdEventKey(viewId, eventKey);
        this.onceAkEvent(idKey, method, caller, args);
    }

    offAkViewEvent(viewId: string, eventKey: AkViewEventKeyType | String, method: Function, caller?: any): void {
        const idKey = this.getIdEventKey(viewId, eventKey);
        this.offAkEvent(idKey, method, caller);
    }

    emitAkViewEvent<EventDataType extends any = any>(
        viewId: string,
        eventKey: AkViewEventKeyType | String,
        eventData?: EventDataType
    ): void {
        const idKey = this.getIdEventKey(viewId, eventKey);
        if (eventData) {
            !(eventData as IAkViewEventData).viewId && ((eventData as IAkViewEventData).viewId = viewId);
        }

        this.emitAkEvent(idKey, eventData);

        // this.emit(eventKey, Object.assign({ viewId: viewId }, eventData));
        this.emitAkEvent(eventKey, eventData);
    }
    protected getIdEventKey(viewId: string, eventKey: any) {
        return viewId + "_*_" + eventKey;
    }
}

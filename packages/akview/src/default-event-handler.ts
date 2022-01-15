export class DefaultEventHandler implements akView.IEventHandler {
    viewMgr: akView.IMgr;
    handleMethodMap: Map<string, akView.ICallableFunction[]> = new Map();
    onRegist(): void {}
    on(viewId: string, eventKey: String | keyof akView.IViewEventKeys, method: akView.ICallableFunction): void {
        let idEventKey = this.getIdEventKey(viewId, eventKey);
        let methods = this.handleMethodMap.get(idEventKey);
        if (!methods) {
            methods = [];
            this.handleMethodMap.set(idEventKey, methods);
        }
        methods.push(method);
    }
    once(viewId: string, eventKey: String | keyof akView.IViewEventKeys, method: akView.ICallableFunction): void {
        method["__once"] = true;
        this.on.apply(this, arguments);
    }
    off(viewId: string, eventKey: String | keyof akView.IViewEventKeys, method: akView.ICallableFunction): void {
        let idEventKey = this.getIdEventKey(viewId, eventKey);
        let methods = this.handleMethodMap.get(idEventKey);
        if (methods) {
            let mt: akView.ICallableFunction;
            for (let i = methods.length - 1; i >= 0; i--) {
                mt = methods[i];
                if (mt === method && mt._caller === method._caller) {
                    methods[i] = methods[methods.length - 1];
                    methods.pop();
                }
            }
        }
    }
    emit<EventDataType = any>(
        viewId: string,
        eventKey: String | keyof akView.IViewEventKeys,
        eventData?: EventDataType
    ): void {
        const idEventKey = this.getIdEventKey(viewId, eventKey);
        let methods = this.handleMethodMap.get(idEventKey);
        if (methods) {
            let mt: akView.ICallableFunction;
            for (let i = methods.length - 1; i >= 0; i--) {
                mt = methods[i];
                if (mt["__once"]) {
                    methods[i] = methods[methods.length - 1];
                    methods.pop();
                }
                mt.call(mt._caller, mt._args, eventData);
            }
        }
    }
    protected getIdEventKey(viewId: string, eventKey: any) {
        return viewId + "_*_" + eventKey;
    }
}

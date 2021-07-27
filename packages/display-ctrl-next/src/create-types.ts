export const CreateTypes: displayCtrl.ICreateTypes = new Proxy({} as any, {
    get(target, key) {
        return key;
    }
});

export abstract class SubModule<
    T extends ISubModuleState = ISubModuleState,
    P extends ISubModuleProvider = ISubModuleProvider
> implements ISubModule<T>
{
    readonly _provider: P;
    id: string;
    active: boolean;
    lock: boolean;
    // protected _active: boolean;
    // get active(): boolean {
    //     return this._active;
    // }
    // set active(value: boolean) {
    //     if (value !== this._active) {
    //         this._active = value;
    //         this._provider.onStateUpdate();
    //     }
    // }
    // protected _lock: boolean;
    // get lock(): boolean {
    //     return this._active;
    // }
    // set lock(value: boolean) {
    //     if (value !== this._lock) {
    //         this._lock = value;
    //         this._provider.onStateUpdate();
    //     }
    // }
    abstract onRegist(): void;
    abstract onRemove(): void;
    abstract onShow(param?: any): void;
    abstract onHide(): void;
    abstract getState(): T;
}

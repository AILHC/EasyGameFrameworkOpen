import { ISystem, IProcesser } from "./ECSCore";
import { Clock, clock } from "./Clock";
import { ECSWorld } from "./ECSWorld";
type frameTime = number;
/**
 * 默认ECS的处理器，负责循环
 */
export class DefaultProcesser implements IProcesser {
    onStart() {
        this.start();
    }

    private invalidEntities: Array<IEntity> = [];
    private isInited: boolean = false;
    handle: number;
    _isRunning: any = false;
    private world: ECSWorld;
    onStop() {
        this._isRunning = false;
        cancelAnimationFrame(this.handle);
    }
    init(world: ECSWorld) {
        if (this.isInited) return;
        this.isInited = true;

        this.world = world;
        //初始化时钟
        new Clock().initialize();
        this._loop = this._loop.bind(this);
    }
    public resume() {
        if (this._isRunning) {
            return;
        }
        this._isRunning = true;
        clock.reset();
        // this.handle = requestAnimationFrame(this._loop);
        // this.handle = setInterval(() => {
        //     clock.update(clock.now);
        //     DefaultProcesser.onFrameUpdate.dispatch(clock.lastFrameDelta);
        // }, clock.frameInterval);
        this.handle = requestAnimationFrame(this._loop);
    }
    public start() {
        this.resume();
    }
    public destroyEntity(entity: IEntity) {
        if (this.invalidEntities.indexOf(entity) < 0) {
            this.invalidEntities.push(entity);
        }
    }
    public pause(): void {
        this._isRunning = false;
        // clearInterval(this.handle);
        cancelAnimationFrame(this.handle);
        clock.reset();
    }
    _loop(timeStamp: number) {
        if (!this._isRunning) {
            return;
        }
        let entity: IEntity;
        if (this.invalidEntities.length > 0) {
            const entities = this.invalidEntities;
            while ((entity = entities.pop())) {
                this.world.destroyEntity(entity);
            }
        }
        clock.update(timeStamp);
        ECSWorld.onTickUpdate.dispatch(clock.lastFrameDelta);
        ECSWorld.onFrameUpdate.dispatch(clock.lastFrameDelta);
        this.handle = requestAnimationFrame(this._loop);
    }
}

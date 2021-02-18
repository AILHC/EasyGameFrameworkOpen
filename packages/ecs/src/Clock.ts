declare global {
    interface ClockUpdateFlags {
        frameCount: number;
        tickCount: number;
    }
}
type int = number;
type uint = number;
type float = number;
/**
 * 全局时钟信息组件。
 */
export class Clock {
    /**
     * 逻辑帧补偿速度
     */
    public tickCompensateSpeed: uint = 3;
    /**
     * 逻辑帧时间(秒), 例如设置为 1.0 / 60.0 为每秒 60 帧
     */
    public tickInterval: number = 1.0 / 60.0;
    /**
     * 渲染帧时间(秒), 例如设置为 1.0 / 60.0 为每秒 60 帧
     */
    public frameInterval: number = 1.0 / 60.0;
    /**
     * 运行倍速
     *
     * 为了保证平滑的效果, 不会影响逻辑/渲染帧频
     */
    public timeScale: number = 1.0;

    /**
     * 程序启动后运行的总渲染帧数
     */
    private _frameCount: uint = 0;
    /**
     * 程序启动后运行的总逻辑帧数
     */
    private _tickCount: uint = 0;
    private _beginTime: number = -1.0;
    private _unscaledTime: number = 0.0;
    private _unscaledDeltaTime: number = 0.0;
    private _fixedTime: number = 0.0;

    private _needReset: boolean = false;
    private _unusedFrameDelta: number = 0.0;
    private _unusedTickDelta: number = 0.0;

    public initialize() {
        (clock as Clock) = this;
    }
    /**
     * @internal
     * @returns 此次生成的渲染帧和逻辑帧数量, @see `ClockResult`
     */
    public update(now: number): ClockUpdateFlags {
        now = now * 0.001;

        if (this._beginTime < 0) {
            this._beginTime = now;
        }

        if (this._needReset) {
            // 刚刚恢复, 需要重置间隔
            this._unscaledTime = now - this._beginTime;
            this._unscaledDeltaTime = 0;
            this._needReset = false;

            // 产生起始的渲染帧和逻辑帧
            this._tickCount++;
            this._frameCount++;
            return { frameCount: 1, tickCount: 1 };
        }

        // 计算和上此的间隔
        const lastTime = this._unscaledTime;
        this._unscaledTime = now - this._beginTime;
        this._unscaledDeltaTime = this._unscaledTime - lastTime;

        const returnValue: ClockUpdateFlags = { frameCount: 0, tickCount: 0 };

        // 判断是否够一个逻辑帧
        if (this.tickInterval) {
            this._unusedTickDelta += this._unscaledDeltaTime;
            if (this._unusedTickDelta >= this.tickInterval) {
                // 逻辑帧需要补帧, 最多一次补 `this.maxFixedSubSteps` 帧
                // while (this._unusedTickDelta >= this.tickInterval && returnValue.tickCount < this.tickCompensateSpeed) {
                while (this._unusedTickDelta >= this.tickInterval) {
                    this._unusedTickDelta -= this.tickInterval;
                    returnValue.tickCount++;
                    this._tickCount++;
                }
            }
        } else {
            // tickInterval 未设置或者其值为零, 则表示跟随浏览器的帧率
            returnValue.tickCount = 1;
            this._tickCount++;
        }

        // TOFIX: 暂时保护性处理, 如果没产生逻辑帧, 那么也不产生渲染帧
        if (!returnValue.tickCount) {
            return returnValue;
        }

        // 判断渲染帧
        if (this.frameInterval) {
            // 确保执行过一次逻辑帧之后再执行第一次渲染
            this._unusedFrameDelta += this._unscaledDeltaTime;
            if (this._unusedFrameDelta >= this.frameInterval) {
                // 渲染帧不需要补帧
                this._unusedFrameDelta = this._unusedFrameDelta % this.frameInterval;
                returnValue.frameCount = 1;
                this._frameCount++;
            }
        } else {
            // frameInterval 未设置或者其值为零, 则表示跟随浏览器的帧率
            returnValue.frameCount = 1;
            this._frameCount++;
        }

        return returnValue;
    }

    /**
     * 程序启动后运行的总渲染帧数
     */
    public get frameCount(): uint {
        return this._frameCount;
    }
    /**
     * 程序启动后运行的总逻辑帧数
     */
    public get tickCount(): uint {
        return this._tickCount;
    }
    /**
     * 系统时间(毫秒)
     */
    public get now(): uint {
        if (Date.now) {
            return Date.now();
        }

        return new Date().getTime();
    }
    /**
     * 从程序开始运行时的累计时间(秒)
     */
    public get time(): number {
        return this._unscaledTime * this.timeScale;
    }
    /**
     *
     */
    public get fixedTime(): number {
        return this._fixedTime;
    }
    /**
     * 此次逻辑帧的时长
     */
    public get lastTickDelta(): number {
        return (this.tickInterval || this._unscaledDeltaTime) * this.timeScale;
    }
    /**
     * 此次渲染帧的时长
     */
    public get lastFrameDelta(): number {
        return this._unscaledDeltaTime * this.timeScale;
    }
    /**
     *
     */
    public get unscaledTime(): number {
        return this._unscaledTime;
    }
    /**
     *
     */
    public get unscaledDeltaTime(): number {
        return this._unscaledDeltaTime;
    }
    /**
     * reset
     */
    public reset(): void {
        this._needReset = true;
    }
    /**
     * 时间戳
     *
     * 因为 `performance.now()` 精确度更高, 更应该使用它作为时间戳
     * , 但是这个 API 在微信小游戏里支持有问题, 所以暂时使用 `Date.now()` 的实现
     *
     * 关于 `Date.now()` 与 `performance.now()`
     *
     * * 两者都是以毫秒为单位
     * * `Date.now()` 是从 Unix 纪元 (1970-01-01T00:00:00Z) 至今的毫秒数, 而后者是从页面加载至今的毫秒数
     * * `Date.now()` 精确到毫秒, 一般是整数, 后者可以精确到 5 微秒 (理论上, 可能各平台各浏览器实现的不同), 为浮点数
     * * `Date.now()` 是 Javascript 的 API, 而后者为 Web API
     * * `window.requestAnimationFrame()` 回调中使用的时间戳可认为和 `performance.now()` 的基本一致, 区别只是它不是实时的 "now", 而是 `window.requestAnimationFrame()` 调用产生时的 "now"
     */
    public timestamp(): number {
        return this.now;
    }
}
/**
 * 全局时钟信息组件实例。
 */
export const clock: Clock = null!;

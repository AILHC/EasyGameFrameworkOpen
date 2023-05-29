import { Vec2, Rect, Component, director, Node, UITransform, UIOpacity, Vec3, Constructor, Material, EffectAsset } from "cc";
import { Controller } from "./Controller";
import { BlendMode, BlendModeUtils } from "./display/BlendMode";
import { EventCallBack, Event as FUIEvent } from "./event/Event";
import { RelationType, ObjectPropID } from "./FieldTypes";
import { GComponent } from "./GComponent";
import { GearAnimation } from "./gears/GearAnimation";
import { GearBase } from "./gears/GearBase";
import { GearColor } from "./gears/GearColor";
import { GearDisplay } from "./gears/GearDisplay";
import { GearDisplay2 } from "./gears/GearDisplay2";
import { GearFontSize } from "./gears/GearFontSize";
import { GearIcon } from "./gears/GearIcon";
import { GearLook } from "./gears/GearLook";
import { GearSize } from "./gears/GearSize";
import { GearText } from "./gears/GearText";
import { GearXY } from "./gears/GearXY";
import { GGroup } from "./GGroup";
import { GTreeNode } from "./GTreeNode";
import { PackageItem } from "./PackageItem";
import { Relations } from "./Relations";
import { UIConfig } from "./UIConfig";
import { ByteBuffer } from "./utils/ByteBuffer";
import { Image } from "fairygui-cc";

export class GObject {
    protected static _hueEffect:EffectAsset;
    //获得色相效果文件
    static get hueEffect() {
        if(!GObject._hueEffect) {
            //创建效果对象
            let effect = new EffectAsset();
            effect.shaders = hueEffect.shaders;
            effect.techniques = hueEffect.techniques;
            GObject._hueEffect = effect;
        }
        return GObject._hueEffect;
    }
    //创建一个色相材质
    static createHueMaterial() {
        //创建材质对象
        let mat = new Material();
        mat.initialize({
            // 通过 effect 名指定材质使用的着色器资源
            effectAsset: GObject.hueEffect,
            //宏定义
            defines: {
                USE_TEXTURE: true
            }
        });
        return mat;
    }

    public data?: any;
    public packageItem?: PackageItem;
    public static draggingObject: GObject | null;

    protected _x: number = 0;
    protected _y: number = 0;
    protected _alpha: number = 1;
    protected _visible: boolean = true;
    protected _touchable: boolean = true;
    protected _grayed?: boolean;
    protected _draggable?: boolean;
    protected _skewX: number = 0;
    protected _skewY: number = 0;
    protected _pivotAsAnchor?: boolean;
    protected _sortingOrder: number = 0;
    protected _internalVisible: boolean = true;
    protected _handlingController?: boolean;
    protected _tooltips?: string;
    protected _blendMode: BlendMode;
    protected _pixelSnapping?: boolean;
    protected _dragTesting?: boolean;
    protected _dragStartPos?: Vec2;

    protected _relations: Relations;
    protected _group: GGroup | null;
    protected _gears: GearBase[];
    protected _node: Node;
    protected _dragBounds?: Rect;

    public sourceWidth: number = 0;
    public sourceHeight: number = 0;
    public initWidth: number = 0;
    public initHeight: number = 0;
    public minWidth: number = 0;
    public minHeight: number = 0;
    public maxWidth: number = 0;
    public maxHeight: number = 0;

    public _parent: GComponent | null;
    public _width: number = 0;
    public _height: number = 0;
    public _rawWidth: number = 0;
    public _rawHeight: number = 0;
    public _id: string;
    public _name: string;
    public _underConstruct: boolean = false;
    public _gearLocked?: boolean;
    public _sizePercentInGroup: number = 0;
    public _touchDisabled?: boolean;
    public _partner: GObjectPartner;
    public _treeNode?: GTreeNode;
    public _uiTrans: UITransform;
    public _uiOpacity: UIOpacity;

    private _hitTestPt?: Vec2;

    //亮度
    protected _brightness = 0;
    //饱和度
    protected _saturation = 0;
    //对比度
    protected _contrast = 0 ;
    //色相
    protected _hue = 0;
    //滤镜
    protected _filter = false;

    protected _hueMat:Material = null;
    //获得色相材质
    get hueMat() {
        if(!this._hueMat) {
            this._hueMat = GObject.createHueMaterial();
        }
        return this._hueMat;
    }

    public constructor() {
        this._node = new Node();
        this._uiTrans = this._node.addComponent(UITransform);
        this._uiOpacity = this.node.addComponent(UIOpacity);

        (<any>this._node)["$gobj"] = this;
        this._node.layer = UIConfig.defaultUILayer;
        this._uiTrans.setAnchorPoint(0, 1);
        this._node.on(Node.EventType.ANCHOR_CHANGED, this.handleAnchorChanged, this);

        this._id = this._node.uuid;
        this._name = "";

        this._relations = new Relations(this);
        this._gears = new Array<GearBase>(10);
        this._blendMode = BlendMode.Normal;

        this._partner = this._node.addComponent(GObjectPartner);
    }
    //亮度
    get brightness() {
        return this._brightness;
    }
    set brightness(value) {
        value = Math.min(1,value);
        value = Math.max(-1 , value);
        this._brightness = value;
    }
    //饱和度
    get saturation() {
        return this._saturation;
    }
    set saturation(value) {
        value = Math.min(1,value);
        value = Math.max(-1 , value);
        this._saturation = value;
    }
    //对比度
    get contrast() {
        return this._contrast;
    }
    set contrast(value) {
        value = Math.min(1,value);
        value = Math.max(-1 , value);
        this._contrast = value;
    }
    //色相
    get hue() {
        return this._hue;
    }
    set hue(value) {
        value = Math.min(1,value);
        value = Math.max(-1 , value);
        this._hue = value;
    }
    //滤镜
    get filter() {
        return this._filter;
    }
    set filter(value) {
        this._filter = value;
        this.handleFilterChanged();
    }

    public createHueMaterial() {
        //创建效果对象
        let effect = new EffectAsset();
        effect.shaders = hueEffect.shaders;
        effect.techniques = hueEffect.techniques;
        
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._node.name = value;
        this._name = value;
    }

    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        this.setPosition(value, this._y);
    }

    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        this.setPosition(this._x, value);
    }

    public setPosition(xv: number, yv: number): void {
        if (this._x != xv || this._y != yv) {
            var dx: number = xv - this._x;
            var dy: number = yv - this._y;
            this._x = xv;
            this._y = yv;

            this.handlePositionChanged();
            if (this instanceof GGroup)
                this.moveChildren(dx, dy);

            this.updateGear(1);

            if (this._parent && !("setVirtual" in this._parent)/*not list*/) {
                this._parent.setBoundsChangedFlag();
                if (this._group)
                    this._group.setBoundsChangedFlag(true);
                this._node.emit(FUIEvent.XY_CHANGED, this);
            }

            if (GObject.draggingObject == this && !s_dragging)
                this.localToGlobalRect(0, 0, this._width, this._height, sGlobalRect);
        }
    }

    public get xMin(): number {
        return this._pivotAsAnchor ? (this._x - this._width * this._uiTrans.anchorX) : this._x;
    }

    public set xMin(value: number) {
        if (this._pivotAsAnchor)
            this.setPosition(value + this._width * this._uiTrans.anchorX, this._y);
        else
            this.setPosition(value, this._y);
    }

    public get yMin(): number {
        return this._pivotAsAnchor ? (this._y - this._height * (1 - this._uiTrans.anchorY)) : this._y;
    }

    public set yMin(value: number) {
        if (this._pivotAsAnchor)
            this.setPosition(this._x, value + this._height * (1 - this._uiTrans.anchorY));
        else
            this.setPosition(this._x, value);
    }

    public get pixelSnapping(): boolean {
        return this._pixelSnapping;
    }

    public set pixelSnapping(value: boolean) {
        if (this._pixelSnapping != value) {
            this._pixelSnapping = value;
            this.handlePositionChanged();
        }
    }

    public center(restraint?: boolean): void {
        var r: GComponent;
        if (this._parent)
            r = this.parent;
        else
            r = Decls.GRoot.inst;

        this.setPosition((r.width - this._width) / 2, (r.height - this._height) / 2);
        if (restraint) {
            this.addRelation(r, RelationType.Center_Center);
            this.addRelation(r, RelationType.Middle_Middle);
        }
    }

    public get width(): number {
        this.ensureSizeCorrect();
        if (this._relations.sizeDirty)
            this._relations.ensureRelationsSizeCorrect();
        return this._width;
    }

    public set width(value: number) {
        this.setSize(value, this._rawHeight);
    }

    public get height(): number {
        this.ensureSizeCorrect();
        if (this._relations.sizeDirty)
            this._relations.ensureRelationsSizeCorrect();
        return this._height;
    }

    public set height(value: number) {
        this.setSize(this._rawWidth, value);
    }

    public setSize(wv: number, hv: number, ignorePivot?: boolean): void {
        if (this._rawWidth != wv || this._rawHeight != hv) {
            this._rawWidth = wv;
            this._rawHeight = hv;
            if (wv < this.minWidth)
                wv = this.minWidth;
            if (hv < this.minHeight)
                hv = this.minHeight;
            if (this.maxWidth > 0 && wv > this.maxWidth)
                wv = this.maxWidth;
            if (this.maxHeight > 0 && hv > this.maxHeight)
                hv = this.maxHeight;
            var dWidth: number = wv - this._width;
            var dHeight: number = hv - this._height;
            this._width = wv;
            this._height = hv;

            this.handleSizeChanged();
            if ((this._uiTrans.anchorX != 0 || this._uiTrans.anchorY != 1) && !this._pivotAsAnchor && !ignorePivot)
                this.setPosition(this.x - this._uiTrans.anchorX * dWidth, this.y - (1 - this._uiTrans.anchorY) * dHeight);
            else
                this.handlePositionChanged();

            if (this instanceof GGroup)
                this.resizeChildren(dWidth, dHeight);

            this.updateGear(2);

            if (this._parent) {
                this._relations.onOwnerSizeChanged(dWidth, dHeight, this._pivotAsAnchor || !ignorePivot);
                this._parent.setBoundsChangedFlag();
                if (this._group)
                    this._group.setBoundsChangedFlag();
            }

            this._node.emit(FUIEvent.SIZE_CHANGED, this);
        }
    }

    public makeFullScreen(): void {
        this.setSize(Decls.GRoot.inst.width, Decls.GRoot.inst.height);
    }

    public ensureSizeCorrect(): void {
    }

    public get actualWidth(): number {
        return this.width * Math.abs(this._node.scale.x);
    }

    public get actualHeight(): number {
        return this.height * Math.abs(this._node.scale.y);
    }

    public get scaleX(): number {
        return this._node.scale.x;
    }

    public set scaleX(value: number) {
        this.setScale(value, this._node.scale.y);
    }

    public get scaleY(): number {
        return this._node.scale.y;
    }

    public set scaleY(value: number) {
        this.setScale(this._node.scale.x, value);
    }

    public setScale(sx: number, sy: number) {
        if (this._node.scale.x != sx || this._node.scale.y != sy) {
            this._node.setScale(sx, sy);

            this.updateGear(2);
        }
    }

    public get skewX(): number {
        return this._skewX;
    }

    public get pivotX(): number {
        return this._uiTrans.anchorX;
    }

    public set pivotX(value: number) {
        this._uiTrans.anchorX = value;
    }

    public get pivotY(): number {
        return 1 - this._uiTrans.anchorY;
    }

    public set pivotY(value: number) {
        this._uiTrans.anchorY = 1 - value;
    }

    public setPivot(xv: number, yv: number, asAnchor?: boolean): void {
        if (this._uiTrans.anchorX != xv || this._uiTrans.anchorY != 1 - yv) {
            this._pivotAsAnchor = asAnchor;
            this._uiTrans.setAnchorPoint(xv, 1 - yv);
        }
        else if (this._pivotAsAnchor != asAnchor) {
            this._pivotAsAnchor = asAnchor;
            this.handlePositionChanged();
        }
    }

    public get pivotAsAnchor(): boolean {
        return this._pivotAsAnchor;
    }

    public get touchable(): boolean {
        return this._touchable;
    }

    public set touchable(value: boolean) {
        if (this._touchable != value) {
            this._touchable = value;
            this.updateGear(3);
        }
    }

    public get grayed(): boolean {
        return this._grayed;
    }

    public set grayed(value: boolean) {
        if (this._grayed != value) {
            this._grayed = value;
            this.handleGrayedChanged();
            this.updateGear(3);
        }
    }

    public get enabled(): boolean {
        return !this._grayed && this._touchable;
    }

    public set enabled(value: boolean) {
        this.grayed = !value;
        this.touchable = value;
    }

    public get rotation(): number {
        return -this._node.angle;
    }

    public set rotation(value: number) {
        value = -value;
        if (this._node.angle != value) {
            this._node.angle = value;
            this.updateGear(3);
        }
    }

    public get alpha(): number {
        return this._alpha;
    }

    public set alpha(value: number) {
        if (this._alpha != value) {
            this._alpha = value;

            this._uiOpacity.opacity = this._alpha * 255;

            if (this instanceof GGroup)
                this.handleAlphaChanged();

            this.updateGear(3);
        }
    }

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(value: boolean) {
        if (this._visible != value) {
            this._visible = value;

            this.handleVisibleChanged();

            if (this._group && this._group.excludeInvisibles)
                this._group.setBoundsChangedFlag();
        }
    }

    public get _finalVisible(): boolean {
        return this._visible && this._internalVisible && (!this._group || this._group._finalVisible);
    }

    public get internalVisible3(): boolean {
        return this._visible && this._internalVisible;
    }

    public get sortingOrder(): number {
        return this._sortingOrder;
    }

    public set sortingOrder(value: number) {
        if (value < 0)
            value = 0;
        if (this._sortingOrder != value) {
            var old: number = this._sortingOrder;
            this._sortingOrder = value;
            if (this._parent)
                this._parent.childSortingOrderChanged(this, old, this._sortingOrder);
        }
    }

    public requestFocus(): void {
    }

    public get tooltips(): string | null {
        return this._tooltips;
    }

    public set tooltips(value: string | null) {
        if (this._tooltips) {
            this._node.off(FUIEvent.ROLL_OVER, this.onRollOver, this);
            this._node.off(FUIEvent.ROLL_OUT, this.onRollOut, this);
        }

        this._tooltips = value;

        if (this._tooltips) {
            this._node.on(FUIEvent.ROLL_OVER, this.onRollOver, this);
            this._node.on(FUIEvent.ROLL_OUT, this.onRollOut, this);
        }
    }

    public get blendMode(): BlendMode {
        return this._blendMode;
    }

    public set blendMode(value: BlendMode) {
        if (this._blendMode != value) {
            this._blendMode = value;
            BlendModeUtils.apply(this._node, value);
        }
    }

    public get onStage(): boolean {
        return this._node && this._node.activeInHierarchy;
    }

    public get resourceURL(): string | null {
        if (this.packageItem)
            return "ui://" + this.packageItem.owner.id + this.packageItem.id;
        else
            return null;
    }

    public set group(value: GGroup) {
        if (this._group != value) {
            if (this._group)
                this._group.setBoundsChangedFlag();
            this._group = value;
            if (this._group)
                this._group.setBoundsChangedFlag();
        }
    }

    public get group(): GGroup {
        return this._group;
    }

    public getGear(index: number): GearBase {
        var gear: GearBase = this._gears[index];
        if (!gear)
            this._gears[index] = gear = createGear(this, index);
        return gear;
    }

    protected updateGear(index: number): void {
        if (this._underConstruct || this._gearLocked)
            return;

        var gear: GearBase = this._gears[index];
        if (gear && gear.controller)
            gear.updateState();
    }

    public checkGearController(index: number, c: Controller): boolean {
        return this._gears[index] && this._gears[index].controller == c;
    }

    public updateGearFromRelations(index: number, dx: number, dy: number): void {
        if (this._gears[index])
            this._gears[index].updateFromRelations(dx, dy);
    }

    public addDisplayLock(): number {
        var gearDisplay: GearDisplay = <GearDisplay>this._gears[0];
        if (gearDisplay && gearDisplay.controller) {
            var ret: number = gearDisplay.addLock();
            this.checkGearDisplay();

            return ret;
        }
        else
            return 0;
    }

    public releaseDisplayLock(token: number): void {
        var gearDisplay: GearDisplay = <GearDisplay>this._gears[0];
        if (gearDisplay && gearDisplay.controller) {
            gearDisplay.releaseLock(token);
            this.checkGearDisplay();
        }
    }

    private checkGearDisplay(): void {
        if (this._handlingController)
            return;

        var connected: boolean = this._gears[0] == null || (<GearDisplay>this._gears[0]).connected;
        if (this._gears[8])
            connected = (<GearDisplay2>this._gears[8]).evaluate(connected);

        if (connected != this._internalVisible) {
            this._internalVisible = connected;
            this.handleVisibleChanged();

            if (this._group && this._group.excludeInvisibles)
                this._group.setBoundsChangedFlag();
        }
    }

    public get gearXY(): GearXY {
        return <GearXY>this.getGear(1);
    }

    public get gearSize(): GearSize {
        return <GearSize>this.getGear(2);
    }

    public get gearLook(): GearLook {
        return <GearLook>this.getGear(3);
    }

    public get relations(): Relations {
        return this._relations;
    }

    public addRelation(target: GObject, relationType: number, usePercent?: boolean): void {
        this._relations.add(target, relationType, usePercent);
    }

    public removeRelation(target: GObject, relationType: number): void {
        this._relations.remove(target, relationType);
    }

    public get node(): Node {
        return this._node;
    }

    public get parent(): GComponent {
        return this._parent;
    }

    public removeFromParent(): void {
        if (this._parent)
            this._parent.removeChild(this);
    }

    public findParent(): GObject {
        if (this._parent)
            return this._parent;

        //可能有些不直接在children里，但node挂着的
        let pn: Node = this._node.parent;
        while (pn) {
            let gobj = (<any>pn)["$gobj"];
            if (gobj)
                return gobj;

            pn = pn.parent;
        }

        return null;
    }

    public get asCom(): GComponent {
        return <GComponent><any>this;
    }

    public static cast(obj: Node): GObject {
        return (<any>obj)["$gobj"];
    }

    public get text(): string | null {
        return null;
    }

    public set text(value: string | null) {
    }

    public get icon(): string | null {
        return null;
    }

    public set icon(value: string | null) {
    }

    public get treeNode(): GTreeNode {
        return this._treeNode;
    }

    public get isDisposed(): boolean {
        return this._node == null;
    }

    public dispose(): void {
        let n = this._node;
        if (!n)
            return;

        this.removeFromParent();
        this._relations.dispose();

        this._node = null;
        n.destroy();

        for (var i: number = 0; i < 10; i++) {
            var gear: GearBase = this._gears[i];
            if (gear)
                gear.dispose();
        }
    }

    protected onEnable() {
    }

    protected onDisable() {
    }

    protected onUpdate() {
    }

    protected onDestroy() {
    }

    public onClick(listener: Function | EventCallBack, target?: any): void {
        this._node.on(FUIEvent.CLICK, listener, target);
    }

    public onceClick(listener: Function | EventCallBack, target?: any): void {
        this._node.once(FUIEvent.CLICK, listener, target);
    }

    public offClick(listener: Function, target?: any): void {
        this._node.off(FUIEvent.CLICK, listener, target);
    }

    public clearClick(): void {
        this._node.off(FUIEvent.CLICK);
    }

    public hasClickListener(): boolean {
        return this._node.hasEventListener(FUIEvent.CLICK);
    }

    public on(type: string, listener: Function | EventCallBack, target?: any): void {
        if (type == FUIEvent.DISPLAY || type == FUIEvent.UNDISPLAY)
            this._partner._emitDisplayEvents = true;

        this._node.on(type, listener, target);
    }

    public once(type: string, listener: Function | EventCallBack, target?: any): void {
        if (type == FUIEvent.DISPLAY || type == FUIEvent.UNDISPLAY)
            this._partner._emitDisplayEvents = true;

        this._node.once(type, listener, target);
    }

    public off(type: string, listener?: Function, target?: any): void {
        this._node.off(type, listener, target);
    }

    public get draggable(): boolean {
        return this._draggable;
    }

    public set draggable(value: boolean) {
        if (this._draggable != value) {
            this._draggable = value;
            this.initDrag();
        }
    }

    public get dragBounds(): Rect {
        return this._dragBounds;
    }

    public set dragBounds(value: Rect) {
        this._dragBounds = value;
    }

    public startDrag(touchId?: number): void {
        if (!this._node.activeInHierarchy)
            return;

        this.dragBegin(touchId);
    }

    public stopDrag(): void {
        this.dragEnd();
    }

    public get dragging(): boolean {
        return GObject.draggingObject == this;
    }

    public localToGlobal(ax?: number, ay?: number, result?: Vec2): Vec2 {
        ax = ax || 0;
        ay = ay || 0;
        s_vec3.x = ax;
        s_vec3.y = -ay;
        if (!this._pivotAsAnchor) {
            s_vec3.x -= this._uiTrans.anchorX * this._width;
            s_vec3.y += (1 - this._uiTrans.anchorY) * this._height;
        }
        this._uiTrans.convertToWorldSpaceAR(s_vec3, s_vec3);
        s_vec3.y = Decls.GRoot.inst.height - s_vec3.y;

        result = result || new Vec2();
        result.x = s_vec3.x;
        result.y = s_vec3.y;
        return result;
    }

    public globalToLocal(ax?: number, ay?: number, result?: Vec2): Vec2 {
        ax = ax || 0;
        ay = ay || 0;
        s_vec3.x = ax;
        s_vec3.y = Decls.GRoot.inst.height - ay;
        this._uiTrans.convertToNodeSpaceAR(s_vec3, s_vec3);
        if (!this._pivotAsAnchor) {
            s_vec3.x += this._uiTrans.anchorX * this._width;
            s_vec3.y -= (1 - this._uiTrans.anchorY) * this._height;
        }

        result = result || new Vec2();
        result.x = s_vec3.x;
        result.y = -s_vec3.y;
        return result;
    }

    public localToGlobalRect(ax?: number, ay?: number, aw?: number, ah?: number, result?: Rect): Rect {
        ax = ax || 0;
        ay = ay || 0;
        aw = aw || 0;
        ah = ah || 0;
        result = result || new Rect();
        var pt: Vec2 = this.localToGlobal(ax, ay);
        result.x = pt.x;
        result.y = pt.y;
        pt = this.localToGlobal(ax + aw, ay + ah, pt);
        result.xMax = pt.x;
        result.yMax = pt.y;
        return result;
    }

    public globalToLocalRect(ax?: number, ay?: number, aw?: number, ah?: number, result?: Rect): Rect {
        ax = ax || 0;
        ay = ay || 0;
        aw = aw || 0;
        ah = ah || 0;
        result = result || new Rect();
        var pt: Vec2 = this.globalToLocal(ax, ay);
        result.x = pt.x;
        result.y = pt.y;
        pt = this.globalToLocal(ax + aw, ay + ah, pt);
        result.xMax = pt.x;
        result.yMax = pt.y;
        return result;
    }

    public handleControllerChanged(c: Controller): void {
        this._handlingController = true;
        for (var i: number = 0; i < 10; i++) {
            var gear: GearBase = this._gears[i];
            if (gear && gear.controller == c)
                gear.apply();
        }
        this._handlingController = false;

        this.checkGearDisplay();
    }

    protected handleAnchorChanged(): void {
        this.handlePositionChanged();
    }

    public handlePositionChanged(): void {
        var xv: number = this._x;
        var yv: number = -this._y;
        if (!this._pivotAsAnchor) {
            xv += this._uiTrans.anchorX * this._width;
            yv -= (1 - this._uiTrans.anchorY) * this._height;
        }
        if (this._pixelSnapping) {
            xv = Math.round(xv);
            yv = Math.round(yv);
        }
        this._node.setPosition(xv, yv);
    }

    protected handleSizeChanged(): void {
        this._uiTrans.setContentSize(this._width, this._height);
    }

    protected handleGrayedChanged(): void {
        //nothing is base
    }

    protected handleFilterChanged(): void {
        //default image
    }

    public handleVisibleChanged(): void {
        this._node.active = this._finalVisible;

        if (this instanceof GGroup)
            this.handleVisibleChanged();

        if (this._parent)
            this._parent.setBoundsChangedFlag();
    }

    public hitTest(globalPt: Vec2, forTouch?: boolean): GObject {
        if (forTouch == null) forTouch = true;
        if (forTouch && (this._touchDisabled || !this._touchable || !this._node.activeInHierarchy))
            return null;

        if (!this._hitTestPt)
            this._hitTestPt = new Vec2();
        this.globalToLocal(globalPt.x, globalPt.y, this._hitTestPt);
        if (this._pivotAsAnchor) {
            this._hitTestPt.x += this._uiTrans.anchorX * this._width;
            this._hitTestPt.y += (1 - this._uiTrans.anchorY) * this._height;
        }
        return this._hitTest(this._hitTestPt, globalPt);
    }

    protected _hitTest(pt: Vec2, globalPt: Vec2): GObject {
        if (pt.x >= 0 && pt.y >= 0 && pt.x < this._width && pt.y < this._height)
            return this;
        else
            return null;
    }

    public getProp(index: number): any {
        switch (index) {
            case ObjectPropID.Text:
                return this.text;
            case ObjectPropID.Icon:
                return this.icon;
            case ObjectPropID.Color:
                return null;
            case ObjectPropID.OutlineColor:
                return null;
            case ObjectPropID.Playing:
                return false;
            case ObjectPropID.Frame:
                return 0;
            case ObjectPropID.DeltaTime:
                return 0;
            case ObjectPropID.TimeScale:
                return 1;
            case ObjectPropID.FontSize:
                return 0;
            case ObjectPropID.Selected:
                return false;
            default:
                return undefined;
        }
    }

    public setProp(index: number, value: any): void {
        switch (index) {
            case ObjectPropID.Text:
                this.text = value;
                break;

            case ObjectPropID.Icon:
                this.icon = value;
                break;
        }
    }

    public constructFromResource(): void {
    }

    public setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void {
        buffer.seek(beginPos, 0);
        buffer.skip(5);

        var f1: number;
        var f2: number;

        this._id = buffer.readS();
        this._name = buffer.readS();
        f1 = buffer.readInt();
        f2 = buffer.readInt();
        this.setPosition(f1, f2);

        if (buffer.readBool()) {
            this.initWidth = buffer.readInt();
            this.initHeight = buffer.readInt();
            this.setSize(this.initWidth, this.initHeight, true);
        }

        if (buffer.readBool()) {
            this.minWidth = buffer.readInt();
            this.maxWidth = buffer.readInt();
            this.minHeight = buffer.readInt();
            this.maxHeight = buffer.readInt();
        }

        if (buffer.readBool()) {
            f1 = buffer.readFloat();
            f2 = buffer.readFloat();
            this.setScale(f1, f2);
        }

        if (buffer.readBool()) {
            f1 = buffer.readFloat();
            f2 = buffer.readFloat();
            //this.setSkew(f1, f2);
        }

        if (buffer.readBool()) {
            f1 = buffer.readFloat();
            f2 = buffer.readFloat();
            this.setPivot(f1, f2, buffer.readBool());
        }

        f1 = buffer.readFloat();
        if (f1 != 1)
            this.alpha = f1;

        f1 = buffer.readFloat();
        if (f1 != 0)
            this.rotation = f1;

        if (!buffer.readBool())
            this.visible = false;
        if (!buffer.readBool())
            this.touchable = false;
        if (buffer.readBool())
            this.grayed = true;
        this.blendMode = buffer.readByte();

        var filter: number = buffer.readByte();
        if (filter == 1) {
            //TODO: filter support
            f1 = buffer.readFloat();
            f2 = buffer.readFloat();
            this._brightness = f1 ;
            this._contrast = f2;
            f1 = buffer.readFloat();
            f2 = buffer.readFloat();
            this._saturation = f1;
            this._hue = f2;
            this.filter = true;
        }

        var str: string = buffer.readS();
        if (str != null)
            this.data = str;
    }

    public setup_afterAdd(buffer: ByteBuffer, beginPos: number): void {
        buffer.seek(beginPos, 1);

        var str: string = buffer.readS();
        if (str != null)
            this.tooltips = str;

        var groupId: number = buffer.readShort();
        if (groupId >= 0)
            this.group = <GGroup>this.parent.getChildAt(groupId);

        buffer.seek(beginPos, 2);

        var cnt: number = buffer.readShort();
        for (var i: number = 0; i < cnt; i++) {
            var nextPos: number = buffer.readShort();
            nextPos += buffer.position;

            var gear: GearBase = this.getGear(buffer.readByte());
            gear.setup(buffer);

            buffer.position = nextPos;
        }
    }

    //toolTips support
    private onRollOver(): void {
        Decls.GRoot.inst.showTooltips(this.tooltips);
    };
    private onRollOut(): void {
        Decls.GRoot.inst.hideTooltips();
    };

    //drag support
    //-------------------------------------------------------------------
    private initDrag(): void {
        if (this._draggable) {
            this.on(FUIEvent.TOUCH_BEGIN, this.onTouchBegin_0, this);
            this.on(FUIEvent.TOUCH_MOVE, this.onTouchMove_0, this);
            this.on(FUIEvent.TOUCH_END, this.onTouchEnd_0, this);
        }
        else {
            this.off(FUIEvent.TOUCH_BEGIN, this.onTouchBegin_0, this);
            this.off(FUIEvent.TOUCH_MOVE, this.onTouchMove_0, this);
            this.off(FUIEvent.TOUCH_END, this.onTouchEnd_0, this);
        }
    }

    private dragBegin(touchId: number): void {
        if (GObject.draggingObject) {
            let tmp: GObject = GObject.draggingObject;
            tmp.stopDrag();
            GObject.draggingObject = null;

            tmp._node.emit(FUIEvent.DRAG_END);
        }

        if (touchId == undefined)
            touchId = Decls.GRoot.inst.inputProcessor.getAllTouches()[0];

        sGlobalDragStart.set(Decls.GRoot.inst.getTouchPosition(touchId));
        this.localToGlobalRect(0, 0, this._width, this._height, sGlobalRect);

        GObject.draggingObject = this;
        this._dragTesting = false;
        Decls.GRoot.inst.inputProcessor.addTouchMonitor(touchId, this);

        this.on(FUIEvent.TOUCH_MOVE, this.onTouchMove_0, this);
        this.on(FUIEvent.TOUCH_END, this.onTouchEnd_0, this);
    }

    private dragEnd(): void {
        if (GObject.draggingObject == this) {
            this._dragTesting = false;
            GObject.draggingObject = null;
        }
        s_dragQuery = false;
    }

    private onTouchBegin_0(evt: FUIEvent): void {
        if (this._dragStartPos == null)
            this._dragStartPos = new Vec2();

        this._dragStartPos.set(evt.pos);
        this._dragTesting = true;
        evt.captureTouch();
    }

    private onTouchMove_0(evt: FUIEvent): void {
        if (GObject.draggingObject != this && this._draggable && this._dragTesting) {
            var sensitivity: number = UIConfig.touchDragSensitivity;
            if (this._dragStartPos
                && Math.abs(this._dragStartPos.x - evt.pos.x) < sensitivity
                && Math.abs(this._dragStartPos.y - evt.pos.y) < sensitivity)
                return;

            this._dragTesting = false;

            s_dragQuery = true;
            this._node.emit(FUIEvent.DRAG_START, evt);
            if (s_dragQuery)
                this.dragBegin(evt.touchId);
        }

        if (GObject.draggingObject == this) {

            var xx: number = evt.pos.x - sGlobalDragStart.x + sGlobalRect.x;
            var yy: number = evt.pos.y - sGlobalDragStart.y + sGlobalRect.y;

            if (this._dragBounds) {
                var rect: Rect = Decls.GRoot.inst.localToGlobalRect(this._dragBounds.x, this._dragBounds.y,
                    this._dragBounds.width, this._dragBounds.height, s_rect);
                if (xx < rect.x)
                    xx = rect.x;
                else if (xx + sGlobalRect.width > rect.xMax) {
                    xx = rect.xMax - sGlobalRect.width;
                    if (xx < rect.x)
                        xx = rect.x;
                }

                if (yy < rect.y)
                    yy = rect.y;
                else if (yy + sGlobalRect.height > rect.yMax) {
                    yy = rect.yMax - sGlobalRect.height;
                    if (yy < rect.y)
                        yy = rect.y;
                }
            }

            s_dragging = true;
            var pt: Vec2 = this.parent.globalToLocal(xx, yy, s_vec2);
            this.setPosition(Math.round(pt.x), Math.round(pt.y));
            s_dragging = false;

            this._node.emit(FUIEvent.DRAG_MOVE, evt);
        }
    }

    private onTouchEnd_0(evt: Event): void {
        if (GObject.draggingObject == this) {
            GObject.draggingObject = null;

            this._node.emit(FUIEvent.DRAG_END, evt);
        }
    }
}

//-------------------------------------------------------------------

export class GObjectPartner extends Component {
    public _emitDisplayEvents?: boolean;

    public callLater(callback: any, delay?: number): void {
        if (!director.getScheduler().isScheduled(callback, this))
            this.scheduleOnce(callback, delay);
    }

    public onClickLink(evt: Event, text: string) {
        this.node.emit(FUIEvent.LINK, text, evt);
    }

    protected onEnable() {
        (<any>this.node)["$gobj"].onEnable();

        if (this._emitDisplayEvents)
            this.node.emit(FUIEvent.DISPLAY);
    }

    protected onDisable() {
        (<any>this.node)["$gobj"].onDisable();

        if (this._emitDisplayEvents)
            this.node.emit(FUIEvent.UNDISPLAY);
    }

    protected update(dt: number) {
        (<any>this.node)["$gobj"].onUpdate(dt);
    }

    protected onDestroy() {
        (<any>this.node)["$gobj"].onDestroy();
    }
}

//-------------------------------------------------------------------

let GearClasses: Array<typeof GearBase> = [
    GearDisplay, GearXY, GearSize, GearLook, GearColor,
    GearAnimation, GearText, GearIcon, GearDisplay2, GearFontSize
];

function createGear(owner: GObject, index: number): GearBase {
    let ret = new (GearClasses[index])();
    ret._owner = owner;
    return ret;
}

var s_vec2: Vec2 = new Vec2();
var s_vec3: Vec3 = new Vec3();
var s_rect: Rect = new Rect();

var sGlobalDragStart: Vec2 = new Vec2();
var sGlobalRect: Rect = new Rect();
var s_dragging: boolean;
var s_dragQuery: boolean;

export interface IGRoot {
    inst: any;
}

export var Decls: { GRoot?: IGRoot } = {};

export var constructingDepth: { n: number } = { n: 0 };
//cocos预编译后的效果文件
let hueEffect:any = {
    "techniques": [
        {
          "passes": [
            {
              "blendState": {
                "targets": [
                  {
                    "blend": true,
                    "blendSrc": 2,
                    "blendDst": 4,
                    "blendDstAlpha": 4
                  }
                ]
              },
              "rasterizerState": {
                "cullMode": 0
              },
              "program": "../__test_cases__/gray_test/builtin-sprite-filter|sprite-vs:vert|sprite-fs:frag",
              "depthStencilState": {
                "depthTest": false,
                "depthWrite": false
              },
              "properties": {
                "alphaThreshold": {
                  "value": [
                    0.5
                  ],
                  "type": 13
                },
                "brightness": {
                  "value": [
                    0
                  ],
                  "inspector": {
                    "displayName": "亮度[-1-1]"
                  },
                  "type": 13
                },
                "saturation": {
                  "value": [
                    1
                  ],
                  "inspector": {
                    "displayName": "饱和度[0-2]"
                  },
                  "type": 13
                },
                "contrast": {
                  "value": [
                    1
                  ],
                  "inspector": {
                    "displayName": "对比度[0-2]"
                  },
                  "type": 13
                },
                "hue": {
                  "value": [
                    0
                  ],
                  "inspector": {
                    "displayName": "色相[-180-180]"
                  },
                  "type": 13
                }
              }
            }
          ]
        }
      ],
      "shaders": [
        {
          "blocks": [
            {
              "name": "ALPHA_TEST_DATA",
              "members": [
                {
                  "name": "alphaThreshold",
                  "type": 13,
                  "count": 1
                }
              ],
              "defines": [
                "USE_ALPHA_TEST"
              ],
              "stageFlags": 16,
              "binding": 0
            },
            {
              "name": "Constant",
              "members": [
                {
                  "name": "brightness",
                  "type": 13,
                  "count": 1
                },
                {
                  "name": "saturation",
                  "type": 13,
                  "count": 1
                },
                {
                  "name": "contrast",
                  "type": 13,
                  "count": 1
                },
                {
                  "name": "hue",
                  "type": 13,
                  "count": 1
                }
              ],
              "defines": [],
              "stageFlags": 16,
              "binding": 1
            }
          ],
          "samplerTextures": [],
          "samplers": [],
          "textures": [],
          "buffers": [],
          "images": [],
          "subpassInputs": [],
          "attributes": [
            {
              "name": "a_position",
              "defines": [],
              "format": 32,
              "location": 0
            },
            {
              "name": "a_texCoord",
              "defines": [],
              "format": 21,
              "location": 1
            },
            {
              "name": "a_color",
              "defines": [],
              "format": 44,
              "location": 2
            }
          ],
          "varyings": [
            {
              "name": "color",
              "type": 16,
              "count": 1,
              "defines": [],
              "stageFlags": 17,
              "location": 0
            },
            {
              "name": "uv0",
              "type": 14,
              "count": 1,
              "defines": [],
              "stageFlags": 17,
              "location": 1
            }
          ],
          "fragColors": [
            {
              "name": "cc_FragColor",
              "typename": "vec4",
              "type": 16,
              "count": 1,
              "defines": [],
              "stageFlags": 16,
              "location": 0
            }
          ],
          "descriptors": [
            {
              "rate": 0,
              "blocks": [
                {
                  "tags": {
                    "builtin": "local"
                  },
                  "name": "CCLocal",
                  "members": [
                    {
                      "name": "cc_matWorld",
                      "typename": "mat4",
                      "type": 25,
                      "count": 1,
                      "precision": "highp "
                    },
                    {
                      "name": "cc_matWorldIT",
                      "typename": "mat4",
                      "type": 25,
                      "count": 1,
                      "precision": "highp "
                    },
                    {
                      "name": "cc_lightingMapUVParam",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "highp "
                    },
                    {
                      "name": "cc_localShadowBias",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "highp "
                    }
                  ],
                  "defines": [
                    "USE_LOCAL"
                  ],
                  "stageFlags": 1
                }
              ],
              "samplerTextures": [
                {
                  "tags": {
                    "builtin": "local"
                  },
                  "name": "cc_spriteTexture",
                  "typename": "sampler2D",
                  "type": 28,
                  "count": 1,
                  "defines": [
                    "USE_TEXTURE"
                  ],
                  "stageFlags": 16
                }
              ],
              "samplers": [],
              "textures": [],
              "buffers": [],
              "images": [],
              "subpassInputs": []
            },
            {
              "rate": 1,
              "blocks": [
                {
                  "name": "ALPHA_TEST_DATA",
                  "members": [
                    {
                      "name": "alphaThreshold",
                      "type": 13,
                      "count": 1
                    }
                  ],
                  "defines": [
                    "USE_ALPHA_TEST"
                  ],
                  "stageFlags": 16,
                  "binding": 0
                },
                {
                  "name": "Constant",
                  "members": [
                    {
                      "name": "brightness",
                      "type": 13,
                      "count": 1
                    },
                    {
                      "name": "saturation",
                      "type": 13,
                      "count": 1
                    },
                    {
                      "name": "contrast",
                      "type": 13,
                      "count": 1
                    },
                    {
                      "name": "hue",
                      "type": 13,
                      "count": 1
                    }
                  ],
                  "defines": [],
                  "stageFlags": 16,
                  "binding": 1
                }
              ],
              "samplerTextures": [],
              "samplers": [],
              "textures": [],
              "buffers": [],
              "images": [],
              "subpassInputs": []
            },
            {
              "rate": 2,
              "blocks": [],
              "samplerTextures": [],
              "samplers": [],
              "textures": [],
              "buffers": [],
              "images": [],
              "subpassInputs": []
            },
            {
              "rate": 3,
              "blocks": [
                {
                  "tags": {
                    "builtin": "global"
                  },
                  "name": "CCGlobal",
                  "members": [
                    {
                      "name": "cc_time",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "highp "
                    },
                    {
                      "name": "cc_screenSize",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_nativeSize",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_debug_view_mode",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_debug_view_composite_pack_1",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_debug_view_composite_pack_2",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_debug_view_composite_pack_3",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    }
                  ],
                  "defines": [],
                  "stageFlags": 1
                },
                {
                  "tags": {
                    "builtin": "global"
                  },
                  "name": "CCCamera",
                  "members": [
                    {
                      "name": "cc_matView",
                      "typename": "mat4",
                      "type": 25,
                      "count": 1,
                      "precision": "highp "
                    },
                    {
                      "name": "cc_matViewInv",
                      "typename": "mat4",
                      "type": 25,
                      "count": 1,
                      "precision": "highp "
                    },
                    {
                      "name": "cc_matProj",
                      "typename": "mat4",
                      "type": 25,
                      "count": 1,
                      "precision": "highp "
                    },
                    {
                      "name": "cc_matProjInv",
                      "typename": "mat4",
                      "type": 25,
                      "count": 1,
                      "precision": "highp "
                    },
                    {
                      "name": "cc_matViewProj",
                      "typename": "mat4",
                      "type": 25,
                      "count": 1,
                      "precision": "highp "
                    },
                    {
                      "name": "cc_matViewProjInv",
                      "typename": "mat4",
                      "type": 25,
                      "count": 1,
                      "precision": "highp "
                    },
                    {
                      "name": "cc_cameraPos",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "highp "
                    },
                    {
                      "name": "cc_surfaceTransform",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_screenScale",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_exposure",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_mainLitDir",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_mainLitColor",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_ambientSky",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_ambientGround",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_fogColor",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_fogBase",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_fogAdd",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_nearFar",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    },
                    {
                      "name": "cc_viewPort",
                      "typename": "vec4",
                      "type": 16,
                      "count": 1,
                      "precision": "mediump "
                    }
                  ],
                  "defines": [],
                  "stageFlags": 1
                }
              ],
              "samplerTextures": [],
              "samplers": [],
              "textures": [],
              "buffers": [],
              "images": [],
              "subpassInputs": []
            }
          ],
          "hash": 4243428481,
          "glsl4": {
            "vert": "\nprecision highp float;\nlayout(set = 0, binding = 0) uniform CCGlobal {\n  highp   vec4 cc_time;\n  mediump vec4 cc_screenSize;\n  mediump vec4 cc_nativeSize;\n  mediump vec4 cc_debug_view_mode;\n  mediump vec4 cc_debug_view_composite_pack_1;\n  mediump vec4 cc_debug_view_composite_pack_2;\n  mediump vec4 cc_debug_view_composite_pack_3;\n};\nlayout(set = 0, binding = 1) uniform CCCamera {\n  highp   mat4 cc_matView;\n  highp   mat4 cc_matViewInv;\n  highp   mat4 cc_matProj;\n  highp   mat4 cc_matProjInv;\n  highp   mat4 cc_matViewProj;\n  highp   mat4 cc_matViewProjInv;\n  highp   vec4 cc_cameraPos;\n  mediump vec4 cc_surfaceTransform;\n  mediump vec4 cc_screenScale;\n  mediump vec4 cc_exposure;\n  mediump vec4 cc_mainLitDir;\n  mediump vec4 cc_mainLitColor;\n  mediump vec4 cc_ambientSky;\n  mediump vec4 cc_ambientGround;\n  mediump vec4 cc_fogColor;\n  mediump vec4 cc_fogBase;\n  mediump vec4 cc_fogAdd;\n  mediump vec4 cc_nearFar;\n  mediump vec4 cc_viewPort;\n};\n#if USE_LOCAL\n  layout(set = 2, binding = 0) uniform CCLocal {\n    highp mat4 cc_matWorld;\n    highp mat4 cc_matWorldIT;\n    highp vec4 cc_lightingMapUVParam;\n    highp vec4 cc_localShadowBias;\n  };\n#endif\n#if SAMPLE_FROM_RT\n  #define QUATER_PI         0.78539816340\n  #define HALF_PI           1.57079632679\n  #define PI                3.14159265359\n  #define PI2               6.28318530718\n  #define PI4               12.5663706144\n  #define INV_QUATER_PI     1.27323954474\n  #define INV_HALF_PI       0.63661977237\n  #define INV_PI            0.31830988618\n  #define INV_PI2           0.15915494309\n  #define INV_PI4           0.07957747155\n  #define EPSILON           1e-6\n  #define EPSILON_LOWP      1e-4\n  #define LOG2              1.442695\n  #define EXP_VALUE         2.71828183f\n  #define FP_MAX            65504.0\n  #define FP_SCALE          0.0009765625\n  #define FP_SCALE_INV      1024.0\n  #define GRAY_VECTOR       vec3(0.299, 0.587, 0.114)\n      #define LIGHT_MAP_TYPE_DISABLED 0\n  #define LIGHT_MAP_TYPE_ALL_IN_ONE 1\n  #define LIGHT_MAP_TYPE_INDIRECT_OCCLUSION 2\n  #define REFLECTION_PROBE_TYPE_NONE 0\n  #define REFLECTION_PROBE_TYPE_CUBE 1\n  #define REFLECTION_PROBE_TYPE_PLANAR 2\n  #define LIGHT_TYPE_DIRECTIONAL 0.0\n  #define LIGHT_TYPE_SPHERE 1.0\n  #define LIGHT_TYPE_SPOT 2.0\n  #define IS_DIRECTIONAL_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_DIRECTIONAL)) < EPSILON)\n  #define IS_SPHERE_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_SPHERE)) < EPSILON)\n  #define IS_SPOT_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_SPOT)) < EPSILON)\n#endif\nlayout(location = 0) in vec3 a_position;\nlayout(location = 1) in vec2 a_texCoord;\nlayout(location = 2) in vec4 a_color;\nlayout(location = 0) out vec4 color;\nlayout(location = 1) out vec2 uv0;\nvec4 vert () {\n  vec4 pos = vec4(a_position, 1);\n  #if USE_LOCAL\n    pos = cc_matWorld * pos;\n  #endif\n  #if USE_PIXEL_ALIGNMENT\n    pos = cc_matView * pos;\n    pos.xyz = floor(pos.xyz);\n    pos = cc_matProj * pos;\n  #else\n    pos = cc_matViewProj * pos;\n  #endif\n  uv0 = a_texCoord;\n  #if SAMPLE_FROM_RT\n    uv0 = cc_cameraPos.w > 1.0 ? vec2(uv0.x, 1.0 - uv0.y) : uv0;\n  #endif\n  color = a_color;\n  return pos;\n}\nvoid main() { gl_Position = vert(); }",
            "frag": "\nprecision highp float;\nvec4 CCSampleWithAlphaSeparated(sampler2D tex, vec2 uv) {\n#if CC_USE_EMBEDDED_ALPHA\n  return vec4(texture(tex, uv).rgb, texture(tex, uv + vec2(0.0, 0.5)).r);\n#else\n  return texture(tex, uv);\n#endif\n}\n#if USE_ALPHA_TEST\n  layout(set = 1, binding = 0) uniform ALPHA_TEST_DATA {\n    float alphaThreshold;\n  };\n#endif\nvoid ALPHA_TEST (in vec4 color) {\n  #if USE_ALPHA_TEST\n    if (color.a < alphaThreshold) discard;\n  #endif\n}\nvoid ALPHA_TEST (in float alpha) {\n  #if USE_ALPHA_TEST\n    if (alpha < alphaThreshold) discard;\n  #endif\n}\nlayout(location = 0) in vec4 color;\nlayout(set = 1, binding = 1) uniform Constant{\n  float brightness;\n  float saturation;\n  float contrast;\n  float hue;\n};\n#if USE_TEXTURE\n  layout(location = 1) in vec2 uv0;\n  layout(set = 2, binding = 12) uniform sampler2D cc_spriteTexture;\n#endif\n  vec3 rgb2hsv(vec3 rgb) {\n      float R = rgb.x, G = rgb.y, B = rgb.z;\n      vec3 hsv;\n      float max1 = max(R,max(G,B));\n      float min1 = min(R,min(G,B));\n      if (R == max1) {\n          hsv.x = (G-B)/(max1-min1);\n      }\n      if (G == max1) {\n          hsv.x = 2.0 + (B-R)/(max1-min1);\n      }\n      if (B == max1) {\n          hsv.x = 4.0 + (R-G)/(max1-min1);\n      }\n      hsv.x = hsv.x * 60.0;\n      if (hsv.x < 0.0) {\n          hsv.x = hsv.x + 360.0;\n      }\n      hsv.z = max1;\n      hsv.y = (max1 - min1) / max1;\n      return hsv;\n}\nvec3 hsv2rgb(vec3 hsv) {\n      float R,G,B;\n      if(hsv.y == 0.0) {\n          R = G = B = hsv.z;\n      }\n      else {\n          hsv.x = hsv.x/60.0;\n          int i = int(hsv.x);\n          float f = hsv.x - float(i);\n          float a = hsv.z * ( 1.0 - hsv.y );\n          float b = hsv.z * ( 1.0 - hsv.y * f );\n          float c = hsv.z * ( 1.0 - hsv.y * (1.0 - f ) );\n          if(i == 0) {\n              R = hsv.z; G = c; B = a;\n          }\n          else if(i == 1) {\n              R = b; G = hsv.z; B = a;\n          }\n          else if(i == 2) {\n              R = a; G = hsv.z; B = c;\n          }\n          else if(i == 3) {\n              R = a; G = b; B = hsv.z;\n          }\n          else if(i == 4) {\n              R = c; G = a; B = hsv.z;\n          }\n          else {\n              R = hsv.z; G = a; B = b;\n          }\n      }\n      return vec3(R,G,B);\n}\n  vec4 frag () {\n      vec4 o = vec4(1, 1, 1, 1);\n      #if USE_TEXTURE\n          o *= CCSampleWithAlphaSeparated(cc_spriteTexture, uv0);\n          o.rgb += brightness;\n          if(hue != 0.0) {\n              vec3 hsv = rgb2hsv(o.xyz);\n              hsv.x += hue;\n              hsv.x = mod(hsv.x, 360.0);\n              o.xyz = hsv2rgb(hsv.xyz);\n          }\n          if(saturation != 1.0) {\n              float gray = 0.2126 * o.r + 0.7152 * o.g + 0.0722 * o.b;\n              vec3 grayColor = vec3(gray ,gray ,gray);\n              o.rgb = mix(grayColor , o.rgb , saturation);\n          }\n          if(contrast != 1.0) {\n              vec3 avgColor = vec3(0.5 , 0.5 , 0.5);\n              o.rgb = mix(avgColor , o.rgb , contrast);\n          }\n      #endif\n      o *= color;\n      ALPHA_TEST(o);\n      return o;\n  }\nlayout(location = 0) out vec4 cc_FragColor;\nvoid main() { cc_FragColor = frag(); }"
          },
          "glsl3": {
            "vert": "\nprecision highp float;\nlayout(std140) uniform CCGlobal {\n  highp   vec4 cc_time;\n  mediump vec4 cc_screenSize;\n  mediump vec4 cc_nativeSize;\n  mediump vec4 cc_debug_view_mode;\n  mediump vec4 cc_debug_view_composite_pack_1;\n  mediump vec4 cc_debug_view_composite_pack_2;\n  mediump vec4 cc_debug_view_composite_pack_3;\n};\nlayout(std140) uniform CCCamera {\n  highp   mat4 cc_matView;\n  highp   mat4 cc_matViewInv;\n  highp   mat4 cc_matProj;\n  highp   mat4 cc_matProjInv;\n  highp   mat4 cc_matViewProj;\n  highp   mat4 cc_matViewProjInv;\n  highp   vec4 cc_cameraPos;\n  mediump vec4 cc_surfaceTransform;\n  mediump vec4 cc_screenScale;\n  mediump vec4 cc_exposure;\n  mediump vec4 cc_mainLitDir;\n  mediump vec4 cc_mainLitColor;\n  mediump vec4 cc_ambientSky;\n  mediump vec4 cc_ambientGround;\n  mediump vec4 cc_fogColor;\n  mediump vec4 cc_fogBase;\n  mediump vec4 cc_fogAdd;\n  mediump vec4 cc_nearFar;\n  mediump vec4 cc_viewPort;\n};\n#if USE_LOCAL\n  layout(std140) uniform CCLocal {\n    highp mat4 cc_matWorld;\n    highp mat4 cc_matWorldIT;\n    highp vec4 cc_lightingMapUVParam;\n    highp vec4 cc_localShadowBias;\n  };\n#endif\n#if SAMPLE_FROM_RT\n  #define QUATER_PI         0.78539816340\n  #define HALF_PI           1.57079632679\n  #define PI                3.14159265359\n  #define PI2               6.28318530718\n  #define PI4               12.5663706144\n  #define INV_QUATER_PI     1.27323954474\n  #define INV_HALF_PI       0.63661977237\n  #define INV_PI            0.31830988618\n  #define INV_PI2           0.15915494309\n  #define INV_PI4           0.07957747155\n  #define EPSILON           1e-6\n  #define EPSILON_LOWP      1e-4\n  #define LOG2              1.442695\n  #define EXP_VALUE         2.71828183f\n  #define FP_MAX            65504.0\n  #define FP_SCALE          0.0009765625\n  #define FP_SCALE_INV      1024.0\n  #define GRAY_VECTOR       vec3(0.299, 0.587, 0.114)\n      #define LIGHT_MAP_TYPE_DISABLED 0\n  #define LIGHT_MAP_TYPE_ALL_IN_ONE 1\n  #define LIGHT_MAP_TYPE_INDIRECT_OCCLUSION 2\n  #define REFLECTION_PROBE_TYPE_NONE 0\n  #define REFLECTION_PROBE_TYPE_CUBE 1\n  #define REFLECTION_PROBE_TYPE_PLANAR 2\n  #define LIGHT_TYPE_DIRECTIONAL 0.0\n  #define LIGHT_TYPE_SPHERE 1.0\n  #define LIGHT_TYPE_SPOT 2.0\n  #define IS_DIRECTIONAL_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_DIRECTIONAL)) < EPSILON)\n  #define IS_SPHERE_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_SPHERE)) < EPSILON)\n  #define IS_SPOT_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_SPOT)) < EPSILON)\n#endif\nin vec3 a_position;\nin vec2 a_texCoord;\nin vec4 a_color;\nout vec4 color;\nout vec2 uv0;\nvec4 vert () {\n  vec4 pos = vec4(a_position, 1);\n  #if USE_LOCAL\n    pos = cc_matWorld * pos;\n  #endif\n  #if USE_PIXEL_ALIGNMENT\n    pos = cc_matView * pos;\n    pos.xyz = floor(pos.xyz);\n    pos = cc_matProj * pos;\n  #else\n    pos = cc_matViewProj * pos;\n  #endif\n  uv0 = a_texCoord;\n  #if SAMPLE_FROM_RT\n    uv0 = cc_cameraPos.w > 1.0 ? vec2(uv0.x, 1.0 - uv0.y) : uv0;\n  #endif\n  color = a_color;\n  return pos;\n}\nvoid main() { gl_Position = vert(); }",
            "frag": "\nprecision highp float;\nvec4 CCSampleWithAlphaSeparated(sampler2D tex, vec2 uv) {\n#if CC_USE_EMBEDDED_ALPHA\n  return vec4(texture(tex, uv).rgb, texture(tex, uv + vec2(0.0, 0.5)).r);\n#else\n  return texture(tex, uv);\n#endif\n}\n#if USE_ALPHA_TEST\n  layout(std140) uniform ALPHA_TEST_DATA {\n    float alphaThreshold;\n  };\n#endif\nvoid ALPHA_TEST (in vec4 color) {\n  #if USE_ALPHA_TEST\n    if (color.a < alphaThreshold) discard;\n  #endif\n}\nvoid ALPHA_TEST (in float alpha) {\n  #if USE_ALPHA_TEST\n    if (alpha < alphaThreshold) discard;\n  #endif\n}\nin vec4 color;\nlayout(std140) uniform Constant{\n  float brightness;\n  float saturation;\n  float contrast;\n  float hue;\n};\n#if USE_TEXTURE\n  in vec2 uv0;\n  uniform sampler2D cc_spriteTexture;\n#endif\n  vec3 rgb2hsv(vec3 rgb) {\n      float R = rgb.x, G = rgb.y, B = rgb.z;\n      vec3 hsv;\n      float max1 = max(R,max(G,B));\n      float min1 = min(R,min(G,B));\n      if (R == max1) {\n          hsv.x = (G-B)/(max1-min1);\n      }\n      if (G == max1) {\n          hsv.x = 2.0 + (B-R)/(max1-min1);\n      }\n      if (B == max1) {\n          hsv.x = 4.0 + (R-G)/(max1-min1);\n      }\n      hsv.x = hsv.x * 60.0;\n      if (hsv.x < 0.0) {\n          hsv.x = hsv.x + 360.0;\n      }\n      hsv.z = max1;\n      hsv.y = (max1 - min1) / max1;\n      return hsv;\n}\nvec3 hsv2rgb(vec3 hsv) {\n      float R,G,B;\n      if(hsv.y == 0.0) {\n          R = G = B = hsv.z;\n      }\n      else {\n          hsv.x = hsv.x/60.0;\n          int i = int(hsv.x);\n          float f = hsv.x - float(i);\n          float a = hsv.z * ( 1.0 - hsv.y );\n          float b = hsv.z * ( 1.0 - hsv.y * f );\n          float c = hsv.z * ( 1.0 - hsv.y * (1.0 - f ) );\n          if(i == 0) {\n              R = hsv.z; G = c; B = a;\n          }\n          else if(i == 1) {\n              R = b; G = hsv.z; B = a;\n          }\n          else if(i == 2) {\n              R = a; G = hsv.z; B = c;\n          }\n          else if(i == 3) {\n              R = a; G = b; B = hsv.z;\n          }\n          else if(i == 4) {\n              R = c; G = a; B = hsv.z;\n          }\n          else {\n              R = hsv.z; G = a; B = b;\n          }\n      }\n      return vec3(R,G,B);\n}\n  vec4 frag () {\n      vec4 o = vec4(1, 1, 1, 1);\n      #if USE_TEXTURE\n          o *= CCSampleWithAlphaSeparated(cc_spriteTexture, uv0);\n          o.rgb += brightness;\n          if(hue != 0.0) {\n              vec3 hsv = rgb2hsv(o.xyz);\n              hsv.x += hue;\n              hsv.x = mod(hsv.x, 360.0);\n              o.xyz = hsv2rgb(hsv.xyz);\n          }\n          if(saturation != 1.0) {\n              float gray = 0.2126 * o.r + 0.7152 * o.g + 0.0722 * o.b;\n              vec3 grayColor = vec3(gray ,gray ,gray);\n              o.rgb = mix(grayColor , o.rgb , saturation);\n          }\n          if(contrast != 1.0) {\n              vec3 avgColor = vec3(0.5 , 0.5 , 0.5);\n              o.rgb = mix(avgColor , o.rgb , contrast);\n          }\n      #endif\n      o *= color;\n      ALPHA_TEST(o);\n      return o;\n  }\nlayout(location = 0) out vec4 cc_FragColor;\nvoid main() { cc_FragColor = frag(); }"
          },
          "glsl1": {
            "vert": "\nprecision highp float;\nuniform highp mat4 cc_matView;\n  uniform highp mat4 cc_matProj;\n  uniform highp mat4 cc_matViewProj;\n  uniform highp vec4 cc_cameraPos;\n#if USE_LOCAL\n  uniform highp mat4 cc_matWorld;\n#endif\n#if SAMPLE_FROM_RT\n  #define QUATER_PI         0.78539816340\n  #define HALF_PI           1.57079632679\n  #define PI                3.14159265359\n  #define PI2               6.28318530718\n  #define PI4               12.5663706144\n  #define INV_QUATER_PI     1.27323954474\n  #define INV_HALF_PI       0.63661977237\n  #define INV_PI            0.31830988618\n  #define INV_PI2           0.15915494309\n  #define INV_PI4           0.07957747155\n  #define EPSILON           1e-6\n  #define EPSILON_LOWP      1e-4\n  #define LOG2              1.442695\n  #define EXP_VALUE         2.71828183f\n  #define FP_MAX            65504.0\n  #define FP_SCALE          0.0009765625\n  #define FP_SCALE_INV      1024.0\n  #define GRAY_VECTOR       vec3(0.299, 0.587, 0.114)\n      #define LIGHT_MAP_TYPE_DISABLED 0\n  #define LIGHT_MAP_TYPE_ALL_IN_ONE 1\n  #define LIGHT_MAP_TYPE_INDIRECT_OCCLUSION 2\n  #define REFLECTION_PROBE_TYPE_NONE 0\n  #define REFLECTION_PROBE_TYPE_CUBE 1\n  #define REFLECTION_PROBE_TYPE_PLANAR 2\n  #define LIGHT_TYPE_DIRECTIONAL 0.0\n  #define LIGHT_TYPE_SPHERE 1.0\n  #define LIGHT_TYPE_SPOT 2.0\n  #define IS_DIRECTIONAL_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_DIRECTIONAL)) < EPSILON)\n  #define IS_SPHERE_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_SPHERE)) < EPSILON)\n  #define IS_SPOT_LIGHT(light_type) (abs(float(light_type) - float(LIGHT_TYPE_SPOT)) < EPSILON)\n#endif\nattribute vec3 a_position;\nattribute vec2 a_texCoord;\nattribute vec4 a_color;\nvarying vec4 color;\nvarying vec2 uv0;\nvec4 vert () {\n  vec4 pos = vec4(a_position, 1);\n  #if USE_LOCAL\n    pos = cc_matWorld * pos;\n  #endif\n  #if USE_PIXEL_ALIGNMENT\n    pos = cc_matView * pos;\n    pos.xyz = floor(pos.xyz);\n    pos = cc_matProj * pos;\n  #else\n    pos = cc_matViewProj * pos;\n  #endif\n  uv0 = a_texCoord;\n  #if SAMPLE_FROM_RT\n    uv0 = cc_cameraPos.w > 1.0 ? vec2(uv0.x, 1.0 - uv0.y) : uv0;\n  #endif\n  color = a_color;\n  return pos;\n}\nvoid main() { gl_Position = vert(); }",
            "frag": "\nprecision highp float;\nvec4 CCSampleWithAlphaSeparated(sampler2D tex, vec2 uv) {\n#if CC_USE_EMBEDDED_ALPHA\n  return vec4(texture2D(tex, uv).rgb, texture2D(tex, uv + vec2(0.0, 0.5)).r);\n#else\n  return texture2D(tex, uv);\n#endif\n}\n#if USE_ALPHA_TEST\n      uniform float alphaThreshold;\n#endif\nvoid ALPHA_TEST (in vec4 color) {\n  #if USE_ALPHA_TEST\n    if (color.a < alphaThreshold) discard;\n  #endif\n}\nvoid ALPHA_TEST (in float alpha) {\n  #if USE_ALPHA_TEST\n    if (alpha < alphaThreshold) discard;\n  #endif\n}\nvarying vec4 color;\n   uniform float brightness;\n   uniform float saturation;\n   uniform float contrast;\n   uniform float hue;\n#if USE_TEXTURE\n  varying vec2 uv0;\n  uniform sampler2D cc_spriteTexture;\n#endif\n  vec3 rgb2hsv(vec3 rgb) {\n      float R = rgb.x, G = rgb.y, B = rgb.z;\n      vec3 hsv;\n      float max1 = max(R,max(G,B));\n      float min1 = min(R,min(G,B));\n      if (R == max1) {\n          hsv.x = (G-B)/(max1-min1);\n      }\n      if (G == max1) {\n          hsv.x = 2.0 + (B-R)/(max1-min1);\n      }\n      if (B == max1) {\n          hsv.x = 4.0 + (R-G)/(max1-min1);\n      }\n      hsv.x = hsv.x * 60.0;\n      if (hsv.x < 0.0) {\n          hsv.x = hsv.x + 360.0;\n      }\n      hsv.z = max1;\n      hsv.y = (max1 - min1) / max1;\n      return hsv;\n}\nvec3 hsv2rgb(vec3 hsv) {\n      float R,G,B;\n      if(hsv.y == 0.0) {\n          R = G = B = hsv.z;\n      }\n      else {\n          hsv.x = hsv.x/60.0;\n          int i = int(hsv.x);\n          float f = hsv.x - float(i);\n          float a = hsv.z * ( 1.0 - hsv.y );\n          float b = hsv.z * ( 1.0 - hsv.y * f );\n          float c = hsv.z * ( 1.0 - hsv.y * (1.0 - f ) );\n          if(i == 0) {\n              R = hsv.z; G = c; B = a;\n          }\n          else if(i == 1) {\n              R = b; G = hsv.z; B = a;\n          }\n          else if(i == 2) {\n              R = a; G = hsv.z; B = c;\n          }\n          else if(i == 3) {\n              R = a; G = b; B = hsv.z;\n          }\n          else if(i == 4) {\n              R = c; G = a; B = hsv.z;\n          }\n          else {\n              R = hsv.z; G = a; B = b;\n          }\n      }\n      return vec3(R,G,B);\n}\n  vec4 frag () {\n      vec4 o = vec4(1, 1, 1, 1);\n      #if USE_TEXTURE\n          o *= CCSampleWithAlphaSeparated(cc_spriteTexture, uv0);\n          o.rgb += brightness;\n          if(hue != 0.0) {\n              vec3 hsv = rgb2hsv(o.xyz);\n              hsv.x += hue;\n              hsv.x = mod(hsv.x, 360.0);\n              o.xyz = hsv2rgb(hsv.xyz);\n          }\n          if(saturation != 1.0) {\n              float gray = 0.2126 * o.r + 0.7152 * o.g + 0.0722 * o.b;\n              vec3 grayColor = vec3(gray ,gray ,gray);\n              o.rgb = mix(grayColor , o.rgb , saturation);\n          }\n          if(contrast != 1.0) {\n              vec3 avgColor = vec3(0.5 , 0.5 , 0.5);\n              o.rgb = mix(avgColor , o.rgb , contrast);\n          }\n      #endif\n      o *= color;\n      ALPHA_TEST(o);\n      return o;\n  }\nvoid main() { gl_FragColor = frag(); }"
          },
          "builtins": {
            "globals": {
              "blocks": [
                {
                  "name": "CCGlobal",
                  "defines": []
                },
                {
                  "name": "CCCamera",
                  "defines": []
                }
              ],
              "samplerTextures": [],
              "buffers": [],
              "images": []
            },
            "locals": {
              "blocks": [
                {
                  "name": "CCLocal",
                  "defines": [
                    "USE_LOCAL"
                  ]
                }
              ],
              "samplerTextures": [
                {
                  "name": "cc_spriteTexture",
                  "defines": [
                    "USE_TEXTURE"
                  ]
                }
              ],
              "buffers": [],
              "images": []
            },
            "statistics": {
              "CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS": 54,
              "CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS": 5
            }
          },
          "defines": [
            {
              "name": "USE_LOCAL",
              "type": "boolean",
              "defines": []
            },
            {
              "name": "SAMPLE_FROM_RT",
              "type": "boolean",
              "defines": []
            },
            {
              "name": "USE_PIXEL_ALIGNMENT",
              "type": "boolean",
              "defines": []
            },
            {
              "name": "CC_USE_EMBEDDED_ALPHA",
              "type": "boolean",
              "defines": []
            },
            {
              "name": "USE_ALPHA_TEST",
              "type": "boolean",
              "defines": []
            },
            {
              "name": "USE_TEXTURE",
              "type": "boolean",
              "defines": []
            }
          ],
          "name": "../__test_cases__/gray_test/builtin-sprite-filter|sprite-vs:vert|sprite-fs:frag"
        }
      ]
};
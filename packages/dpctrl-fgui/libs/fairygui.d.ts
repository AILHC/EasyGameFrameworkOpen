declare namespace fgui {
    class AssetProxy {
        private _asset;
        constructor();
        private static _inst;
        static readonly inst: AssetProxy;
        getRes(url: string): any;
        load(url: any, complete?: Laya.Handler, progress?: Laya.Handler, type?: string, priority?: number, cache?: boolean): void;
        setAsset(asset: any): void;
    }
}
declare namespace fgui {
    class AsyncOperation {
        /**
         * this.callback(obj:GObject)
         */
        callback: Laya.Handler;
        private _itemList;
        private _objectPool;
        private _index;
        constructor();
        createObject(pkgName: string, resName: string): void;
        createObjectFromURL(url: string): void;
        cancel(): void;
        private internalCreateObject;
        private collectComponentChildren;
        private collectListChildren;
        private run;
    }
}
declare namespace fgui {
    class Controller extends Laya.EventDispatcher {
        private _selectedIndex;
        private _previousIndex;
        private _pageIds;
        private _pageNames;
        private _actions?;
        name: string;
        parent: GComponent;
        autoRadioGroupDepth?: boolean;
        changing: boolean;
        constructor();
        dispose(): void;
        selectedIndex: number;
        /**
         * 功能和设置selectedIndex一样，但不会触发事件
         */
        setSelectedIndex(value: number): void;
        readonly previsousIndex: number;
        selectedPage: string;
        /**
         * 功能和设置selectedPage一样，但不会触发事件
         */
        setSelectedPage(value: string): void;
        readonly previousPage: string;
        readonly pageCount: number;
        getPageName(index: number): string;
        addPage(name: string): void;
        addPageAt(name: string, index: number): void;
        removePage(name: string): void;
        removePageAt(index: number): void;
        clearPages(): void;
        hasPage(aName: string): boolean;
        getPageIndexById(aId: string): number;
        getPageIdByName(aName: string): string;
        getPageNameById(aId: string): string;
        getPageId(index: number): string;
        selectedPageId: string;
        oppositePageId: string;
        readonly previousPageId: string;
        runActions(): void;
        setup(buffer: ByteBuffer): void;
    }
}
declare namespace fgui {
    class DragDropManager {
        private _agent;
        private _sourceData;
        private static _inst;
        static readonly inst: DragDropManager;
        constructor();
        readonly dragAgent: GObject;
        readonly dragging: boolean;
        startDrag(source: GObject, icon: string, sourceData?: any, touchID?: number): void;
        cancel(): void;
        private __dragEnd;
    }
}
declare namespace fgui {
    class Events {
        static STATE_CHANGED: string;
        static XY_CHANGED: string;
        static SIZE_CHANGED: string;
        static SIZE_DELAY_CHANGE: string;
        static CLICK_ITEM: string;
        static SCROLL: string;
        static SCROLL_END: string;
        static DROP: string;
        static DRAG_START: string;
        static DRAG_MOVE: string;
        static DRAG_END: string;
        static PULL_DOWN_RELEASE: string;
        static PULL_UP_RELEASE: string;
        static GEAR_STOP: string;
        static $event: Laya.Event;
        static createEvent(type: string, target: Laya.Sprite, source?: {
            target?: Laya.Sprite;
            touchId?: number;
        }): Laya.Event;
        static dispatch(type: string, target: Laya.Sprite, source?: {
            target?: Laya.Sprite;
            touchId?: number;
        }): void;
    }
}
declare namespace fgui {
    enum ButtonMode {
        Common = 0,
        Check = 1,
        Radio = 2
    }
    enum AutoSizeType {
        None = 0,
        Both = 1,
        Height = 2
    }
    enum AlignType {
        Left = 0,
        Center = 1,
        Right = 2
    }
    enum VertAlignType {
        Top = 0,
        Middle = 1,
        Bottom = 2
    }
    enum LoaderFillType {
        None = 0,
        Scale = 1,
        ScaleMatchHeight = 2,
        ScaleMatchWidth = 3,
        ScaleFree = 4,
        ScaleNoBorder = 5
    }
    enum ListLayoutType {
        SingleColumn = 0,
        SingleRow = 1,
        FlowHorizontal = 2,
        FlowVertical = 3,
        Pagination = 4
    }
    enum ListSelectionMode {
        Single = 0,
        Multiple = 1,
        Multiple_SingleClick = 2,
        None = 3
    }
    enum OverflowType {
        Visible = 0,
        Hidden = 1,
        Scroll = 2
    }
    enum PackageItemType {
        Image = 0,
        MovieClip = 1,
        Sound = 2,
        Component = 3,
        Atlas = 4,
        Font = 5,
        Swf = 6,
        Misc = 7,
        Unknown = 8,
        Spine = 9,
        DragonBones = 10
    }
    enum ObjectType {
        Image = 0,
        MovieClip = 1,
        Swf = 2,
        Graph = 3,
        Loader = 4,
        Group = 5,
        Text = 6,
        RichText = 7,
        InputText = 8,
        Component = 9,
        List = 10,
        Label = 11,
        Button = 12,
        ComboBox = 13,
        ProgressBar = 14,
        Slider = 15,
        ScrollBar = 16,
        Tree = 17,
        Loader3D = 18
    }
    enum ProgressTitleType {
        Percent = 0,
        ValueAndMax = 1,
        Value = 2,
        Max = 3
    }
    enum ScrollBarDisplayType {
        Default = 0,
        Visible = 1,
        Auto = 2,
        Hidden = 3
    }
    enum ScrollType {
        Horizontal = 0,
        Vertical = 1,
        Both = 2
    }
    enum FlipType {
        None = 0,
        Horizontal = 1,
        Vertical = 2,
        Both = 3
    }
    enum ChildrenRenderOrder {
        Ascent = 0,
        Descent = 1,
        Arch = 2
    }
    enum GroupLayoutType {
        None = 0,
        Horizontal = 1,
        Vertical = 2
    }
    enum PopupDirection {
        Auto = 0,
        Up = 1,
        Down = 2
    }
    enum RelationType {
        Left_Left = 0,
        Left_Center = 1,
        Left_Right = 2,
        Center_Center = 3,
        Right_Left = 4,
        Right_Center = 5,
        Right_Right = 6,
        Top_Top = 7,
        Top_Middle = 8,
        Top_Bottom = 9,
        Middle_Middle = 10,
        Bottom_Top = 11,
        Bottom_Middle = 12,
        Bottom_Bottom = 13,
        Width = 14,
        Height = 15,
        LeftExt_Left = 16,
        LeftExt_Right = 17,
        RightExt_Left = 18,
        RightExt_Right = 19,
        TopExt_Top = 20,
        TopExt_Bottom = 21,
        BottomExt_Top = 22,
        BottomExt_Bottom = 23,
        Size = 24
    }
    enum FillMethod {
        None = 0,
        Horizontal = 1,
        Vertical = 2,
        Radial90 = 3,
        Radial180 = 4,
        Radial360 = 5
    }
    enum FillOrigin {
        Top = 0,
        Bottom = 1,
        Left = 2,
        Right = 3,
        TopLeft = 0,
        TopRight = 1,
        BottomLeft = 2,
        BottomRight = 3
    }
    enum FillOrigin90 {
        TopLeft = 0,
        TopRight = 1,
        BottomLeft = 2,
        BottomRight = 3
    }
    enum ObjectPropID {
        Text = 0,
        Icon = 1,
        Color = 2,
        OutlineColor = 3,
        Playing = 4,
        Frame = 5,
        DeltaTime = 6,
        TimeScale = 7,
        FontSize = 8,
        Selected = 9
    }
}
declare namespace fgui {
    class GObject {
        data: Object;
        packageItem: PackageItem;
        static draggingObject: GObject;
        private _x;
        private _y;
        private _alpha;
        private _rotation;
        private _visible;
        private _touchable;
        private _grayed;
        private _draggable?;
        private _scaleX;
        private _scaleY;
        private _skewX;
        private _skewY;
        private _pivotX;
        private _pivotY;
        private _pivotAsAnchor;
        private _pivotOffsetX;
        private _pivotOffsetY;
        private _sortingOrder;
        private _internalVisible;
        private _handlingController?;
        private _tooltips?;
        private _pixelSnapping?;
        private _relations;
        private _group?;
        private _gears;
        private _dragBounds?;
        private _dragTesting?;
        private _dragStartPos?;
        protected _displayObject: Laya.Sprite;
        protected _yOffset: number;
        minWidth: number;
        minHeight: number;
        maxWidth: number;
        maxHeight: number;
        sourceWidth: number;
        sourceHeight: number;
        initWidth: number;
        initHeight: number;
        _parent: GComponent;
        _width: number;
        _height: number;
        _rawWidth: number;
        _rawHeight: number;
        _id: string;
        _name: string;
        _underConstruct: boolean;
        _gearLocked?: boolean;
        _sizePercentInGroup: number;
        _treeNode?: GTreeNode;
        constructor();
        readonly id: string;
        name: string;
        x: number;
        y: number;
        setXY(xv: number, yv: number): void;
        xMin: number;
        yMin: number;
        pixelSnapping: boolean;
        center(restraint?: boolean): void;
        width: number;
        height: number;
        setSize(wv: number, hv: number, ignorePivot?: boolean): void;
        ensureSizeCorrect(): void;
        makeFullScreen(): void;
        readonly actualWidth: number;
        readonly actualHeight: number;
        scaleX: number;
        scaleY: number;
        setScale(sx: number, sy: number): void;
        skewX: number;
        skewY: number;
        setSkew(sx: number, sy: number): void;
        pivotX: number;
        pivotY: number;
        setPivot(xv: number, yv?: number, asAnchor?: boolean): void;
        readonly pivotAsAnchor: boolean;
        protected internalSetPivot(xv: number, yv: number, asAnchor: boolean): void;
        private updatePivotOffset;
        private applyPivot;
        touchable: boolean;
        grayed: boolean;
        enabled: boolean;
        rotation: number;
        readonly normalizeRotation: number;
        alpha: number;
        visible: boolean;
        readonly internalVisible: boolean;
        readonly internalVisible2: boolean;
        readonly internalVisible3: boolean;
        sortingOrder: number;
        readonly focused: boolean;
        requestFocus(): void;
        tooltips: string;
        private __rollOver;
        private __doShowTooltips;
        private __rollOut;
        blendMode: string;
        filters: any[];
        readonly inContainer: boolean;
        readonly onStage: boolean;
        readonly resourceURL: string;
        group: GGroup;
        getGear(index: number): GearBase;
        protected updateGear(index: number): void;
        checkGearController(index: number, c: Controller): boolean;
        updateGearFromRelations(index: number, dx: number, dy: number): void;
        addDisplayLock(): number;
        releaseDisplayLock(token: number): void;
        private checkGearDisplay;
        readonly relations: Relations;
        addRelation(target: GObject, relationType: number, usePercent?: boolean): void;
        removeRelation(target: GObject, relationType?: number): void;
        readonly displayObject: Laya.Sprite;
        parent: GComponent;
        removeFromParent(): void;
        readonly root: GRoot;
        readonly asCom: GComponent;
        readonly asButton: GButton;
        readonly asLabel: GLabel;
        readonly asProgress: GProgressBar;
        readonly asTextField: GTextField;
        readonly asRichTextField: GRichTextField;
        readonly asTextInput: GTextInput;
        readonly asLoader: GLoader;
        readonly asList: GList;
        readonly asTree: GTree;
        readonly asGraph: GGraph;
        readonly asGroup: GGroup;
        readonly asSlider: GSlider;
        readonly asComboBox: GComboBox;
        readonly asImage: GImage;
        readonly asMovieClip: GMovieClip;
        text: string;
        icon: string;
        readonly treeNode: GTreeNode;
        readonly isDisposed: boolean;
        dispose(): void;
        /**
         * 不推荐使用此接口
         * 推荐使用m.uiMgr.addTap进行事件绑定
         * @param thisObj 
         * @param listener 
         * @param args 
         */
        onClick(thisObj: any, listener: Function, args?: any[]): void;
        offClick(thisObj: any, listener: Function): void;
        hasClickListener(): boolean;
        on(type: string, thisObject: any, listener: Function, args?: any[]): void;
        off(type: string, thisObject: any, listener: Function): void;
        draggable: boolean;
        dragBounds: Laya.Rectangle;
        startDrag(touchID?: number): void;
        stopDrag(): void;
        readonly dragging: boolean;
        localToGlobal(ax?: number, ay?: number, result?: Laya.Point): Laya.Point;
        globalToLocal(ax?: number, ay?: number, result?: Laya.Point): Laya.Point;
        localToGlobalRect(ax?: number, ay?: number, aw?: number, ah?: number, result?: Laya.Rectangle): Laya.Rectangle;
        globalToLocalRect(ax?: number, ay?: number, aw?: number, ah?: number, result?: Laya.Rectangle): Laya.Rectangle;
        handleControllerChanged(c: Controller): void;
        protected createDisplayObject(): void;
        protected handleXYChanged(): void;
        protected handleSizeChanged(): void;
        protected handleScaleChanged(): void;
        protected handleGrayedChanged(): void;
        protected handleAlphaChanged(): void;
        handleVisibleChanged(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        constructFromResource(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        private initDrag;
        private dragBegin;
        private dragEnd;
        private reset;
        private __begin;
        private __moving;
        private __end;
        static cast(sprite: Laya.Sprite): GObject;
    }
    const BlendMode: {
        2: string;
        3: string;
        4: string;
    };
}
declare namespace fgui {
    class GTextField extends GObject {
        protected _templateVars: {
            [index: string]: string;
        };
        protected _text: string;
        protected _autoSize: number;
        protected _widthAutoSize: boolean;
        protected _heightAutoSize: boolean;
        protected _ubbEnabled: boolean;
        protected _updatingSize: boolean;
        constructor();
        font: string;
        fontSize: number;
        color: string;
        align: string;
        valign: string;
        leading: number;
        letterSpacing: number;
        bold: boolean;
        italic: boolean;
        underline: boolean;
        singleLine: boolean;
        stroke: number;
        strokeColor: string;
        ubbEnabled: boolean;
        autoSize: number;
        protected updateAutoSize(): void;
        readonly textWidth: number;
        protected parseTemplate(template: string): string;
        templateVars: {
            [index: string]: string;
        };
        setVar(name: string, value: string): GTextField;
        flushVars(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare namespace fgui {
    class GBasicTextField extends GTextField {
        private _textField;
        private _font;
        private _color;
        private _singleLine;
        private _letterSpacing;
        private _textWidth;
        private _textHeight;
        private _bitmapFont?;
        private _lines?;
        constructor();
        protected createDisplayObject(): void;
        readonly nativeText: Laya.Text;
        text: string;
        font: string;
        fontSize: number;
        color: string;
        align: string;
        valign: string;
        leading: number;
        letterSpacing: number;
        bold: boolean;
        italic: boolean;
        underline: boolean;
        singleLine: boolean;
        stroke: number;
        strokeColor: string;
        protected updateAutoSize(): void;
        readonly textWidth: number;
        ensureSizeCorrect(): void;
        typeset(): void;
        private updateSize;
        private renderWithBitmapFont;
        protected handleSizeChanged(): void;
        protected handleGrayedChanged(): void;
        private doAlign;
        flushVars(): void;
    }
    interface LineInfo {
        width: number;
        height: number;
        textHeight: number;
        text: string;
        y: number;
    }
}
declare namespace fgui {
    class Margin {
        left: number;
        right: number;
        top: number;
        bottom: number;
        copy(source: Margin): void;
    }
}
declare namespace fgui {
    class GComponent extends GObject {
        private _sortingChildCount;
        private _opaque;
        private _applyingController?;
        private _mask?;
        protected _margin: Margin;
        protected _trackBounds: boolean;
        protected _boundsChanged: boolean;
        protected _childrenRenderOrder: number;
        protected _apexIndex: number;
        _buildingDisplayList: boolean;
        _children: GObject[];
        _controllers: Controller[];
        _transitions: Transition[];
        _container: Laya.Sprite;
        _scrollPane?: ScrollPane;
        _alignOffset: Laya.Point;
        constructor();
        protected createDisplayObject(): void;
        dispose(): void;
        readonly displayListContainer: Laya.Sprite;
        addChild(child: GObject): GObject;
        addChildAt(child: GObject, index: number): GObject;
        private getInsertPosForSortingChild;
        removeChild(child: GObject, dispose?: boolean): GObject;
        removeChildAt(index: number, dispose?: boolean): GObject;
        removeChildren(beginIndex?: number, endIndex?: number, dispose?: boolean): void;
        getChildAt(index: number): GObject;
        getChild(name: string): GObject;
        getChildByPath(path: String): GObject;
        getVisibleChild(name: string): GObject;
        getChildInGroup(name: string, group: GGroup): GObject;
        getChildById(id: string): GObject;
        getChildIndex(child: GObject): number;
        setChildIndex(child: GObject, index: number): void;
        setChildIndexBefore(child: GObject, index: number): number;
        private _setChildIndex;
        swapChildren(child1: GObject, child2: GObject): void;
        swapChildrenAt(index1: number, index2: number): void;
        readonly numChildren: number;
        isAncestorOf(child: GObject): boolean;
        addController(controller: Controller): void;
        getControllerAt(index: number): Controller;
        getController(name: string): Controller;
        removeController(c: Controller): void;
        readonly controllers: Controller[];
        childStateChanged(child: GObject): void;
        private buildNativeDisplayList;
        applyController(c: Controller): void;
        applyAllControllers(): void;
        adjustRadioGroupDepth(obj: GObject, c: Controller): void;
        getTransitionAt(index: number): Transition;
        getTransition(transName: string): Transition;
        isChildInView(child: GObject): boolean;
        getFirstChildInView(): number;
        readonly scrollPane: ScrollPane;
        opaque: boolean;
        margin: Margin;
        childrenRenderOrder: number;
        apexIndex: number;
        mask: Laya.Sprite;
        setMask(value: Laya.Sprite, reversed: boolean): void;
        readonly baseUserData: string;
        protected updateHitArea(): void;
        protected updateMask(): void;
        protected setupScroll(buffer: ByteBuffer): void;
        protected setupOverflow(overflow: number): void;
        protected handleSizeChanged(): void;
        protected handleGrayedChanged(): void;
        handleControllerChanged(c: Controller): void;
        setBoundsChangedFlag(): void;
        private __render;
        ensureBoundsCorrect(): void;
        protected updateBounds(): void;
        setBounds(ax: number, ay: number, aw: number, ah: number): void;
        viewWidth: number;
        viewHeight: number;
        getSnappingPosition(xValue: number, yValue: number, result?: Laya.Point): Laya.Point;
        /**
         * dir正数表示右移或者下移，负数表示左移或者上移
         */
        getSnappingPositionWithDir(xValue: number, yValue: number, xDir: number, yDir: number, result?: Laya.Point): Laya.Point;
        childSortingOrderChanged(child: GObject, oldValue: number, newValue: number): void;
        constructFromResource(): void;
        constructFromResource2(objectPool: GObject[], poolIndex: number): void;
        protected constructExtension(buffer: ByteBuffer): void;
        protected onConstruct(): void;
        protected constructFromXML(xml: Object): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        private ___added;
        private ___removed;
    }
}
declare namespace fgui {
    class GButton extends GComponent {
        protected _titleObject: GObject;
        protected _iconObject: GObject;
        private _mode;
        private _selected;
        private _title;
        private _selectedTitle;
        private _icon;
        private _selectedIcon;
        private _sound;
        private _soundVolumeScale;
        private _buttonController;
        private _relatedController;
        private _relatedPageId;
        private _changeStateOnClick;
        private _linkedPopup?;
        private _downEffect;
        private _downEffectValue;
        private _downScaled?;
        private _down;
        private _over;
        static UP: string;
        static DOWN: string;
        static OVER: string;
        static SELECTED_OVER: string;
        static DISABLED: string;
        static SELECTED_DISABLED: string;
        constructor();
        icon: string;
        selectedIcon: string;
        title: string;
        text: string;
        selectedTitle: string;
        titleColor: string;
        titleFontSize: number;
        sound: string;
        soundVolumeScale: number;
        selected: boolean;
        mode: number;
        relatedController: Controller;
        relatedPageId: string;
        changeStateOnClick: boolean;
        linkedPopup: GObject;
        getTextField(): GTextField;
        fireClick(downEffect?: boolean): void;
        protected setState(val: string): void;
        handleControllerChanged(c: Controller): void;
        protected handleGrayedChanged(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        protected constructExtension(buffer: ByteBuffer): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        private __rollover;
        private __rollout;
        private __mousedown;
        private __mouseup;
        private __click;
    }
}
declare namespace fgui {
    class GComboBox extends GComponent {
        dropdown: GComponent;
        protected _titleObject: GObject;
        protected _iconObject: GObject;
        protected _list: GList;
        protected _items: string[];
        protected _icons?: string[];
        protected _values: string[];
        protected _popupDirection: PopupDirection;
        private _visibleItemCount;
        private _itemsUpdated;
        private _selectedIndex;
        private _buttonController;
        private _selectionController?;
        private _down;
        private _over;
        constructor();
        text: string;
        titleColor: string;
        titleFontSize: number;
        icon: string;
        visibleItemCount: number;
        popupDirection: number;
        items: string[];
        icons: string[];
        values: string[];
        selectedIndex: number;
        value: string;
        getTextField(): GTextField;
        protected setState(val: string): void;
        selectionController: Controller;
        handleControllerChanged(c: Controller): void;
        private updateSelectionController;
        dispose(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        protected constructExtension(buffer: ByteBuffer): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        protected showDropdown(): void;
        private __popupWinClosed;
        private __clickItem;
        private __clickItem2;
        private __rollover;
        private __rollout;
        private __mousedown;
        private __mouseup;
    }
}
declare namespace fgui {
    class GGraph extends GObject {
        private _type;
        private _lineSize;
        private _lineColor;
        private _fillColor;
        private _cornerRadius?;
        private _hitArea?;
        private _sides?;
        private _startAngle?;
        private _polygonPoints?;
        private _distances?;
        constructor();
        drawRect(lineSize: number, lineColor: string, fillColor: string, cornerRadius?: number[]): void;
        drawEllipse(lineSize: number, lineColor: string, fillColor: string): void;
        drawRegularPolygon(lineSize: number, lineColor: string, fillColor: string, sides: number, startAngle?: number, distances?: number[]): void;
        drawPolygon(lineSize: number, lineColor: string, fillColor: string, points: number[]): void;
        distances: number[];
        color: string;
        private updateGraph;
        replaceMe(target: GObject): void;
        addBeforeMe(target: GObject): void;
        addAfterMe(target: GObject): void;
        setNativeObject(obj: Laya.Sprite): void;
        protected createDisplayObject(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        protected handleSizeChanged(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare namespace fgui {
    class GGroup extends GObject {
        private _layout;
        private _lineGap;
        private _columnGap;
        private _excludeInvisibles;
        private _autoSizeDisabled;
        private _mainGridIndex;
        private _mainGridMinSize;
        private _boundsChanged;
        private _percentReady;
        private _mainChildIndex;
        private _totalSize;
        private _numChildren;
        _updating: number;
        constructor();
        dispose(): void;
        layout: number;
        lineGap: number;
        columnGap: number;
        excludeInvisibles: boolean;
        autoSizeDisabled: boolean;
        mainGridMinSize: number;
        mainGridIndex: number;
        setBoundsChangedFlag(positionChangedOnly?: boolean): void;
        ensureSizeCorrect(): void;
        ensureBoundsCorrect(): void;
        private updateBounds;
        private handleLayout;
        moveChildren(dx: number, dy: number): void;
        resizeChildren(dw: number, dh: number): void;
        protected handleAlphaChanged(): void;
        handleVisibleChanged(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare namespace fgui {
    class GImage extends GObject {
        private _image;
        private _flip;
        private _contentItem;
        constructor();
        readonly image: Image;
        color: string;
        flip: number;
        fillMethod: number;
        fillOrigin: number;
        fillClockwise: boolean;
        fillAmount: number;
        protected createDisplayObject(): void;
        constructFromResource(): void;
        protected handleXYChanged(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare namespace fgui {
    class GLabel extends GComponent {
        protected _titleObject: GObject;
        protected _iconObject: GObject;
        constructor();
        icon: string;
        title: string;
        text: string;
        titleColor: string;
        titleFontSize: number;
        color: string;
        editable: boolean;
        getTextField(): GTextField;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        protected constructExtension(buffer: ByteBuffer): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare namespace fgui {
    class GList extends GComponent {
        /**
         * this.itemRenderer(number index, GObject item);
         */
        itemRenderer: Laya.Handler;
        /**
         * this.itemProvider(index:number):string;
         */
        itemProvider: Laya.Handler;
        scrollItemToViewOnClick: boolean;
        foldInvisibleItems: boolean;
        private _layout;
        private _lineCount;
        private _columnCount;
        private _lineGap;
        private _columnGap;
        private _defaultItem;
        private _autoResizeItem;
        private _selectionMode;
        private _align;
        private _verticalAlign;
        private _selectionController?;
        private _lastSelectedIndex;
        private _pool;
        private _virtual?;
        private _loop?;
        private _numItems;
        private _realNumItems;
        private _firstIndex;
        private _curLineItemCount;
        private _curLineItemCount2;
        private _itemSize?;
        private _virtualListChanged;
        private _virtualItems?;
        private _eventLocked?;
        private itemInfoVer;
        constructor();
        dispose(): void;
        layout: number;
        lineCount: number;
        columnCount: number;
        lineGap: number;
        columnGap: number;
        align: string;
        verticalAlign: string;
        virtualItemSize: Laya.Point;
        defaultItem: string;
        autoResizeItem: boolean;
        selectionMode: number;
        selectionController: Controller;
        readonly itemPool: GObjectPool;
        getFromPool(url?: string): GObject;
        returnToPool(obj: GObject): void;
        addChildAt(child: GObject, index: number): GObject;
        addItem(url?: string): GObject;
        addItemFromPool(url?: string): GObject;
        removeChildAt(index: number, dispose?: boolean): GObject;
        removeChildToPoolAt(index: number): void;
        removeChildToPool(child: GObject): void;
        removeChildrenToPool(beginIndex?: number, endIndex?: number): void;
        selectedIndex: number;
        getSelection(result?: number[]): number[];
        addSelection(index: number, scrollItToView?: boolean): void;
        removeSelection(index: number): void;
        clearSelection(): void;
        private clearSelectionExcept;
        selectAll(): void;
        selectNone(): void;
        selectReverse(): void;
        handleArrowKey(dir: number): void;
        private __clickItem;
        protected dispatchItemEvent(item: GObject, evt: Laya.Event): void;
        private setSelectionOnEvent;
        resizeToFit(itemCount?: number, minSize?: number): void;
        getMaxItemWidth(): number;
        protected handleSizeChanged(): void;
        handleControllerChanged(c: Controller): void;
        private updateSelectionController;
        private shouldSnapToNext;
        getSnappingPositionWithDir(xValue: number, yValue: number, xDir: number, yDir: number, result?: Laya.Point): Laya.Point;
        scrollToView(index: number, ani?: boolean, setFirst?: boolean): void;
        getFirstChildInView(): number;
        childIndexToItemIndex(index: number): number;
        itemIndexToChildIndex(index: number): number;
        setVirtual(): void;
        /**
         * Set the list to be virtual list, and has loop behavior.
         */
        setVirtualAndLoop(): void;
        private _setVirtual;
        /**
         * Set the list item count.
         * If the list instanceof not virtual, specified number of items will be created.
         * If the list instanceof virtual, only items in view will be created.
         */
        numItems: number;
        refreshVirtualList(): void;
        private checkVirtualList;
        private setVirtualListChangedFlag;
        private _refreshVirtualList;
        private __scrolled;
        private getIndexOnPos1;
        private getIndexOnPos2;
        private getIndexOnPos3;
        private handleScroll;
        private handleScroll1;
        private handleScroll2;
        private handleScroll3;
        private handleArchOrder1;
        private handleArchOrder2;
        private handleAlign;
        protected updateBounds(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        protected readItems(buffer: ByteBuffer): void;
        protected setupItem(buffer: ByteBuffer, obj: GObject): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare namespace fgui {
    class GObjectPool {
        private _pool;
        private _count;
        constructor();
        clear(): void;
        readonly count: number;
        getObject(url: string): GObject;
        returnObject(obj: GObject): void;
    }
}
declare namespace fgui {
    class GLoader extends GObject {
        private _url;
        private _align;
        private _valign;
        private _autoSize;
        private _fill;
        private _shrinkOnly;
        private _showErrorSign;
        private _contentItem;
        private _content;
        private _errorSign?;
        private _content2?;
        private _updatingLayout;
        private static _errorSignPool;
        constructor();
        protected createDisplayObject(): void;
        dispose(): void;
        url: string;
        icon: string;
        align: string;
        verticalAlign: string;
        fill: number;
        shrinkOnly: boolean;
        autoSize: boolean;
        playing: boolean;
        frame: number;
        color: string;
        fillMethod: number;
        fillOrigin: number;
        fillClockwise: boolean;
        fillAmount: number;
        showErrorSign: boolean;
        readonly content: MovieClip;
        readonly component: GComponent;
        protected loadContent(): void;
        protected loadFromPackage(itemURL: string): void;
        protected loadExternal(): void;
        protected freeExternal(texture: Laya.Texture): void;
        protected onExternalLoadSuccess(texture: Laya.Texture): void;
        protected onExternalLoadFailed(): void;
        private __getResCompleted;
        private setErrorState;
        private clearErrorState;
        private updateLayout;
        private clearContent;
        protected handleSizeChanged(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare namespace fgui {
    class GLoader3D extends GObject {
        private _url;
        private _align;
        private _verticalAlign;
        private _autoSize;
        private _fill;
        private _shrinkOnly;
        private _playing;
        private _frame;
        private _loop;
        private _animationName;
        private _skinName;
        private _color;
        private _contentItem;
        private _container;
        private _content;
        private _updatingLayout;
        constructor();
        protected createDisplayObject(): void;
        dispose(): void;
        url: string;
        icon: string;
        align: AlignType;
        verticalAlign: VertAlignType;
        fill: LoaderFillType;
        shrinkOnly: boolean;
        autoSize: boolean;
        playing: boolean;
        frame: number;
        animationName: string;
        skinName: string;
        loop: boolean;
        color: string;
        readonly content: Laya.Sprite;
        protected loadContent(): void;
        protected loadFromPackage(itemURL: string): void;
        private onLoaded;
        setSkeleton(skeleton: Laya.Skeleton, anchor?: Laya.Point): void;
        private onChange;
        protected loadExternal(): void;
        private updateLayout;
        private clearContent;
        protected handleSizeChanged(): void;
        protected handleGrayedChanged(): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare namespace fgui {
    class GMovieClip extends GObject {
        private _movieClip;
        constructor();
        color: string;
        protected createDisplayObject(): void;
        playing: boolean;
        frame: number;
        timeScale: number;
        rewind(): void;
        syncStatus(anotherMc: GMovieClip): void;
        advance(timeInMiniseconds: number): void;
        setPlaySettings(start?: number, end?: number, times?: number, endAt?: number, endHandler?: Laya.Handler): void;
        getProp(index: number): any;
        setProp(index: number, value: any): void;
        constructFromResource(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare namespace fgui {
    class GProgressBar extends GComponent {
        private _min;
        private _max;
        private _value;
        private _titleType;
        private _reverse;
        private _titleObject;
        private _aniObject;
        private _barObjectH;
        private _barObjectV;
        private _barMaxWidth;
        private _barMaxHeight;
        private _barMaxWidthDelta;
        private _barMaxHeightDelta;
        private _barStartX;
        private _barStartY;
        constructor();
        titleType: number;
        min: number;
        max: number;
        value: number;
        tweenValue(value: number, duration: number): GTweener;
        update(newValue: number): void;
        private setFillAmount;
        protected constructExtension(buffer: ByteBuffer): void;
        protected handleSizeChanged(): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare namespace fgui {
    class GRichTextField extends GTextField {
        private _div;
        constructor();
        protected createDisplayObject(): void;
        readonly div: Laya.HTMLDivElement;
        text: string;
        font: string;
        fontSize: number;
        color: string;
        align: string;
        valign: string;
        leading: number;
        bold: boolean;
        italic: boolean;
        stroke: number;
        strokeColor: string;
        ubbEnabled: boolean;
        readonly textWidth: number;
        private refresh;
        protected updateAutoSize(): void;
        protected handleSizeChanged(): void;
    }
}
declare namespace fgui {
    class GRoot extends GComponent {
        static contentScaleLevel: number;
        private _modalLayer;
        private _popupStack;
        private _justClosedPopups;
        private _modalWaitPane;
        private _tooltipWin;
        private _defaultTooltipWin;
        private _checkPopups;
        private static _inst;
        static readonly inst: GRoot;
        constructor();
        showWindow(win: Window): void;
        hideWindow(win: Window): void;
        hideWindowImmediately(win: Window): void;
        bringToFront(win: Window): void;
        showModalWait(msg?: string): void;
        closeModalWait(): void;
        closeAllExceptModals(): void;
        closeAllWindows(): void;
        getTopWindow(): Window;
        readonly modalLayer: GGraph;
        readonly hasModalWindow: boolean;
        readonly modalWaiting: boolean;
        showPopup(popup: GObject, target?: GObject, dir?: PopupDirection | boolean): void;
        togglePopup(popup: GObject, target?: GObject, dir?: PopupDirection | boolean): void;
        hidePopup(popup?: GObject): void;
        readonly hasAnyPopup: boolean;
        private closePopup;
        showTooltips(msg: string): void;
        showTooltipsWin(tooltipWin: GObject, position?: Laya.Point): void;
        hideTooltips(): void;
        focus: GObject;
        private setFocus;
        volumeScale: number;
        playOneShotSound(url: string, volumeScale?: number): void;
        private adjustModalLayer;
        private __addedToStage;
        checkPopups(clickTarget: Laya.Sprite): void;
        private __stageMouseDown;
        private __stageMouseUp;
        private __winResize;
        private updateContentScaleLevel;
    }
}
declare namespace fgui {
    class GScrollBar extends GComponent {
        private _grip;
        private _arrowButton1;
        private _arrowButton2;
        private _bar;
        private _target;
        private _vertical;
        private _scrollPerc;
        private _fixedGripSize;
        private _dragOffset;
        private _gripDragging;
        constructor();
        setScrollPane(target: ScrollPane, vertical: boolean): void;
        setDisplayPerc(value: number): void;
        setScrollPerc(val: number): void;
        readonly minSize: number;
        readonly gripDragging: boolean;
        protected constructExtension(buffer: ByteBuffer): void;
        private __gripMouseDown;
        private __gripMouseMove;
        private __gripMouseUp;
        private __arrowButton1Click;
        private __arrowButton2Click;
        private __barMouseDown;
    }
}
declare namespace fgui {
    class GSlider extends GComponent {
        private _min;
        private _max;
        private _value;
        private _titleType;
        private _reverse;
        private _wholeNumbers;
        private _titleObject;
        private _barObjectH;
        private _barObjectV;
        private _barMaxWidth;
        private _barMaxHeight;
        private _barMaxWidthDelta;
        private _barMaxHeightDelta;
        private _gripObject;
        private _clickPos;
        private _clickPercent;
        private _barStartX;
        private _barStartY;
        changeOnClick: boolean;
        /**是否可拖动开关**/
        canDrag: boolean;
        constructor();
        titleType: number;
        wholeNumbers: boolean;
        min: number;
        max: number;
        value: number;
        update(): void;
        private updateWithPercent;
        protected constructExtension(buffer: ByteBuffer): void;
        protected handleSizeChanged(): void;
        setup_afterAdd(buffer: ByteBuffer, beginPos: number): void;
        private __gripMouseDown;
        private __gripMouseMove;
        private __gripMouseUp;
        private __barMouseDown;
    }
}
declare namespace fgui {
    class GTextInput extends GTextField {
        private _input;
        private _prompt;
        constructor();
        protected createDisplayObject(): void;
        readonly nativeInput: Laya.Input;
        text: string;
        font: string;
        fontSize: number;
        color: string;
        align: string;
        valign: string;
        leading: number;
        bold: boolean;
        italic: boolean;
        singleLine: boolean;
        stroke: number;
        strokeColor: string;
        password: boolean;
        keyboardType: string;
        editable: boolean;
        maxLength: number;
        promptText: string;
        restrict: string;
        readonly textWidth: number;
        requestFocus(): void;
        protected handleSizeChanged(): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
    }
}
declare namespace fgui {
    class GTree extends GList {
        /**
         * (node: GTreeNode, obj: GComponent) => void
         */
        treeNodeRender: Laya.Handler;
        /**
         * (node: GTreeNode, expanded: boolean) => void;
         */
        treeNodeWillExpand: Laya.Handler;
        private _indent;
        private _clickToExpand;
        private _rootNode;
        private _expandedStatusInEvt;
        constructor();
        readonly rootNode: GTreeNode;
        indent: number;
        clickToExpand: number;
        getSelectedNode(): GTreeNode;
        getSelectedNodes(result?: Array<GTreeNode>): Array<GTreeNode>;
        selectNode(node: GTreeNode, scrollItToView?: boolean): void;
        unselectNode(node: GTreeNode): void;
        expandAll(folderNode?: GTreeNode): void;
        collapseAll(folderNode?: GTreeNode): void;
        private createCell;
        _afterInserted(node: GTreeNode): void;
        private getInsertIndexForNode;
        _afterRemoved(node: GTreeNode): void;
        _afterExpanded(node: GTreeNode): void;
        _afterCollapsed(node: GTreeNode): void;
        _afterMoved(node: GTreeNode): void;
        private getFolderEndIndex;
        private checkChildren;
        private hideFolderNode;
        private removeNode;
        private __cellMouseDown;
        private __expandedStateChanged;
        protected dispatchItemEvent(item: GObject, evt: Laya.Event): void;
        setup_beforeAdd(buffer: ByteBuffer, beginPos: number): void;
        protected readItems(buffer: ByteBuffer): void;
    }
}
declare namespace fgui {
    class GTreeNode {
        data: any;
        private _parent;
        private _children;
        private _expanded;
        private _level;
        private _tree;
        _cell: GComponent;
        _resURL?: string;
        constructor(hasChild: boolean, resURL?: string);
        expanded: boolean;
        readonly isFolder: boolean;
        readonly parent: GTreeNode;
        text: string;
        icon: string;
        readonly cell: GComponent;
        readonly level: number;
        _setLevel(value: number): void;
        addChild(child: GTreeNode): GTreeNode;
        addChildAt(child: GTreeNode, index: number): GTreeNode;
        removeChild(child: GTreeNode): GTreeNode;
        removeChildAt(index: number): GTreeNode;
        removeChildren(beginIndex?: number, endIndex?: number): void;
        getChildAt(index: number): GTreeNode;
        getChildIndex(child: GTreeNode): number;
        getPrevSibling(): GTreeNode;
        getNextSibling(): GTreeNode;
        setChildIndex(child: GTreeNode, index: number): void;
        swapChildren(child1: GTreeNode, child2: GTreeNode): void;
        swapChildrenAt(index1: number, index2: number): void;
        readonly numChildren: number;
        expandToRoot(): void;
        readonly tree: GTree;
        _setTree(value: GTree): void;
    }
}
declare namespace fgui {
    interface IUISource {
        fileName: string;
        loaded: boolean;
        load(callback: Function, thisObj: any): void;
    }
}
declare namespace fgui {
    class PackageItem {
        owner: UIPackage;
        type: number;
        objectType?: number;
        id: string;
        name: string;
        width: number;
        height: number;
        file: string;
        decoded?: boolean;
        loading?: Array<Function>;
        rawData?: ByteBuffer;
        highResolution?: Array<string>;
        branches?: Array<string>;
        scale9Grid?: Laya.Rectangle;
        scaleByTile?: boolean;
        tileGridIndice?: number;
        smoothing?: boolean;
        texture?: Laya.Texture;
        pixelHitTestData?: PixelHitTestData;
        interval?: number;
        repeatDelay?: number;
        swing?: boolean;
        frames?: Frame[];
        extensionType?: any;
        bitmapFont?: BitmapFont;
        templet?: Laya.Templet;
        skeletonAnchor?: Laya.Point;
        constructor();
        load(): Object;
        getBranch(): PackageItem;
        getHighResolution(): PackageItem;
        toString(): string;
    }
}
declare namespace fgui {
    class PopupMenu {
        protected _contentPane: GComponent;
        protected _list: GList;
        constructor(resourceURL?: string);
        dispose(): void;
        addItem(caption: string, handler?: Laya.Handler): GButton;
        addItemAt(caption: string, index: number, handler?: Laya.Handler): GButton;
        addSeperator(): void;
        getItemName(index: number): string;
        setItemText(name: string, caption: string): void;
        setItemVisible(name: string, visible: boolean): void;
        setItemGrayed(name: string, grayed: boolean): void;
        setItemCheckable(name: string, checkable: boolean): void;
        setItemChecked(name: string, checked: boolean): void;
        isItemChecked(name: string): boolean;
        removeItem(name: string): boolean;
        clearItems(): void;
        readonly itemCount: number;
        readonly contentPane: GComponent;
        readonly list: GList;
        show(target?: GObject, dir?: PopupDirection | boolean): void;
        private __clickItem;
        private __clickItem2;
        private __addedToStage;
    }
}
declare namespace fgui {
    class RelationItem {
        private _owner;
        private _target;
        private _defs;
        private _targetX;
        private _targetY;
        private _targetWidth;
        private _targetHeight;
        constructor(owner: GObject);
        readonly owner: GObject;
        target: GObject;
        add(relationType: number, usePercent: boolean): void;
        internalAdd(relationType: number, usePercent: boolean): void;
        remove(relationType: number): void;
        copyFrom(source: RelationItem): void;
        dispose(): void;
        readonly isEmpty: boolean;
        applyOnSelfResized(dWidth: number, dHeight: number, applyPivot: boolean): void;
        private applyOnXYChanged;
        private applyOnSizeChanged;
        private addRefTarget;
        private releaseRefTarget;
        private __targetXYChanged;
        private __targetSizeChanged;
        private __targetSizeWillChange;
    }
}
declare namespace fgui {
    class Relations {
        private _owner;
        private _items;
        handling: GObject;
        sizeDirty?: boolean;
        constructor(owner: GObject);
        add(target: GObject, relationType: number, usePercent?: boolean): void;
        remove(target: GObject, relationType?: number): void;
        contains(target: GObject): boolean;
        clearFor(target: GObject): void;
        clearAll(): void;
        copyFrom(source: Relations): void;
        dispose(): void;
        onOwnerSizeChanged(dWidth: number, dHeight: number, applyPivot: boolean): void;
        ensureRelationsSizeCorrect(): void;
        readonly empty: boolean;
        setup(buffer: ByteBuffer, parentToChild: boolean): void;
    }
}
declare namespace fgui {
    class ScrollPane {
        private _owner;
        private _container;
        private _maskContainer;
        private _alignContainer?;
        private _scrollType;
        private _scrollStep;
        private _mouseWheelStep;
        private _decelerationRate;
        private _scrollBarMargin;
        private _bouncebackEffect;
        private _touchEffect;
        private _scrollBarDisplayAuto?;
        private _vScrollNone;
        private _hScrollNone;
        private _needRefresh;
        private _refreshBarAxis;
        private _displayOnLeft?;
        private _snapToItem?;
        _displayInDemand?: boolean;
        private _mouseWheelEnabled?;
        private _pageMode?;
        private _inertiaDisabled?;
        private _floating?;
        private _dontClipMargin?;
        private _xPos;
        private _yPos;
        private _viewSize;
        private _contentSize;
        private _overlapSize;
        private _pageSize;
        private _containerPos;
        private _beginTouchPos;
        private _lastTouchPos;
        private _lastTouchGlobalPos;
        private _velocity;
        private _velocityScale;
        private _lastMoveTime;
        private _isHoldAreaDone;
        private _aniFlag;
        _loop: number;
        private _headerLockedSize;
        private _footerLockedSize;
        private _refreshEventDispatching;
        private _dragged;
        private _tweening;
        private _tweenTime;
        private _tweenDuration;
        private _tweenStart;
        private _tweenChange;
        private _pageController?;
        private _hzScrollBar?;
        private _vtScrollBar?;
        private _header?;
        private _footer?;
        static draggingPane: ScrollPane;
        constructor(owner: GComponent);
        setup(buffer: ByteBuffer): void;
        dispose(): void;
        readonly owner: GComponent;
        readonly hzScrollBar: GScrollBar;
        readonly vtScrollBar: GScrollBar;
        readonly header: GComponent;
        readonly footer: GComponent;
        bouncebackEffect: boolean;
        touchEffect: boolean;
        scrollStep: number;
        snapToItem: boolean;
        mouseWheelEnabled: boolean;
        decelerationRate: number;
        readonly isDragged: boolean;
        percX: number;
        setPercX(value: number, ani?: boolean): void;
        percY: number;
        setPercY(value: number, ani?: boolean): void;
        posX: number;
        setPosX(value: number, ani?: boolean): void;
        posY: number;
        setPosY(value: number, ani?: boolean): void;
        readonly contentWidth: number;
        readonly contentHeight: number;
        viewWidth: number;
        viewHeight: number;
        currentPageX: number;
        currentPageY: number;
        setCurrentPageX(value: number, ani?: boolean): void;
        setCurrentPageY(value: number, ani?: boolean): void;
        readonly isBottomMost: boolean;
        readonly isRightMost: boolean;
        pageController: Controller;
        readonly scrollingPosX: number;
        readonly scrollingPosY: number;
        scrollTop(ani?: boolean): void;
        scrollBottom(ani?: boolean): void;
        scrollUp(ratio?: number, ani?: boolean): void;
        scrollDown(ratio?: number, ani?: boolean): void;
        scrollLeft(ratio?: number, ani?: boolean): void;
        scrollRight(ratio?: number, ani?: boolean): void;
        scrollToView(target: Laya.Rectangle | GObject, ani?: boolean, setFirst?: boolean): void;
        isChildInView(obj: GObject): boolean;
        cancelDragging(): void;
        lockHeader(size: number): void;
        lockFooter(size: number): void;
        onOwnerSizeChanged(): void;
        handleControllerChanged(c: Controller): void;
        private updatePageController;
        adjustMaskContainer(): void;
        setSize(aWidth: number, aHeight: number): void;
        setContentSize(aWidth: number, aHeight: number): void;
        changeContentSizeOnScrolling(deltaWidth: number, deltaHeight: number, deltaPosX: number, deltaPosY: number): void;
        private handleSizeChanged;
        private posChanged;
        private refresh;
        private refresh2;
        private __mouseDown;
        private __mouseMove;
        private __mouseUp;
        private __click;
        private __mouseWheel;
        private updateScrollBarPos;
        updateScrollBarVisible(): void;
        private updateScrollBarVisible2;
        private __barTweenComplete;
        private getLoopPartSize;
        private loopCheckingCurrent;
        private loopCheckingTarget;
        private loopCheckingTarget2;
        private loopCheckingNewPos;
        private alignPosition;
        private alignByPage;
        private updateTargetAndDuration;
        private updateTargetAndDuration2;
        private fixDuration;
        private startTween;
        private killTween;
        private checkRefreshBar;
        private tweenUpdate;
        private runTween;
    }
}
declare namespace fgui {
    class Transition {
        name: string;
        private _owner;
        private _ownerBaseX;
        private _ownerBaseY;
        private _items;
        private _totalTimes;
        private _totalTasks;
        private _playing;
        private _paused;
        private _onComplete;
        private _options;
        private _reversed;
        private _totalDuration;
        private _autoPlay;
        private _autoPlayTimes;
        private _autoPlayDelay;
        private _timeScale;
        private _startTime;
        private _endTime;
        constructor(owner: GComponent);
        play(onComplete?: Laya.Handler, times?: number, delay?: number, startTime?: number, endTime?: number): void;
        playReverse(onComplete?: Laya.Handler, times?: number, delay?: number, startTime?: number, endTime?: number): void;
        changePlayTimes(value: number): void;
        setAutoPlay(value: boolean, times?: number, delay?: number): void;
        private _play;
        stop(setToComplete?: boolean, processCallback?: boolean): void;
        private stopItem;
        setPaused(paused: boolean): void;
        dispose(): void;
        readonly playing: boolean;
        setValue(label: string, ...args: any[]): void;
        setHook(label: string, callback: Laya.Handler): void;
        clearHooks(): void;
        setTarget(label: string, newTarget: GObject): void;
        setDuration(label: string, value: number): void;
        getLabelTime(label: string): number;
        timeScale: number;
        updateFromRelations(targetId: string, dx: number, dy: number): void;
        onOwnerAddedToStage(): void;
        onOwnerRemovedFromStage(): void;
        private onDelayedPlay;
        private internalPlay;
        private playItem;
        private skipAnimations;
        private onDelayedPlayItem;
        private onTweenStart;
        private onTweenUpdate;
        private onTweenComplete;
        private onPlayTransCompleted;
        private callHook;
        private checkAllComplete;
        private applyValue;
        setup(buffer: ByteBuffer): void;
        private decodeValue;
    }
}
declare namespace fgui {
    class TranslationHelper {
        static strings: {
            [index: string]: {
                [index: string]: string;
            };
        };
        constructor();
        static loadFromXML(source: string): void;
        static translateComponent(item: PackageItem): void;
    }
}
declare namespace fgui {
    class UIConfig {
        constructor();
        static defaultFont: string;
        static windowModalWaiting: string;
        static globalModalWaiting: string;
        static modalLayerColor: string;
        static buttonSound: string;
        static buttonSoundVolumeScale: number;
        static horizontalScrollBar: string;
        static verticalScrollBar: string;
        static defaultScrollStep: number;
        static defaultScrollDecelerationRate: number;
        static defaultScrollBarDisplay: number;
        static defaultScrollTouchEffect: boolean;
        static defaultScrollBounceEffect: boolean;
        /**
          * 当滚动容器设置为“贴近ITEM”时，判定贴近到哪一个ITEM的滚动距离阀值。
          */
        static defaultScrollSnappingThreshold: number;
        /**
          * 当滚动容器设置为“页面模式”时，判定翻到哪一页的滚动距离阀值。
          */
        static defaultScrollPagingThreshold: number;
        static popupMenu: string;
        static popupMenu_seperator: string;
        static loaderErrorSign: string;
        static tooltipsWin: string;
        static defaultComboBoxVisibleItemCount: number;
        static touchScrollSensitivity: number;
        static touchDragSensitivity: number;
        static clickDragSensitivity: number;
        static bringWindowToFrontOnClick: boolean;
        static frameTimeForAsyncUIConstruction: number;
        static textureLinearSampling: boolean;
        static packageFileExtension: string;
    }
}
declare module fgui {
    class UIObjectFactory {
        static extensions: {
            [index: string]: new () => GComponent;
        };
        static loaderType: new () => GLoader;
        constructor();
        static setExtension(url: string, type: new () => GComponent): void;
        static setPackageItemExtension(url: string, type: new () => GComponent): void;
        static setLoaderExtension(type: new () => GLoader): void;
        static resolvePackageItemExtension(pi: PackageItem): void;
        static newObject(type: number | PackageItem, userClass?: new () => GObject): GObject;
    }
}
declare namespace fgui {
    class UIPackage {
        private _id;
        private _name;
        private _items;
        private _itemsById;
        private _itemsByName;
        private _resKey;
        private _customId;
        private _sprites;
        private _dependencies;
        private _branches;
        _branchIndex: number;
        static _constructing: number;
        private static _instById;
        private static _instByName;
        private static _branch;
        private static _vars;
        constructor();
        static branch: string;
        static getVar(key: string): string;
        static setVar(key: string, value: string): void;
        static getById(id: string): UIPackage;
        static getByName(name: string): UIPackage;
        static addPackage(resKey: string, descData?: ArrayBuffer): UIPackage;
        /**
         * @param resKey resKey 或 [resKey1,resKey2,resKey3....]
         */
        static loadPackage(resKey: string | Array<string>, completeHandler: Laya.Handler, progressHandler?: Laya.Handler): void;
        static removePackage(packageIdOrName: string): void;
        static createObject(pkgName: string, resName: string, userClass?: new () => GObject): GObject;
        static createObjectFromURL(url: string, userClass?: new () => GObject): GObject;
        static getItemURL(pkgName: string, resName: string): string;
        static getItemByURL(url: string): PackageItem;
        static getItemAssetByURL(url: string): Object;
        static normalizeURL(url: string): string;
        static setStringsSource(source: string): void;
        private loadPackage;
        loadAllAssets(): void;
        unloadAssets(): void;
        dispose(): void;
        readonly id: string;
        readonly name: string;
        customId: string;
        createObject(resName: string, userClass?: new () => GObject): GObject;
        internalCreateObject(item: PackageItem, userClass?: new () => GObject): GObject;
        getItemById(itemId: string): PackageItem;
        getItemByName(resName: string): PackageItem;
        getItemAssetByName(resName: string): Object;
        getItemAsset(item: PackageItem): Object;
        getItemAssetAsync(item: PackageItem, onComplete?: (err: any, item: PackageItem) => void): void;
        private loadMovieClip;
        private loadFont;
    }
}
declare namespace fgui {
    class Window extends GComponent {
        private _contentPane;
        private _modalWaitPane;
        private _closeButton;
        private _dragArea;
        private _contentArea;
        private _frame;
        private _modal;
        private _uiSources?;
        private _inited?;
        private _loading?;
        protected _requestingCmd: number;
        bringToFontOnClick: boolean;
        constructor();
        addUISource(source: IUISource): void;
        contentPane: GComponent;
        readonly frame: GComponent;
        closeButton: GObject;
        dragArea: GObject;
        contentArea: GObject;
        show(): void;
        showOn(root: GRoot): void;
        hide(): void;
        hideImmediately(): void;
        centerOn(r: GRoot, restraint?: boolean): void;
        toggleStatus(): void;
        readonly isShowing: boolean;
        readonly isTop: boolean;
        modal: boolean;
        bringToFront(): void;
        showModalWait(requestingCmd?: number): void;
        protected layoutModalWaitPane(): void;
        closeModalWait(requestingCmd?: number): boolean;
        readonly modalWaiting: boolean;
        init(): void;
        protected onInit(): void;
        protected onShown(): void;
        protected onHide(): void;
        protected doShowAnimation(): void;
        protected doHideAnimation(): void;
        private __uiLoadComplete;
        private _init;
        dispose(): void;
        protected closeEventHandler(): void;
        private __onShown;
        private __onHidden;
        private __mouseDown;
        private __dragStart;
    }
}
declare namespace fgui {
    class ControllerAction {
        fromPage: string[];
        toPage: string[];
        static createAction(type: number): ControllerAction;
        constructor();
        run(controller: Controller, prevPage: string, curPage: string): void;
        protected enter(controller: Controller): void;
        protected leave(controller: Controller): void;
        setup(buffer: ByteBuffer): void;
    }
}
declare namespace fgui {
    class ChangePageAction extends ControllerAction {
        objectId: string;
        controllerName: string;
        targetPage: string;
        constructor();
        protected enter(controller: Controller): void;
        setup(buffer: ByteBuffer): void;
    }
}
declare namespace fgui {
    class PlayTransitionAction extends ControllerAction {
        transitionName: string;
        playTimes: number;
        delay: number;
        stopOnExit: boolean;
        private _currentTransition?;
        constructor();
        protected enter(controller: Controller): void;
        protected leave(controller: Controller): void;
        setup(buffer: ByteBuffer): void;
    }
}
declare namespace fgui {
    class BitmapFont {
        id: string;
        size: number;
        ttf?: boolean;
        glyphs: {
            [index: string]: BMGlyph;
        };
        resizable?: boolean;
        tint?: boolean;
        constructor();
    }
    interface BMGlyph {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        advance?: number;
        lineHeight?: number;
        channel?: number;
        texture?: Laya.Texture;
    }
}
declare namespace fgui {
    function fillImage(w: number, h: number, method: number, origin: number, clockwise: boolean, amount: number): number[];
}
declare namespace fgui {
    class Image extends Laya.Sprite {
        protected _source: Laya.Texture;
        protected _scaleByTile?: boolean;
        protected _scale9Grid?: Laya.Rectangle;
        private _tileGridIndice;
        private _sizeGrid;
        private _needRebuild;
        private _fillMethod;
        private _fillOrigin;
        private _fillAmount;
        private _fillClockwise?;
        private _mask?;
        private _color;
        constructor();
        width: number;
        height: number;
        texture: Laya.Texture;
        scale9Grid: Laya.Rectangle;
        scaleByTile: boolean;
        tileGridIndice: number;
        fillMethod: number;
        fillOrigin: number;
        fillClockwise: boolean;
        fillAmount: number;
        color: string;
        private markChanged;
        protected rebuild(): void;
        private doDraw;
        private doFill;
    }
}
declare namespace fgui {
    interface Frame {
        addDelay: number;
        texture?: Laya.Texture;
    }
    class MovieClip extends Image {
        interval: number;
        swing: boolean;
        repeatDelay: number;
        timeScale: number;
        private _playing;
        private _frameCount;
        private _frames;
        private _frame;
        private _start;
        private _end;
        private _times;
        private _endAt;
        private _status;
        private _endHandler?;
        private _frameElapsed;
        private _reversed;
        private _repeatedCount;
        constructor();
        frames: Frame[];
        readonly frameCount: number;
        frame: number;
        playing: boolean;
        rewind(): void;
        syncStatus(anotherMc: MovieClip): void;
        advance(timeInMiniseconds: number): void;
        setPlaySettings(start?: number, end?: number, times?: number, endAt?: number, endHandler?: Laya.Handler): void;
        private update;
        private drawFrame;
        private checkTimer;
        private __addToStage;
        private __removeFromStage;
    }
}
declare namespace fgui {
    class GearBase {
        static disableAllTweenEffect: boolean;
        protected _owner: GObject;
        protected _controller: Controller;
        protected _tweenConfig?: GearTweenConfig;
        static create(owner: GObject, index: number): GearBase;
        constructor(owner: GObject);
        dispose(): void;
        controller: Controller;
        readonly tweenConfig: GearTweenConfig;
        setup(buffer: ByteBuffer): void;
        updateFromRelations(dx: number, dy: number): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        protected init(): void;
        apply(): void;
        updateState(): void;
    }
    class GearTweenConfig {
        tween: boolean;
        easeType: number;
        duration: number;
        delay: number;
        _displayLockToken: number;
        _tweener: GTweener;
        constructor();
    }
}
declare namespace fgui {
    class GearAnimation extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        updateState(): void;
    }
}
declare namespace fgui {
    class GearColor extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        updateState(): void;
    }
}
declare namespace fgui {
    class GearDisplay extends GearBase {
        pages: string[];
        private _visible;
        private _displayLockToken;
        constructor(owner: GObject);
        protected init(): void;
        apply(): void;
        addLock(): number;
        releaseLock(token: number): void;
        readonly connected: boolean;
    }
}
declare namespace fgui {
    class GearDisplay2 extends GearBase {
        pages: string[];
        condition: number;
        private _visible;
        constructor(owner: GObject);
        protected init(): void;
        apply(): void;
        evaluate(connected: boolean): boolean;
    }
}
declare namespace fgui {
    class GearFontSize extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        updateState(): void;
    }
}
declare namespace fgui {
    class GearIcon extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        updateState(): void;
    }
}
declare namespace fgui {
    class GearLook extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        private __tweenUpdate;
        private __tweenComplete;
        updateState(): void;
    }
}
declare namespace fgui {
    class GearSize extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        private __tweenUpdate;
        private __tweenComplete;
        updateState(): void;
        updateFromRelations(dx: number, dy: number): void;
    }
}
declare namespace fgui {
    class GearText extends GearBase {
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        updateState(): void;
    }
}
declare namespace fgui {
    class GearXY extends GearBase {
        positionsInPercent: boolean;
        private _storage;
        private _default;
        constructor(owner: GObject);
        protected init(): void;
        protected addStatus(pageId: string, buffer: ByteBuffer): void;
        addExtStatus(pageId: string, buffer: ByteBuffer): void;
        apply(): void;
        private __tweenUpdate;
        private __tweenComplete;
        updateState(): void;
        updateFromRelations(dx: number, dy: number): void;
    }
}
declare namespace fgui {
    function evaluateEase(easeType: number, time: number, duration: number, overshootOrAmplitude: number, period: number): number;
}
declare namespace fgui {
    class EaseType {
        static Linear: number;
        static SineIn: number;
        static SineOut: number;
        static SineInOut: number;
        static QuadIn: number;
        static QuadOut: number;
        static QuadInOut: number;
        static CubicIn: number;
        static CubicOut: number;
        static CubicInOut: number;
        static QuartIn: number;
        static QuartOut: number;
        static QuartInOut: number;
        static QuintIn: number;
        static QuintOut: number;
        static QuintInOut: number;
        static ExpoIn: number;
        static ExpoOut: number;
        static ExpoInOut: number;
        static CircIn: number;
        static CircOut: number;
        static CircInOut: number;
        static ElasticIn: number;
        static ElasticOut: number;
        static ElasticInOut: number;
        static BackIn: number;
        static BackOut: number;
        static BackInOut: number;
        static BounceIn: number;
        static BounceOut: number;
        static BounceInOut: number;
        static Custom: number;
    }
}
declare namespace fgui {
    class GPath {
        private _segments;
        private _points;
        private _fullLength;
        constructor();
        readonly length: number;
        create(pt1: Array<GPathPoint> | GPathPoint, pt2?: GPathPoint, pt3?: GPathPoint, pt4?: GPathPoint): void;
        private createSplineSegment;
        clear(): void;
        getPointAt(t: number, result?: Laya.Point): Laya.Point;
        readonly segmentCount: number;
        getAnchorsInSegment(segmentIndex: number, points?: Array<Laya.Point>): Array<Laya.Point>;
        getPointsInSegment(segmentIndex: number, t0: number, t1: number, points?: Array<Laya.Point>, ts?: Array<number>, pointDensity?: number): Array<Laya.Point>;
        getAllPoints(points?: Array<Laya.Point>, ts?: Array<number>, pointDensity?: number): Array<Laya.Point>;
        private onCRSplineCurve;
        private onBezierCurve;
    }
}
declare namespace fgui {
    enum CurveType {
        CRSpline = 0,
        Bezier = 1,
        CubicBezier = 2,
        Straight = 3
    }
    class GPathPoint {
        x: number;
        y: number;
        control1_x: number;
        control1_y: number;
        control2_x: number;
        control2_y: number;
        curveType: number;
        constructor();
        static newPoint(x?: number, y?: number, curveType?: number): GPathPoint;
        static newBezierPoint(x?: number, y?: number, control1_x?: number, control1_y?: number): GPathPoint;
        static newCubicBezierPoint(x?: number, y?: number, control1_x?: number, control1_y?: number, control2_x?: number, control2_y?: number): GPathPoint;
        clone(): GPathPoint;
    }
}
declare namespace fgui {
    class GTween {
        static catchCallbackExceptions: boolean;
        static to(start: number, end: number, duration: number): GTweener;
        static to2(start: number, start2: number, end: number, end2: number, duration: number): GTweener;
        static to3(start: number, start2: number, start3: number, end: number, end2: number, end3: number, duration: number): GTweener;
        static to4(start: number, start2: number, start3: number, start4: number, end: number, end2: number, end3: number, end4: number, duration: number): GTweener;
        static toColor(start: number, end: number, duration: number): GTweener;
        static delayedCall(delay: number): GTweener;
        static shake(startX: number, startY: number, amplitude: number, duration: number): GTweener;
        static isTweening(target: any, propType?: any): Boolean;
        static kill(target: any, complete?: boolean, propType?: any): void;
        static getTween(target: any, propType?: any): GTweener;
    }
}
declare namespace fgui {
    class GTweener {
        _target: any;
        _propType: any;
        _killed: boolean;
        _paused: boolean;
        private _delay;
        private _duration;
        private _breakpoint;
        private _easeType;
        private _easeOvershootOrAmplitude;
        private _easePeriod;
        private _repeat;
        private _yoyo;
        private _timeScale;
        private _snapping;
        private _userData;
        private _path;
        private _onUpdate;
        private _onStart;
        private _onComplete;
        private _onUpdateCaller;
        private _onStartCaller;
        private _onCompleteCaller;
        private _startValue;
        private _endValue;
        private _value;
        private _deltaValue;
        private _valueSize;
        private _started;
        private _ended;
        private _elapsedTime;
        private _normalizedTime;
        constructor();
        setDelay(value: number): GTweener;
        readonly delay: number;
        setDuration(value: number): GTweener;
        readonly duration: number;
        setBreakpoint(value: number): GTweener;
        setEase(value: number): GTweener;
        setEasePeriod(value: number): GTweener;
        setEaseOvershootOrAmplitude(value: number): GTweener;
        setRepeat(repeat: number, yoyo?: boolean): GTweener;
        readonly repeat: number;
        setTimeScale(value: number): GTweener;
        setSnapping(value: boolean): GTweener;
        setTarget(value: any, propType?: any): GTweener;
        readonly target: any;
        setPath(value: GPath): GTweener;
        setUserData(value: any): GTweener;
        readonly userData: any;
        onUpdate(callback: Function, caller?: any): GTweener;
        onStart(callback: Function, caller?: any): GTweener;
        onComplete(callback: Function, caller?: any): GTweener;
        readonly startValue: TweenValue;
        readonly endValue: TweenValue;
        readonly value: TweenValue;
        readonly deltaValue: TweenValue;
        readonly normalizedTime: number;
        readonly completed: boolean;
        readonly allCompleted: boolean;
        setPaused(paused: boolean): GTweener;
        /**
         * seek position of the tween, in seconds.
         */
        seek(time: number): void;
        kill(complete?: boolean): void;
        _to(start: number, end: number, duration: number): GTweener;
        _to2(start: number, start2: number, end: number, end2: number, duration: number): GTweener;
        _to3(start: number, start2: number, start3: number, end: number, end2: number, end3: number, duration: number): GTweener;
        _to4(start: number, start2: number, start3: number, start4: number, end: number, end2: number, end3: number, end4: number, duration: number): GTweener;
        _toColor(start: number, end: number, duration: number): GTweener;
        _shake(startX: number, startY: number, amplitude: number, duration: number): GTweener;
        _init(): void;
        _reset(): void;
        _update(dt: number): void;
        private update;
        private callStartCallback;
        private callUpdateCallback;
        private callCompleteCallback;
    }
}
declare namespace fgui {
    class TweenManager {
        static createTween(): GTweener;
        static isTweening(target: any, propType: any): boolean;
        static killTweens(target: any, completed: boolean, propType: any): boolean;
        static getTween(target: any, propType: any): GTweener;
        static update(): void;
    }
}
declare namespace fgui {
    class TweenValue {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor();
        color: number;
        getField(index: number): number;
        setField(index: number, value: number): void;
        setZero(): void;
    }
}
declare namespace fgui {
    class ByteBuffer extends Laya.Byte {
        stringTable: string[];
        version: number;
        constructor(data: any, offset?: number, length?: number);
        skip(count: number): void;
        readBool(): boolean;
        readS(): string;
        readSArray(cnt: number): Array<string>;
        writeS(value: string): void;
        readColor(hasAlpha?: boolean): number;
        readColorS(hasAlpha?: boolean): string;
        readChar(): string;
        readBuffer(): ByteBuffer;
        seek(indexTablePos: number, blockIndex: number): boolean;
    }
}
declare namespace fgui {
    class ChildHitArea extends Laya.HitArea {
        private _child;
        private _reversed;
        constructor(child: Laya.Sprite, reversed?: boolean);
        contains(x: number, y: number): boolean;
    }
}
declare namespace fgui {
    class ColorMatrix {
        readonly matrix: Array<number>;
        constructor(p_brightness?: number, p_contrast?: number, p_saturation?: number, p_hue?: number);
        reset(): void;
        invert(): void;
        adjustColor(p_brightness: number, p_contrast: number, p_saturation: number, p_hue: number): void;
        adjustBrightness(p_val: number): void;
        adjustContrast(p_val: number): void;
        adjustSaturation(p_val: number): void;
        adjustHue(p_val: number): void;
        concat(p_matrix: Array<number>): void;
        clone(): ColorMatrix;
        protected copyMatrix(p_matrix: Array<number>): void;
        protected multiplyMatrix(p_matrix: Array<number>): void;
        protected cleanValue(p_val: number, p_limit: number): number;
    }
}
declare namespace fgui {
    class PixelHitTest extends Laya.HitArea {
        private _data;
        offsetX: number;
        offsetY: number;
        scaleX: number;
        scaleY: number;
        constructor(data: PixelHitTestData, offsetX: number, offsetY: number);
        contains(x: number, y: number): boolean;
    }
    class PixelHitTestData {
        pixelWidth: number;
        scale: number;
        pixels: number[];
        constructor();
        load(ba: Laya.Byte): void;
    }
}
declare namespace fgui {
    class UBBParser {
        private _text;
        private _readPos;
        protected _handlers: {
            [index: string]: (tagName: string, end: boolean, attr: string) => string;
        };
        defaultImgWidth: number;
        defaultImgHeight: number;
        lastColor: string;
        lastSize: string;
        static inst: UBBParser;
        constructor();
        protected onTag_URL(tagName: string, end: boolean, attr: string): string;
        protected onTag_IMG(tagName: string, end: boolean, attr: string): string;
        protected onTag_B(tagName: string, end: boolean, attr: string): string;
        protected onTag_I(tagName: string, end: boolean, attr: string): string;
        protected onTag_U(tagName: string, end: boolean, attr: string): string;
        protected onTag_Simple(tagName: string, end: boolean, attr: string): string;
        protected onTag_COLOR(tagName: string, end: boolean, attr: string): string;
        protected onTag_FONT(tagName: string, end: boolean, attr: string): string;
        protected onTag_SIZE(tagName: string, end: boolean, attr: string): string;
        protected getTagText(remove?: boolean): string;
        parse(text: string, remove?: boolean): string;
    }
}
declare namespace fgui {
    class ToolSet {
        static startsWith(source: string, str: string, ignoreCase?: boolean): boolean;
        static endsWith(source: string, str: string, ignoreCase?: boolean): boolean;
        static trimRight(targetString: string): string;
        static convertToHtmlColor(argb: number, hasAlpha?: boolean): string;
        static convertFromHtmlColor(str: string, hasAlpha?: boolean): number;
        static displayObjectToGObject(obj: Laya.Node): GObject;
        static encodeHTML(str: string): string;
        static clamp(value: number, min: number, max: number): number;
        static clamp01(value: number): number;
        static lerp(start: number, end: number, percent: number): number;
        static repeat(t: number, length: number): number;
        static distance(x1: number, y1: number, x2: number, y2: number): number;
        static setColorFilter(obj: Laya.Sprite, color?: string | number[] | boolean): void;
    }
}
import fairygui = fgui;
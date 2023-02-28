export abstract class BaseClassView<DisplayObjectType = any> implements akView.IView<DisplayObjectType> {
    key?: string;
    layerType?: string | number;
    dpObj?: DisplayObjectType;
    
    onInitView?(initState?: any): void;
    onBeforeSetVisible?(visible: boolean, showOpt?: akView.IShowOption<any, IAkViewKeyTypes>, hideOpt?: akView.IHideOption<any, IAkViewKeyTypes>): void;
    setVisible?(visible: boolean, showOpt?: akView.IShowOption<any, IAkViewKeyTypes>, hideOpt?: akView.IHideOption<any, IAkViewKeyTypes>): void;

    onTransition?(isToShow?: boolean, showOpt?: akView.IShowOption, hideOpt?: akView.IHideOption): Promise<void>;

    onShowedView?(showState?: any): void;
    onUpdateView?(updateState?: any): void;
    onHidedView?(hideState?: any): void;
    onBeforeDestroyDpObj?(): void;
    destroyDisplayObj?(): void;
    onDestroyedView?(): void;
    onWindowResize?(data: IAkViewResizeData): void;

}
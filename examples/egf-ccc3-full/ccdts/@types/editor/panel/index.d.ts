export declare const Panel: {
    _kitControl: any;
    /**
     * 打开一个面板
     * Open up a panel
     *
     * @param name
     * @param args
     */
    open(name: string, ...args: any[]): any;
    /**
     * 关闭一个面板
     * Close a panel
     *
     * @param name
     */
    close(name: string): any;
    /**
     * 将焦点传递给一个面板
     * Pass focus to a panel
     *
     * @param name
     */
    focus(name: string): any;
    /**
     * 检查面板是否已经打开
     * Check that the panel is open
     *
     * @param name
     */
    has(name: string): Promise<boolean>;
    /**
     * 查询当前窗口里某个面板里的元素列表
     * @param name
     * @param selector
     */
    querySelector(name: string, selector: string): Promise<any>;
};

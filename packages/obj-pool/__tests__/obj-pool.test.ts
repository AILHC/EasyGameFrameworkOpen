class TestObj implements objPool.IObj {
    name: string;
    onGet(data: { name: string }) {
        this.name = data.name;
    }
    onCreate(pool:objPool.IPool,initData: { name: string }) {

    }
}
//对象池对象接口调用测试



//对象池接口调用测试


//对象池通用对象处理器接口测试
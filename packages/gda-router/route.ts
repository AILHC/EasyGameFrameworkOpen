export const globalGDARoutes: IGDARoute[] = [];
export function GDARoute(path: string, name?: string) {
    return function (target: any, methodName: string) {
        globalGDARoutes.push({
            path: path,
            name: name,
            onRouteMethodName: methodName,
            caller: target
        });
    };
}

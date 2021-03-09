// import {isMainThread, Worker, workerData} from "worker_threads";
// import * as path from "path"
// if (isMainThread) {
//     console.log('在主线程中');
//     const onWorkerExit = (data) => {
//         console.log(`线程结束,数据:${JSON.stringify(data)}`);
//     }
//     const myWorkerData = {path: "fdsa", data: {}}
//     const worker1 = new Worker(path.join(path.dirname(__filename), "./worker_task.js"), {workerData: myWorkerData});
//     worker1.on("message", onWorkerExit);
//     (new Promise<void>((res) => {
//         setTimeout(() => {
//             res();
//         }, 1000);
//     })).then(() => {
//         const worker2 = new Worker(path.join(path.dirname(__filename), "./worker_task.js"), {workerData: myWorkerData});
//         worker2.on("message", onWorkerExit);
//     })

// }

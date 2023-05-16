import { createKeyMap } from "./view-utils";
/**
 * 界面key字典
 */
export const ViewKeyMap: Readonly<{ [P in keyof IAkViewKeyTypes]: P }> = createKeyMap<IAkViewKeyTypes>();
/**
 * 事件key字典
 */
export const ViewEventKeyMap: Readonly<{ [P in keyof IAkViewEventKeys]: P }> = createKeyMap<IAkViewEventKeys>();

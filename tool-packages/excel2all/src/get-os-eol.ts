import * as os from "os";
const platform = os.platform();
/**当前系统行尾  platform === "win32" ? "\n" : "\r\n";*/
export const osEol = platform === "win32" ? "\n" : "\r\n";

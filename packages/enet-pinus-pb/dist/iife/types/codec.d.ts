/**
 * [encode an uInt32, return a array of bytes]
 * @param  {[integer]} num
 * @return {[array]}
 */
export declare function encodeUInt32(num: any): any[];
/**
 * [encode a sInt32, return a byte array]
 * @param  {[sInt32]} num  The sInt32 need to encode
 * @return {[array]} A byte array represent the integer
 */
export declare function encodeSInt32(num: any): any[];
export declare function decodeUInt32(bytes: Array<any>): number;
export declare function decodeSInt32(bytes: Array<number>): number;

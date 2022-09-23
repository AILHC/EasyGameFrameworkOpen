export enum PackageType {
    /**未知 */
    NONE = 0,
    /**握手 */
    HANDSHAKE = 1,
    /**握手回应 */
    HANDSHAKE_ACK = 2,
    /**心跳 */
    HEARTBEAT = 3,
    /**数据 */
    DATA = 4,
    /**踢下线 */
    KICK = 5
}
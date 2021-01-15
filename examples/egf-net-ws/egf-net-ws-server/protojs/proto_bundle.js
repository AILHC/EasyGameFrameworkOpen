 (function(global){global.$protobuf = global.protobuf;
$protobuf.roots.default=global;})(typeof window !== "undefined" && window|| typeof global !== "undefined" && global|| typeof self   !== "undefined" && self|| this)
// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.pb_test = (function() {

    /**
     * Namespace pb_test.
     * @exports pb_test
     * @namespace
     */
    var pb_test = {};

    pb_test.HeartBeat = (function() {

        /**
         * Properties of a HeartBeat.
         * @memberof pb_test
         * @interface IHeartBeat
         */

        /**
         * Constructs a new HeartBeat.
         * @memberof pb_test
         * @classdesc Represents a HeartBeat.
         * @implements IHeartBeat
         * @constructor
         * @param {pb_test.IHeartBeat=} [properties] Properties to set
         */
        function HeartBeat(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new HeartBeat instance using the specified properties.
         * @function create
         * @memberof pb_test.HeartBeat
         * @static
         * @param {pb_test.IHeartBeat=} [properties] Properties to set
         * @returns {pb_test.HeartBeat} HeartBeat instance
         */
        HeartBeat.create = function create(properties) {
            return new HeartBeat(properties);
        };

        /**
         * Encodes the specified HeartBeat message. Does not implicitly {@link pb_test.HeartBeat.verify|verify} messages.
         * @function encode
         * @memberof pb_test.HeartBeat
         * @static
         * @param {pb_test.IHeartBeat} message HeartBeat message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        HeartBeat.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Decodes a HeartBeat message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.HeartBeat
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.HeartBeat} HeartBeat
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        HeartBeat.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.HeartBeat();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Verifies a HeartBeat message.
         * @function verify
         * @memberof pb_test.HeartBeat
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        HeartBeat.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        return HeartBeat;
    })();

    pb_test.Kick = (function() {

        /**
         * Properties of a Kick.
         * @memberof pb_test
         * @interface IKick
         */

        /**
         * Constructs a new Kick.
         * @memberof pb_test
         * @classdesc Represents a Kick.
         * @implements IKick
         * @constructor
         * @param {pb_test.IKick=} [properties] Properties to set
         */
        function Kick(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new Kick instance using the specified properties.
         * @function create
         * @memberof pb_test.Kick
         * @static
         * @param {pb_test.IKick=} [properties] Properties to set
         * @returns {pb_test.Kick} Kick instance
         */
        Kick.create = function create(properties) {
            return new Kick(properties);
        };

        /**
         * Encodes the specified Kick message. Does not implicitly {@link pb_test.Kick.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Kick
         * @static
         * @param {pb_test.IKick} message Kick message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Kick.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Decodes a Kick message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Kick
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Kick} Kick
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Kick.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Kick();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Verifies a Kick message.
         * @function verify
         * @memberof pb_test.Kick
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Kick.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        return Kick;
    })();

    pb_test.Cs_Login = (function() {

        /**
         * Properties of a Cs_Login.
         * @memberof pb_test
         * @interface ICs_Login
         * @property {string} name Cs_Login name
         */

        /**
         * Constructs a new Cs_Login.
         * @memberof pb_test
         * @classdesc Represents a Cs_Login.
         * @implements ICs_Login
         * @constructor
         * @param {pb_test.ICs_Login=} [properties] Properties to set
         */
        function Cs_Login(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Cs_Login name.
         * @member {string} name
         * @memberof pb_test.Cs_Login
         * @instance
         */
        Cs_Login.prototype.name = "";

        /**
         * Creates a new Cs_Login instance using the specified properties.
         * @function create
         * @memberof pb_test.Cs_Login
         * @static
         * @param {pb_test.ICs_Login=} [properties] Properties to set
         * @returns {pb_test.Cs_Login} Cs_Login instance
         */
        Cs_Login.create = function create(properties) {
            return new Cs_Login(properties);
        };

        /**
         * Encodes the specified Cs_Login message. Does not implicitly {@link pb_test.Cs_Login.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Cs_Login
         * @static
         * @param {pb_test.ICs_Login} message Cs_Login message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Cs_Login.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            return writer;
        };

        /**
         * Decodes a Cs_Login message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Cs_Login
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Cs_Login} Cs_Login
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Cs_Login.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Cs_Login();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("name"))
                throw $util.ProtocolError("missing required 'name'", { instance: message });
            return message;
        };

        /**
         * Verifies a Cs_Login message.
         * @function verify
         * @memberof pb_test.Cs_Login
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Cs_Login.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.name))
                return "name: string expected";
            return null;
        };

        return Cs_Login;
    })();

    pb_test.Sc_Login = (function() {

        /**
         * Properties of a Sc_Login.
         * @memberof pb_test
         * @interface ISc_Login
         * @property {number} uid Sc_Login uid
         */

        /**
         * Constructs a new Sc_Login.
         * @memberof pb_test
         * @classdesc Represents a Sc_Login.
         * @implements ISc_Login
         * @constructor
         * @param {pb_test.ISc_Login=} [properties] Properties to set
         */
        function Sc_Login(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_Login uid.
         * @member {number} uid
         * @memberof pb_test.Sc_Login
         * @instance
         */
        Sc_Login.prototype.uid = 0;

        /**
         * Creates a new Sc_Login instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_Login
         * @static
         * @param {pb_test.ISc_Login=} [properties] Properties to set
         * @returns {pb_test.Sc_Login} Sc_Login instance
         */
        Sc_Login.create = function create(properties) {
            return new Sc_Login(properties);
        };

        /**
         * Encodes the specified Sc_Login message. Does not implicitly {@link pb_test.Sc_Login.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_Login
         * @static
         * @param {pb_test.ISc_Login} message Sc_Login message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_Login.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.uid);
            return writer;
        };

        /**
         * Decodes a Sc_Login message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_Login
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_Login} Sc_Login
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_Login.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_Login();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.uid = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("uid"))
                throw $util.ProtocolError("missing required 'uid'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_Login message.
         * @function verify
         * @memberof pb_test.Sc_Login
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_Login.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.uid))
                return "uid: integer expected";
            return null;
        };

        return Sc_Login;
    })();

    pb_test.Sc_userEnter = (function() {

        /**
         * Properties of a Sc_userEnter.
         * @memberof pb_test
         * @interface ISc_userEnter
         * @property {string} name Sc_userEnter name
         * @property {string} uid Sc_userEnter uid
         */

        /**
         * Constructs a new Sc_userEnter.
         * @memberof pb_test
         * @classdesc Represents a Sc_userEnter.
         * @implements ISc_userEnter
         * @constructor
         * @param {pb_test.ISc_userEnter=} [properties] Properties to set
         */
        function Sc_userEnter(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_userEnter name.
         * @member {string} name
         * @memberof pb_test.Sc_userEnter
         * @instance
         */
        Sc_userEnter.prototype.name = "";

        /**
         * Sc_userEnter uid.
         * @member {string} uid
         * @memberof pb_test.Sc_userEnter
         * @instance
         */
        Sc_userEnter.prototype.uid = "";

        /**
         * Creates a new Sc_userEnter instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_userEnter
         * @static
         * @param {pb_test.ISc_userEnter=} [properties] Properties to set
         * @returns {pb_test.Sc_userEnter} Sc_userEnter instance
         */
        Sc_userEnter.create = function create(properties) {
            return new Sc_userEnter(properties);
        };

        /**
         * Encodes the specified Sc_userEnter message. Does not implicitly {@link pb_test.Sc_userEnter.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_userEnter
         * @static
         * @param {pb_test.ISc_userEnter} message Sc_userEnter message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_userEnter.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.uid);
            return writer;
        };

        /**
         * Decodes a Sc_userEnter message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_userEnter
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_userEnter} Sc_userEnter
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_userEnter.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_userEnter();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.uid = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("name"))
                throw $util.ProtocolError("missing required 'name'", { instance: message });
            if (!message.hasOwnProperty("uid"))
                throw $util.ProtocolError("missing required 'uid'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_userEnter message.
         * @function verify
         * @memberof pb_test.Sc_userEnter
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_userEnter.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.name))
                return "name: string expected";
            if (!$util.isString(message.uid))
                return "uid: string expected";
            return null;
        };

        return Sc_userEnter;
    })();

    pb_test.Sc_userLeave = (function() {

        /**
         * Properties of a Sc_userLeave.
         * @memberof pb_test
         * @interface ISc_userLeave
         * @property {string} uid Sc_userLeave uid
         */

        /**
         * Constructs a new Sc_userLeave.
         * @memberof pb_test
         * @classdesc Represents a Sc_userLeave.
         * @implements ISc_userLeave
         * @constructor
         * @param {pb_test.ISc_userLeave=} [properties] Properties to set
         */
        function Sc_userLeave(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_userLeave uid.
         * @member {string} uid
         * @memberof pb_test.Sc_userLeave
         * @instance
         */
        Sc_userLeave.prototype.uid = "";

        /**
         * Creates a new Sc_userLeave instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_userLeave
         * @static
         * @param {pb_test.ISc_userLeave=} [properties] Properties to set
         * @returns {pb_test.Sc_userLeave} Sc_userLeave instance
         */
        Sc_userLeave.create = function create(properties) {
            return new Sc_userLeave(properties);
        };

        /**
         * Encodes the specified Sc_userLeave message. Does not implicitly {@link pb_test.Sc_userLeave.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_userLeave
         * @static
         * @param {pb_test.ISc_userLeave} message Sc_userLeave message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_userLeave.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.uid);
            return writer;
        };

        /**
         * Decodes a Sc_userLeave message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_userLeave
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_userLeave} Sc_userLeave
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_userLeave.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_userLeave();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 2:
                    message.uid = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("uid"))
                throw $util.ProtocolError("missing required 'uid'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_userLeave message.
         * @function verify
         * @memberof pb_test.Sc_userLeave
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_userLeave.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.uid))
                return "uid: string expected";
            return null;
        };

        return Sc_userLeave;
    })();

    pb_test.ChatMsg = (function() {

        /**
         * Properties of a ChatMsg.
         * @memberof pb_test
         * @interface IChatMsg
         * @property {number} uid ChatMsg uid
         * @property {string} msg ChatMsg msg
         */

        /**
         * Constructs a new ChatMsg.
         * @memberof pb_test
         * @classdesc Represents a ChatMsg.
         * @implements IChatMsg
         * @constructor
         * @param {pb_test.IChatMsg=} [properties] Properties to set
         */
        function ChatMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ChatMsg uid.
         * @member {number} uid
         * @memberof pb_test.ChatMsg
         * @instance
         */
        ChatMsg.prototype.uid = 0;

        /**
         * ChatMsg msg.
         * @member {string} msg
         * @memberof pb_test.ChatMsg
         * @instance
         */
        ChatMsg.prototype.msg = "";

        /**
         * Creates a new ChatMsg instance using the specified properties.
         * @function create
         * @memberof pb_test.ChatMsg
         * @static
         * @param {pb_test.IChatMsg=} [properties] Properties to set
         * @returns {pb_test.ChatMsg} ChatMsg instance
         */
        ChatMsg.create = function create(properties) {
            return new ChatMsg(properties);
        };

        /**
         * Encodes the specified ChatMsg message. Does not implicitly {@link pb_test.ChatMsg.verify|verify} messages.
         * @function encode
         * @memberof pb_test.ChatMsg
         * @static
         * @param {pb_test.IChatMsg} message ChatMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ChatMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.uid);
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.msg);
            return writer;
        };

        /**
         * Decodes a ChatMsg message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.ChatMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.ChatMsg} ChatMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ChatMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.ChatMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.uid = reader.uint32();
                    break;
                case 2:
                    message.msg = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("uid"))
                throw $util.ProtocolError("missing required 'uid'", { instance: message });
            if (!message.hasOwnProperty("msg"))
                throw $util.ProtocolError("missing required 'msg'", { instance: message });
            return message;
        };

        /**
         * Verifies a ChatMsg message.
         * @function verify
         * @memberof pb_test.ChatMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ChatMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.uid))
                return "uid: integer expected";
            if (!$util.isString(message.msg))
                return "msg: string expected";
            return null;
        };

        return ChatMsg;
    })();

    pb_test.Cs_SendMsg = (function() {

        /**
         * Properties of a Cs_SendMsg.
         * @memberof pb_test
         * @interface ICs_SendMsg
         * @property {pb_test.IChatMsg} msg Cs_SendMsg msg
         */

        /**
         * Constructs a new Cs_SendMsg.
         * @memberof pb_test
         * @classdesc Represents a Cs_SendMsg.
         * @implements ICs_SendMsg
         * @constructor
         * @param {pb_test.ICs_SendMsg=} [properties] Properties to set
         */
        function Cs_SendMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Cs_SendMsg msg.
         * @member {pb_test.IChatMsg} msg
         * @memberof pb_test.Cs_SendMsg
         * @instance
         */
        Cs_SendMsg.prototype.msg = null;

        /**
         * Creates a new Cs_SendMsg instance using the specified properties.
         * @function create
         * @memberof pb_test.Cs_SendMsg
         * @static
         * @param {pb_test.ICs_SendMsg=} [properties] Properties to set
         * @returns {pb_test.Cs_SendMsg} Cs_SendMsg instance
         */
        Cs_SendMsg.create = function create(properties) {
            return new Cs_SendMsg(properties);
        };

        /**
         * Encodes the specified Cs_SendMsg message. Does not implicitly {@link pb_test.Cs_SendMsg.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Cs_SendMsg
         * @static
         * @param {pb_test.ICs_SendMsg} message Cs_SendMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Cs_SendMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.ChatMsg.encode(message.msg, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Cs_SendMsg message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Cs_SendMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Cs_SendMsg} Cs_SendMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Cs_SendMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Cs_SendMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.msg = $root.pb_test.ChatMsg.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("msg"))
                throw $util.ProtocolError("missing required 'msg'", { instance: message });
            return message;
        };

        /**
         * Verifies a Cs_SendMsg message.
         * @function verify
         * @memberof pb_test.Cs_SendMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Cs_SendMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.ChatMsg.verify(message.msg);
                if (error)
                    return "msg." + error;
            }
            return null;
        };

        return Cs_SendMsg;
    })();

    pb_test.Sc_Msg = (function() {

        /**
         * Properties of a Sc_Msg.
         * @memberof pb_test
         * @interface ISc_Msg
         * @property {pb_test.IChatMsg} msg Sc_Msg msg
         */

        /**
         * Constructs a new Sc_Msg.
         * @memberof pb_test
         * @classdesc Represents a Sc_Msg.
         * @implements ISc_Msg
         * @constructor
         * @param {pb_test.ISc_Msg=} [properties] Properties to set
         */
        function Sc_Msg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_Msg msg.
         * @member {pb_test.IChatMsg} msg
         * @memberof pb_test.Sc_Msg
         * @instance
         */
        Sc_Msg.prototype.msg = null;

        /**
         * Creates a new Sc_Msg instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_Msg
         * @static
         * @param {pb_test.ISc_Msg=} [properties] Properties to set
         * @returns {pb_test.Sc_Msg} Sc_Msg instance
         */
        Sc_Msg.create = function create(properties) {
            return new Sc_Msg(properties);
        };

        /**
         * Encodes the specified Sc_Msg message. Does not implicitly {@link pb_test.Sc_Msg.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_Msg
         * @static
         * @param {pb_test.ISc_Msg} message Sc_Msg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_Msg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.ChatMsg.encode(message.msg, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Sc_Msg message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_Msg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_Msg} Sc_Msg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_Msg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_Msg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.msg = $root.pb_test.ChatMsg.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("msg"))
                throw $util.ProtocolError("missing required 'msg'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_Msg message.
         * @function verify
         * @memberof pb_test.Sc_Msg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_Msg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.ChatMsg.verify(message.msg);
                if (error)
                    return "msg." + error;
            }
            return null;
        };

        return Sc_Msg;
    })();

    return pb_test;
})();
var $protobuf = window.protobuf;
$protobuf.roots.default=window;
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
         * Encodes the specified HeartBeat message, length delimited. Does not implicitly {@link pb_test.HeartBeat.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb_test.HeartBeat
         * @static
         * @param {pb_test.IHeartBeat} message HeartBeat message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        HeartBeat.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
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
         * Decodes a HeartBeat message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb_test.HeartBeat
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb_test.HeartBeat} HeartBeat
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        HeartBeat.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
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

    pb_test.LoginReq = (function() {

        /**
         * Properties of a LoginReq.
         * @memberof pb_test
         * @interface ILoginReq
         * @property {string} name LoginReq name
         * @property {string} pwd LoginReq pwd
         */

        /**
         * Constructs a new LoginReq.
         * @memberof pb_test
         * @classdesc Represents a LoginReq.
         * @implements ILoginReq
         * @constructor
         * @param {pb_test.ILoginReq=} [properties] Properties to set
         */
        function LoginReq(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LoginReq name.
         * @member {string} name
         * @memberof pb_test.LoginReq
         * @instance
         */
        LoginReq.prototype.name = "";

        /**
         * LoginReq pwd.
         * @member {string} pwd
         * @memberof pb_test.LoginReq
         * @instance
         */
        LoginReq.prototype.pwd = "";

        /**
         * Creates a new LoginReq instance using the specified properties.
         * @function create
         * @memberof pb_test.LoginReq
         * @static
         * @param {pb_test.ILoginReq=} [properties] Properties to set
         * @returns {pb_test.LoginReq} LoginReq instance
         */
        LoginReq.create = function create(properties) {
            return new LoginReq(properties);
        };

        /**
         * Encodes the specified LoginReq message. Does not implicitly {@link pb_test.LoginReq.verify|verify} messages.
         * @function encode
         * @memberof pb_test.LoginReq
         * @static
         * @param {pb_test.ILoginReq} message LoginReq message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginReq.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.pwd);
            return writer;
        };

        /**
         * Encodes the specified LoginReq message, length delimited. Does not implicitly {@link pb_test.LoginReq.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb_test.LoginReq
         * @static
         * @param {pb_test.ILoginReq} message LoginReq message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginReq.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LoginReq message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.LoginReq
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.LoginReq} LoginReq
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginReq.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.LoginReq();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.pwd = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("name"))
                throw $util.ProtocolError("missing required 'name'", { instance: message });
            if (!message.hasOwnProperty("pwd"))
                throw $util.ProtocolError("missing required 'pwd'", { instance: message });
            return message;
        };

        /**
         * Decodes a LoginReq message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb_test.LoginReq
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb_test.LoginReq} LoginReq
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginReq.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LoginReq message.
         * @function verify
         * @memberof pb_test.LoginReq
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LoginReq.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.name))
                return "name: string expected";
            if (!$util.isString(message.pwd))
                return "pwd: string expected";
            return null;
        };

        return LoginReq;
    })();

    pb_test.LoginRes = (function() {

        /**
         * Properties of a LoginRes.
         * @memberof pb_test
         * @interface ILoginRes
         * @property {number} uid LoginRes uid
         */

        /**
         * Constructs a new LoginRes.
         * @memberof pb_test
         * @classdesc Represents a LoginRes.
         * @implements ILoginRes
         * @constructor
         * @param {pb_test.ILoginRes=} [properties] Properties to set
         */
        function LoginRes(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LoginRes uid.
         * @member {number} uid
         * @memberof pb_test.LoginRes
         * @instance
         */
        LoginRes.prototype.uid = 0;

        /**
         * Creates a new LoginRes instance using the specified properties.
         * @function create
         * @memberof pb_test.LoginRes
         * @static
         * @param {pb_test.ILoginRes=} [properties] Properties to set
         * @returns {pb_test.LoginRes} LoginRes instance
         */
        LoginRes.create = function create(properties) {
            return new LoginRes(properties);
        };

        /**
         * Encodes the specified LoginRes message. Does not implicitly {@link pb_test.LoginRes.verify|verify} messages.
         * @function encode
         * @memberof pb_test.LoginRes
         * @static
         * @param {pb_test.ILoginRes} message LoginRes message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginRes.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.uid);
            return writer;
        };

        /**
         * Encodes the specified LoginRes message, length delimited. Does not implicitly {@link pb_test.LoginRes.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb_test.LoginRes
         * @static
         * @param {pb_test.ILoginRes} message LoginRes message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LoginRes.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LoginRes message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.LoginRes
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.LoginRes} LoginRes
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginRes.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.LoginRes();
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
         * Decodes a LoginRes message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb_test.LoginRes
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb_test.LoginRes} LoginRes
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LoginRes.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LoginRes message.
         * @function verify
         * @memberof pb_test.LoginRes
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LoginRes.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.uid))
                return "uid: integer expected";
            return null;
        };

        return LoginRes;
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
         * Encodes the specified ChatMsg message, length delimited. Does not implicitly {@link pb_test.ChatMsg.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb_test.ChatMsg
         * @static
         * @param {pb_test.IChatMsg} message ChatMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ChatMsg.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
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
         * Decodes a ChatMsg message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb_test.ChatMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb_test.ChatMsg} ChatMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ChatMsg.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
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
         * Encodes the specified Kick message, length delimited. Does not implicitly {@link pb_test.Kick.verify|verify} messages.
         * @function encodeDelimited
         * @memberof pb_test.Kick
         * @static
         * @param {pb_test.IKick} message Kick message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Kick.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
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
         * Decodes a Kick message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof pb_test.Kick
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {pb_test.Kick} Kick
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Kick.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
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

    return pb_test;
})();
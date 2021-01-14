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

    pb_test.ResData = (function() {

        /**
         * Properties of a ResData.
         * @memberof pb_test
         * @interface IResData
         * @property {number} result ResData result
         * @property {Array.<string>|null} [param] ResData param
         */

        /**
         * Constructs a new ResData.
         * @memberof pb_test
         * @classdesc Represents a ResData.
         * @implements IResData
         * @constructor
         * @param {pb_test.IResData=} [properties] Properties to set
         */
        function ResData(properties) {
            this.param = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ResData result.
         * @member {number} result
         * @memberof pb_test.ResData
         * @instance
         */
        ResData.prototype.result = 0;

        /**
         * ResData param.
         * @member {Array.<string>} param
         * @memberof pb_test.ResData
         * @instance
         */
        ResData.prototype.param = $util.emptyArray;

        /**
         * Creates a new ResData instance using the specified properties.
         * @function create
         * @memberof pb_test.ResData
         * @static
         * @param {pb_test.IResData=} [properties] Properties to set
         * @returns {pb_test.ResData} ResData instance
         */
        ResData.create = function create(properties) {
            return new ResData(properties);
        };

        /**
         * Encodes the specified ResData message. Does not implicitly {@link pb_test.ResData.verify|verify} messages.
         * @function encode
         * @memberof pb_test.ResData
         * @static
         * @param {pb_test.IResData} message ResData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ResData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.result);
            if (message.param != null && message.param.length)
                for (var i = 0; i < message.param.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.param[i]);
            return writer;
        };

        /**
         * Decodes a ResData message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.ResData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.ResData} ResData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ResData.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.ResData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.result = reader.uint32();
                    break;
                case 2:
                    if (!(message.param && message.param.length))
                        message.param = [];
                    message.param.push(reader.string());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("result"))
                throw $util.ProtocolError("missing required 'result'", { instance: message });
            return message;
        };

        /**
         * Verifies a ResData message.
         * @function verify
         * @memberof pb_test.ResData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ResData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.result))
                return "result: integer expected";
            if (message.param != null && message.hasOwnProperty("param")) {
                if (!Array.isArray(message.param))
                    return "param: array expected";
                for (var i = 0; i < message.param.length; ++i)
                    if (!$util.isString(message.param[i]))
                        return "param: string[] expected";
            }
            return null;
        };

        return ResData;
    })();

    pb_test.Pt_GetAsset = (function() {

        /**
         * Properties of a Pt_GetAsset.
         * @memberof pb_test
         * @interface IPt_GetAsset
         * @property {number} asset_type Pt_GetAsset asset_type
         * @property {number|Long} asset_num Pt_GetAsset asset_num
         */

        /**
         * Constructs a new Pt_GetAsset.
         * @memberof pb_test
         * @classdesc Represents a Pt_GetAsset.
         * @implements IPt_GetAsset
         * @constructor
         * @param {pb_test.IPt_GetAsset=} [properties] Properties to set
         */
        function Pt_GetAsset(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_GetAsset asset_type.
         * @member {number} asset_type
         * @memberof pb_test.Pt_GetAsset
         * @instance
         */
        Pt_GetAsset.prototype.asset_type = 0;

        /**
         * Pt_GetAsset asset_num.
         * @member {number|Long} asset_num
         * @memberof pb_test.Pt_GetAsset
         * @instance
         */
        Pt_GetAsset.prototype.asset_num = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new Pt_GetAsset instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_GetAsset
         * @static
         * @param {pb_test.IPt_GetAsset=} [properties] Properties to set
         * @returns {pb_test.Pt_GetAsset} Pt_GetAsset instance
         */
        Pt_GetAsset.create = function create(properties) {
            return new Pt_GetAsset(properties);
        };

        /**
         * Encodes the specified Pt_GetAsset message. Does not implicitly {@link pb_test.Pt_GetAsset.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_GetAsset
         * @static
         * @param {pb_test.IPt_GetAsset} message Pt_GetAsset message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_GetAsset.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.asset_type);
            writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.asset_num);
            return writer;
        };

        /**
         * Decodes a Pt_GetAsset message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_GetAsset
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_GetAsset} Pt_GetAsset
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_GetAsset.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_GetAsset();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.asset_type = reader.uint32();
                    break;
                case 2:
                    message.asset_num = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("asset_type"))
                throw $util.ProtocolError("missing required 'asset_type'", { instance: message });
            if (!message.hasOwnProperty("asset_num"))
                throw $util.ProtocolError("missing required 'asset_num'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_GetAsset message.
         * @function verify
         * @memberof pb_test.Pt_GetAsset
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_GetAsset.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.asset_type))
                return "asset_type: integer expected";
            if (!$util.isInteger(message.asset_num) && !(message.asset_num && $util.isInteger(message.asset_num.low) && $util.isInteger(message.asset_num.high)))
                return "asset_num: integer|Long expected";
            return null;
        };

        return Pt_GetAsset;
    })();

    pb_test.Pt_BaseGoods = (function() {

        /**
         * Properties of a Pt_BaseGoods.
         * @memberof pb_test
         * @interface IPt_BaseGoods
         * @property {number} base_id Pt_BaseGoods base_id
         * @property {number} num Pt_BaseGoods num
         */

        /**
         * Constructs a new Pt_BaseGoods.
         * @memberof pb_test
         * @classdesc Represents a Pt_BaseGoods.
         * @implements IPt_BaseGoods
         * @constructor
         * @param {pb_test.IPt_BaseGoods=} [properties] Properties to set
         */
        function Pt_BaseGoods(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_BaseGoods base_id.
         * @member {number} base_id
         * @memberof pb_test.Pt_BaseGoods
         * @instance
         */
        Pt_BaseGoods.prototype.base_id = 0;

        /**
         * Pt_BaseGoods num.
         * @member {number} num
         * @memberof pb_test.Pt_BaseGoods
         * @instance
         */
        Pt_BaseGoods.prototype.num = 0;

        /**
         * Creates a new Pt_BaseGoods instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_BaseGoods
         * @static
         * @param {pb_test.IPt_BaseGoods=} [properties] Properties to set
         * @returns {pb_test.Pt_BaseGoods} Pt_BaseGoods instance
         */
        Pt_BaseGoods.create = function create(properties) {
            return new Pt_BaseGoods(properties);
        };

        /**
         * Encodes the specified Pt_BaseGoods message. Does not implicitly {@link pb_test.Pt_BaseGoods.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_BaseGoods
         * @static
         * @param {pb_test.IPt_BaseGoods} message Pt_BaseGoods message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_BaseGoods.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.base_id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.num);
            return writer;
        };

        /**
         * Decodes a Pt_BaseGoods message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_BaseGoods
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_BaseGoods} Pt_BaseGoods
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_BaseGoods.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_BaseGoods();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.base_id = reader.uint32();
                    break;
                case 2:
                    message.num = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("base_id"))
                throw $util.ProtocolError("missing required 'base_id'", { instance: message });
            if (!message.hasOwnProperty("num"))
                throw $util.ProtocolError("missing required 'num'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_BaseGoods message.
         * @function verify
         * @memberof pb_test.Pt_BaseGoods
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_BaseGoods.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.base_id))
                return "base_id: integer expected";
            if (!$util.isInteger(message.num))
                return "num: integer expected";
            return null;
        };

        return Pt_BaseGoods;
    })();

    pb_test.Pt_BaseGene = (function() {

        /**
         * Properties of a Pt_BaseGene.
         * @memberof pb_test
         * @interface IPt_BaseGene
         * @property {number} base_id Pt_BaseGene base_id
         * @property {number} strg_rank Pt_BaseGene strg_rank
         * @property {number} star_rank Pt_BaseGene star_rank
         * @property {number} limit_id Pt_BaseGene limit_id
         */

        /**
         * Constructs a new Pt_BaseGene.
         * @memberof pb_test
         * @classdesc Represents a Pt_BaseGene.
         * @implements IPt_BaseGene
         * @constructor
         * @param {pb_test.IPt_BaseGene=} [properties] Properties to set
         */
        function Pt_BaseGene(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_BaseGene base_id.
         * @member {number} base_id
         * @memberof pb_test.Pt_BaseGene
         * @instance
         */
        Pt_BaseGene.prototype.base_id = 0;

        /**
         * Pt_BaseGene strg_rank.
         * @member {number} strg_rank
         * @memberof pb_test.Pt_BaseGene
         * @instance
         */
        Pt_BaseGene.prototype.strg_rank = 0;

        /**
         * Pt_BaseGene star_rank.
         * @member {number} star_rank
         * @memberof pb_test.Pt_BaseGene
         * @instance
         */
        Pt_BaseGene.prototype.star_rank = 0;

        /**
         * Pt_BaseGene limit_id.
         * @member {number} limit_id
         * @memberof pb_test.Pt_BaseGene
         * @instance
         */
        Pt_BaseGene.prototype.limit_id = 0;

        /**
         * Creates a new Pt_BaseGene instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_BaseGene
         * @static
         * @param {pb_test.IPt_BaseGene=} [properties] Properties to set
         * @returns {pb_test.Pt_BaseGene} Pt_BaseGene instance
         */
        Pt_BaseGene.create = function create(properties) {
            return new Pt_BaseGene(properties);
        };

        /**
         * Encodes the specified Pt_BaseGene message. Does not implicitly {@link pb_test.Pt_BaseGene.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_BaseGene
         * @static
         * @param {pb_test.IPt_BaseGene} message Pt_BaseGene message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_BaseGene.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.base_id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.strg_rank);
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.star_rank);
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.limit_id);
            return writer;
        };

        /**
         * Decodes a Pt_BaseGene message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_BaseGene
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_BaseGene} Pt_BaseGene
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_BaseGene.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_BaseGene();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.base_id = reader.uint32();
                    break;
                case 2:
                    message.strg_rank = reader.uint32();
                    break;
                case 3:
                    message.star_rank = reader.uint32();
                    break;
                case 4:
                    message.limit_id = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("base_id"))
                throw $util.ProtocolError("missing required 'base_id'", { instance: message });
            if (!message.hasOwnProperty("strg_rank"))
                throw $util.ProtocolError("missing required 'strg_rank'", { instance: message });
            if (!message.hasOwnProperty("star_rank"))
                throw $util.ProtocolError("missing required 'star_rank'", { instance: message });
            if (!message.hasOwnProperty("limit_id"))
                throw $util.ProtocolError("missing required 'limit_id'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_BaseGene message.
         * @function verify
         * @memberof pb_test.Pt_BaseGene
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_BaseGene.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.base_id))
                return "base_id: integer expected";
            if (!$util.isInteger(message.strg_rank))
                return "strg_rank: integer expected";
            if (!$util.isInteger(message.star_rank))
                return "star_rank: integer expected";
            if (!$util.isInteger(message.limit_id))
                return "limit_id: integer expected";
            return null;
        };

        return Pt_BaseGene;
    })();

    pb_test.DrawAward = (function() {

        /**
         * Properties of a DrawAward.
         * @memberof pb_test
         * @interface IDrawAward
         * @property {Array.<pb_test.IPt_BaseGoods>|null} [award_goods] DrawAward award_goods
         * @property {Array.<pb_test.IPt_GetAsset>|null} [award_asset] DrawAward award_asset
         * @property {Array.<pb_test.IPt_BaseGene>|null} [award_genome] DrawAward award_genome
         */

        /**
         * Constructs a new DrawAward.
         * @memberof pb_test
         * @classdesc Represents a DrawAward.
         * @implements IDrawAward
         * @constructor
         * @param {pb_test.IDrawAward=} [properties] Properties to set
         */
        function DrawAward(properties) {
            this.award_goods = [];
            this.award_asset = [];
            this.award_genome = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DrawAward award_goods.
         * @member {Array.<pb_test.IPt_BaseGoods>} award_goods
         * @memberof pb_test.DrawAward
         * @instance
         */
        DrawAward.prototype.award_goods = $util.emptyArray;

        /**
         * DrawAward award_asset.
         * @member {Array.<pb_test.IPt_GetAsset>} award_asset
         * @memberof pb_test.DrawAward
         * @instance
         */
        DrawAward.prototype.award_asset = $util.emptyArray;

        /**
         * DrawAward award_genome.
         * @member {Array.<pb_test.IPt_BaseGene>} award_genome
         * @memberof pb_test.DrawAward
         * @instance
         */
        DrawAward.prototype.award_genome = $util.emptyArray;

        /**
         * Creates a new DrawAward instance using the specified properties.
         * @function create
         * @memberof pb_test.DrawAward
         * @static
         * @param {pb_test.IDrawAward=} [properties] Properties to set
         * @returns {pb_test.DrawAward} DrawAward instance
         */
        DrawAward.create = function create(properties) {
            return new DrawAward(properties);
        };

        /**
         * Encodes the specified DrawAward message. Does not implicitly {@link pb_test.DrawAward.verify|verify} messages.
         * @function encode
         * @memberof pb_test.DrawAward
         * @static
         * @param {pb_test.IDrawAward} message DrawAward message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DrawAward.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.award_goods != null && message.award_goods.length)
                for (var i = 0; i < message.award_goods.length; ++i)
                    $root.pb_test.Pt_BaseGoods.encode(message.award_goods[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.award_asset != null && message.award_asset.length)
                for (var i = 0; i < message.award_asset.length; ++i)
                    $root.pb_test.Pt_GetAsset.encode(message.award_asset[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.award_genome != null && message.award_genome.length)
                for (var i = 0; i < message.award_genome.length; ++i)
                    $root.pb_test.Pt_BaseGene.encode(message.award_genome[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a DrawAward message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.DrawAward
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.DrawAward} DrawAward
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DrawAward.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.DrawAward();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.award_goods && message.award_goods.length))
                        message.award_goods = [];
                    message.award_goods.push($root.pb_test.Pt_BaseGoods.decode(reader, reader.uint32()));
                    break;
                case 2:
                    if (!(message.award_asset && message.award_asset.length))
                        message.award_asset = [];
                    message.award_asset.push($root.pb_test.Pt_GetAsset.decode(reader, reader.uint32()));
                    break;
                case 3:
                    if (!(message.award_genome && message.award_genome.length))
                        message.award_genome = [];
                    message.award_genome.push($root.pb_test.Pt_BaseGene.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Verifies a DrawAward message.
         * @function verify
         * @memberof pb_test.DrawAward
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DrawAward.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.award_goods != null && message.hasOwnProperty("award_goods")) {
                if (!Array.isArray(message.award_goods))
                    return "award_goods: array expected";
                for (var i = 0; i < message.award_goods.length; ++i) {
                    var error = $root.pb_test.Pt_BaseGoods.verify(message.award_goods[i]);
                    if (error)
                        return "award_goods." + error;
                }
            }
            if (message.award_asset != null && message.hasOwnProperty("award_asset")) {
                if (!Array.isArray(message.award_asset))
                    return "award_asset: array expected";
                for (var i = 0; i < message.award_asset.length; ++i) {
                    var error = $root.pb_test.Pt_GetAsset.verify(message.award_asset[i]);
                    if (error)
                        return "award_asset." + error;
                }
            }
            if (message.award_genome != null && message.hasOwnProperty("award_genome")) {
                if (!Array.isArray(message.award_genome))
                    return "award_genome: array expected";
                for (var i = 0; i < message.award_genome.length; ++i) {
                    var error = $root.pb_test.Pt_BaseGene.verify(message.award_genome[i]);
                    if (error)
                        return "award_genome." + error;
                }
            }
            return null;
        };

        return DrawAward;
    })();

    pb_test.HeroExpMsg = (function() {

        /**
         * Properties of a HeroExpMsg.
         * @memberof pb_test
         * @interface IHeroExpMsg
         * @property {number} hero_id HeroExpMsg hero_id
         * @property {number} grade HeroExpMsg grade
         * @property {number} exp HeroExpMsg exp
         */

        /**
         * Constructs a new HeroExpMsg.
         * @memberof pb_test
         * @classdesc Represents a HeroExpMsg.
         * @implements IHeroExpMsg
         * @constructor
         * @param {pb_test.IHeroExpMsg=} [properties] Properties to set
         */
        function HeroExpMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * HeroExpMsg hero_id.
         * @member {number} hero_id
         * @memberof pb_test.HeroExpMsg
         * @instance
         */
        HeroExpMsg.prototype.hero_id = 0;

        /**
         * HeroExpMsg grade.
         * @member {number} grade
         * @memberof pb_test.HeroExpMsg
         * @instance
         */
        HeroExpMsg.prototype.grade = 0;

        /**
         * HeroExpMsg exp.
         * @member {number} exp
         * @memberof pb_test.HeroExpMsg
         * @instance
         */
        HeroExpMsg.prototype.exp = 0;

        /**
         * Creates a new HeroExpMsg instance using the specified properties.
         * @function create
         * @memberof pb_test.HeroExpMsg
         * @static
         * @param {pb_test.IHeroExpMsg=} [properties] Properties to set
         * @returns {pb_test.HeroExpMsg} HeroExpMsg instance
         */
        HeroExpMsg.create = function create(properties) {
            return new HeroExpMsg(properties);
        };

        /**
         * Encodes the specified HeroExpMsg message. Does not implicitly {@link pb_test.HeroExpMsg.verify|verify} messages.
         * @function encode
         * @memberof pb_test.HeroExpMsg
         * @static
         * @param {pb_test.IHeroExpMsg} message HeroExpMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        HeroExpMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.hero_id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.grade);
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.exp);
            return writer;
        };

        /**
         * Decodes a HeroExpMsg message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.HeroExpMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.HeroExpMsg} HeroExpMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        HeroExpMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.HeroExpMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.hero_id = reader.uint32();
                    break;
                case 2:
                    message.grade = reader.uint32();
                    break;
                case 3:
                    message.exp = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("hero_id"))
                throw $util.ProtocolError("missing required 'hero_id'", { instance: message });
            if (!message.hasOwnProperty("grade"))
                throw $util.ProtocolError("missing required 'grade'", { instance: message });
            if (!message.hasOwnProperty("exp"))
                throw $util.ProtocolError("missing required 'exp'", { instance: message });
            return message;
        };

        /**
         * Verifies a HeroExpMsg message.
         * @function verify
         * @memberof pb_test.HeroExpMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        HeroExpMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.hero_id))
                return "hero_id: integer expected";
            if (!$util.isInteger(message.grade))
                return "grade: integer expected";
            if (!$util.isInteger(message.exp))
                return "exp: integer expected";
            return null;
        };

        return HeroExpMsg;
    })();

    pb_test.BattleAward = (function() {

        /**
         * Properties of a BattleAward.
         * @memberof pb_test
         * @interface IBattleAward
         * @property {Array.<pb_test.IDrawAward>|null} [draw_award] BattleAward draw_award
         * @property {Array.<pb_test.IHeroExpMsg>|null} [hero_exp_msg] BattleAward hero_exp_msg
         */

        /**
         * Constructs a new BattleAward.
         * @memberof pb_test
         * @classdesc Represents a BattleAward.
         * @implements IBattleAward
         * @constructor
         * @param {pb_test.IBattleAward=} [properties] Properties to set
         */
        function BattleAward(properties) {
            this.draw_award = [];
            this.hero_exp_msg = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BattleAward draw_award.
         * @member {Array.<pb_test.IDrawAward>} draw_award
         * @memberof pb_test.BattleAward
         * @instance
         */
        BattleAward.prototype.draw_award = $util.emptyArray;

        /**
         * BattleAward hero_exp_msg.
         * @member {Array.<pb_test.IHeroExpMsg>} hero_exp_msg
         * @memberof pb_test.BattleAward
         * @instance
         */
        BattleAward.prototype.hero_exp_msg = $util.emptyArray;

        /**
         * Creates a new BattleAward instance using the specified properties.
         * @function create
         * @memberof pb_test.BattleAward
         * @static
         * @param {pb_test.IBattleAward=} [properties] Properties to set
         * @returns {pb_test.BattleAward} BattleAward instance
         */
        BattleAward.create = function create(properties) {
            return new BattleAward(properties);
        };

        /**
         * Encodes the specified BattleAward message. Does not implicitly {@link pb_test.BattleAward.verify|verify} messages.
         * @function encode
         * @memberof pb_test.BattleAward
         * @static
         * @param {pb_test.IBattleAward} message BattleAward message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BattleAward.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.draw_award != null && message.draw_award.length)
                for (var i = 0; i < message.draw_award.length; ++i)
                    $root.pb_test.DrawAward.encode(message.draw_award[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.hero_exp_msg != null && message.hero_exp_msg.length)
                for (var i = 0; i < message.hero_exp_msg.length; ++i)
                    $root.pb_test.HeroExpMsg.encode(message.hero_exp_msg[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a BattleAward message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.BattleAward
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.BattleAward} BattleAward
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BattleAward.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.BattleAward();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.draw_award && message.draw_award.length))
                        message.draw_award = [];
                    message.draw_award.push($root.pb_test.DrawAward.decode(reader, reader.uint32()));
                    break;
                case 2:
                    if (!(message.hero_exp_msg && message.hero_exp_msg.length))
                        message.hero_exp_msg = [];
                    message.hero_exp_msg.push($root.pb_test.HeroExpMsg.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Verifies a BattleAward message.
         * @function verify
         * @memberof pb_test.BattleAward
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BattleAward.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.draw_award != null && message.hasOwnProperty("draw_award")) {
                if (!Array.isArray(message.draw_award))
                    return "draw_award: array expected";
                for (var i = 0; i < message.draw_award.length; ++i) {
                    var error = $root.pb_test.DrawAward.verify(message.draw_award[i]);
                    if (error)
                        return "draw_award." + error;
                }
            }
            if (message.hero_exp_msg != null && message.hasOwnProperty("hero_exp_msg")) {
                if (!Array.isArray(message.hero_exp_msg))
                    return "hero_exp_msg: array expected";
                for (var i = 0; i < message.hero_exp_msg.length; ++i) {
                    var error = $root.pb_test.HeroExpMsg.verify(message.hero_exp_msg[i]);
                    if (error)
                        return "hero_exp_msg." + error;
                }
            }
            return null;
        };

        return BattleAward;
    })();

    pb_test.Pt_AttList = (function() {

        /**
         * Properties of a Pt_AttList.
         * @memberof pb_test
         * @interface IPt_AttList
         * @property {number} att_id Pt_AttList att_id
         * @property {number} att_value Pt_AttList att_value
         */

        /**
         * Constructs a new Pt_AttList.
         * @memberof pb_test
         * @classdesc Represents a Pt_AttList.
         * @implements IPt_AttList
         * @constructor
         * @param {pb_test.IPt_AttList=} [properties] Properties to set
         */
        function Pt_AttList(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_AttList att_id.
         * @member {number} att_id
         * @memberof pb_test.Pt_AttList
         * @instance
         */
        Pt_AttList.prototype.att_id = 0;

        /**
         * Pt_AttList att_value.
         * @member {number} att_value
         * @memberof pb_test.Pt_AttList
         * @instance
         */
        Pt_AttList.prototype.att_value = 0;

        /**
         * Creates a new Pt_AttList instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_AttList
         * @static
         * @param {pb_test.IPt_AttList=} [properties] Properties to set
         * @returns {pb_test.Pt_AttList} Pt_AttList instance
         */
        Pt_AttList.create = function create(properties) {
            return new Pt_AttList(properties);
        };

        /**
         * Encodes the specified Pt_AttList message. Does not implicitly {@link pb_test.Pt_AttList.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_AttList
         * @static
         * @param {pb_test.IPt_AttList} message Pt_AttList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_AttList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.att_id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.att_value);
            return writer;
        };

        /**
         * Decodes a Pt_AttList message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_AttList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_AttList} Pt_AttList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_AttList.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_AttList();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.att_id = reader.uint32();
                    break;
                case 2:
                    message.att_value = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("att_id"))
                throw $util.ProtocolError("missing required 'att_id'", { instance: message });
            if (!message.hasOwnProperty("att_value"))
                throw $util.ProtocolError("missing required 'att_value'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_AttList message.
         * @function verify
         * @memberof pb_test.Pt_AttList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_AttList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.att_id))
                return "att_id: integer expected";
            if (!$util.isInteger(message.att_value))
                return "att_value: integer expected";
            return null;
        };

        return Pt_AttList;
    })();

    pb_test.Pt_HeroAttList = (function() {

        /**
         * Properties of a Pt_HeroAttList.
         * @memberof pb_test
         * @interface IPt_HeroAttList
         * @property {number|Long} hid Pt_HeroAttList hid
         * @property {number} hero_id Pt_HeroAttList hero_id
         * @property {number} index_id Pt_HeroAttList index_id
         * @property {Array.<pb_test.IPt_AttList>|null} [att_list] Pt_HeroAttList att_list
         */

        /**
         * Constructs a new Pt_HeroAttList.
         * @memberof pb_test
         * @classdesc Represents a Pt_HeroAttList.
         * @implements IPt_HeroAttList
         * @constructor
         * @param {pb_test.IPt_HeroAttList=} [properties] Properties to set
         */
        function Pt_HeroAttList(properties) {
            this.att_list = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_HeroAttList hid.
         * @member {number|Long} hid
         * @memberof pb_test.Pt_HeroAttList
         * @instance
         */
        Pt_HeroAttList.prototype.hid = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Pt_HeroAttList hero_id.
         * @member {number} hero_id
         * @memberof pb_test.Pt_HeroAttList
         * @instance
         */
        Pt_HeroAttList.prototype.hero_id = 0;

        /**
         * Pt_HeroAttList index_id.
         * @member {number} index_id
         * @memberof pb_test.Pt_HeroAttList
         * @instance
         */
        Pt_HeroAttList.prototype.index_id = 0;

        /**
         * Pt_HeroAttList att_list.
         * @member {Array.<pb_test.IPt_AttList>} att_list
         * @memberof pb_test.Pt_HeroAttList
         * @instance
         */
        Pt_HeroAttList.prototype.att_list = $util.emptyArray;

        /**
         * Creates a new Pt_HeroAttList instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_HeroAttList
         * @static
         * @param {pb_test.IPt_HeroAttList=} [properties] Properties to set
         * @returns {pb_test.Pt_HeroAttList} Pt_HeroAttList instance
         */
        Pt_HeroAttList.create = function create(properties) {
            return new Pt_HeroAttList(properties);
        };

        /**
         * Encodes the specified Pt_HeroAttList message. Does not implicitly {@link pb_test.Pt_HeroAttList.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_HeroAttList
         * @static
         * @param {pb_test.IPt_HeroAttList} message Pt_HeroAttList message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_HeroAttList.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.hid);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.hero_id);
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.index_id);
            if (message.att_list != null && message.att_list.length)
                for (var i = 0; i < message.att_list.length; ++i)
                    $root.pb_test.Pt_AttList.encode(message.att_list[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Pt_HeroAttList message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_HeroAttList
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_HeroAttList} Pt_HeroAttList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_HeroAttList.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_HeroAttList();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.hid = reader.uint64();
                    break;
                case 2:
                    message.hero_id = reader.uint32();
                    break;
                case 3:
                    message.index_id = reader.uint32();
                    break;
                case 4:
                    if (!(message.att_list && message.att_list.length))
                        message.att_list = [];
                    message.att_list.push($root.pb_test.Pt_AttList.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("hid"))
                throw $util.ProtocolError("missing required 'hid'", { instance: message });
            if (!message.hasOwnProperty("hero_id"))
                throw $util.ProtocolError("missing required 'hero_id'", { instance: message });
            if (!message.hasOwnProperty("index_id"))
                throw $util.ProtocolError("missing required 'index_id'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_HeroAttList message.
         * @function verify
         * @memberof pb_test.Pt_HeroAttList
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_HeroAttList.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.hid) && !(message.hid && $util.isInteger(message.hid.low) && $util.isInteger(message.hid.high)))
                return "hid: integer|Long expected";
            if (!$util.isInteger(message.hero_id))
                return "hero_id: integer expected";
            if (!$util.isInteger(message.index_id))
                return "index_id: integer expected";
            if (message.att_list != null && message.hasOwnProperty("att_list")) {
                if (!Array.isArray(message.att_list))
                    return "att_list: array expected";
                for (var i = 0; i < message.att_list.length; ++i) {
                    var error = $root.pb_test.Pt_AttList.verify(message.att_list[i]);
                    if (error)
                        return "att_list." + error;
                }
            }
            return null;
        };

        return Pt_HeroAttList;
    })();

    pb_test.Pt_SkillItem = (function() {

        /**
         * Properties of a Pt_SkillItem.
         * @memberof pb_test
         * @interface IPt_SkillItem
         * @property {number} cfg_skill_id Pt_SkillItem cfg_skill_id
         * @property {number} lvl Pt_SkillItem lvl
         * @property {number} extra_hurt Pt_SkillItem extra_hurt
         */

        /**
         * Constructs a new Pt_SkillItem.
         * @memberof pb_test
         * @classdesc Represents a Pt_SkillItem.
         * @implements IPt_SkillItem
         * @constructor
         * @param {pb_test.IPt_SkillItem=} [properties] Properties to set
         */
        function Pt_SkillItem(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_SkillItem cfg_skill_id.
         * @member {number} cfg_skill_id
         * @memberof pb_test.Pt_SkillItem
         * @instance
         */
        Pt_SkillItem.prototype.cfg_skill_id = 0;

        /**
         * Pt_SkillItem lvl.
         * @member {number} lvl
         * @memberof pb_test.Pt_SkillItem
         * @instance
         */
        Pt_SkillItem.prototype.lvl = 0;

        /**
         * Pt_SkillItem extra_hurt.
         * @member {number} extra_hurt
         * @memberof pb_test.Pt_SkillItem
         * @instance
         */
        Pt_SkillItem.prototype.extra_hurt = 0;

        /**
         * Creates a new Pt_SkillItem instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_SkillItem
         * @static
         * @param {pb_test.IPt_SkillItem=} [properties] Properties to set
         * @returns {pb_test.Pt_SkillItem} Pt_SkillItem instance
         */
        Pt_SkillItem.create = function create(properties) {
            return new Pt_SkillItem(properties);
        };

        /**
         * Encodes the specified Pt_SkillItem message. Does not implicitly {@link pb_test.Pt_SkillItem.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_SkillItem
         * @static
         * @param {pb_test.IPt_SkillItem} message Pt_SkillItem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_SkillItem.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.cfg_skill_id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.lvl);
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.extra_hurt);
            return writer;
        };

        /**
         * Decodes a Pt_SkillItem message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_SkillItem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_SkillItem} Pt_SkillItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_SkillItem.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_SkillItem();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.cfg_skill_id = reader.uint32();
                    break;
                case 2:
                    message.lvl = reader.uint32();
                    break;
                case 3:
                    message.extra_hurt = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("cfg_skill_id"))
                throw $util.ProtocolError("missing required 'cfg_skill_id'", { instance: message });
            if (!message.hasOwnProperty("lvl"))
                throw $util.ProtocolError("missing required 'lvl'", { instance: message });
            if (!message.hasOwnProperty("extra_hurt"))
                throw $util.ProtocolError("missing required 'extra_hurt'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_SkillItem message.
         * @function verify
         * @memberof pb_test.Pt_SkillItem
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_SkillItem.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.cfg_skill_id))
                return "cfg_skill_id: integer expected";
            if (!$util.isInteger(message.lvl))
                return "lvl: integer expected";
            if (!$util.isInteger(message.extra_hurt))
                return "extra_hurt: integer expected";
            return null;
        };

        return Pt_SkillItem;
    })();

    pb_test.Pt_WarHeroAtt = (function() {

        /**
         * Properties of a Pt_WarHeroAtt.
         * @memberof pb_test
         * @interface IPt_WarHeroAtt
         * @property {pb_test.IPt_HeroAttList} HeroAtt Pt_WarHeroAtt HeroAtt
         * @property {Array.<pb_test.IPt_SkillItem>|null} [skill_items] Pt_WarHeroAtt skill_items
         * @property {Array.<pb_test.IPt_SkillItem>|null} [p_skill_items] Pt_WarHeroAtt p_skill_items
         */

        /**
         * Constructs a new Pt_WarHeroAtt.
         * @memberof pb_test
         * @classdesc Represents a Pt_WarHeroAtt.
         * @implements IPt_WarHeroAtt
         * @constructor
         * @param {pb_test.IPt_WarHeroAtt=} [properties] Properties to set
         */
        function Pt_WarHeroAtt(properties) {
            this.skill_items = [];
            this.p_skill_items = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_WarHeroAtt HeroAtt.
         * @member {pb_test.IPt_HeroAttList} HeroAtt
         * @memberof pb_test.Pt_WarHeroAtt
         * @instance
         */
        Pt_WarHeroAtt.prototype.HeroAtt = null;

        /**
         * Pt_WarHeroAtt skill_items.
         * @member {Array.<pb_test.IPt_SkillItem>} skill_items
         * @memberof pb_test.Pt_WarHeroAtt
         * @instance
         */
        Pt_WarHeroAtt.prototype.skill_items = $util.emptyArray;

        /**
         * Pt_WarHeroAtt p_skill_items.
         * @member {Array.<pb_test.IPt_SkillItem>} p_skill_items
         * @memberof pb_test.Pt_WarHeroAtt
         * @instance
         */
        Pt_WarHeroAtt.prototype.p_skill_items = $util.emptyArray;

        /**
         * Creates a new Pt_WarHeroAtt instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_WarHeroAtt
         * @static
         * @param {pb_test.IPt_WarHeroAtt=} [properties] Properties to set
         * @returns {pb_test.Pt_WarHeroAtt} Pt_WarHeroAtt instance
         */
        Pt_WarHeroAtt.create = function create(properties) {
            return new Pt_WarHeroAtt(properties);
        };

        /**
         * Encodes the specified Pt_WarHeroAtt message. Does not implicitly {@link pb_test.Pt_WarHeroAtt.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_WarHeroAtt
         * @static
         * @param {pb_test.IPt_WarHeroAtt} message Pt_WarHeroAtt message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_WarHeroAtt.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.Pt_HeroAttList.encode(message.HeroAtt, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.skill_items != null && message.skill_items.length)
                for (var i = 0; i < message.skill_items.length; ++i)
                    $root.pb_test.Pt_SkillItem.encode(message.skill_items[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.p_skill_items != null && message.p_skill_items.length)
                for (var i = 0; i < message.p_skill_items.length; ++i)
                    $root.pb_test.Pt_SkillItem.encode(message.p_skill_items[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Pt_WarHeroAtt message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_WarHeroAtt
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_WarHeroAtt} Pt_WarHeroAtt
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_WarHeroAtt.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_WarHeroAtt();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.HeroAtt = $root.pb_test.Pt_HeroAttList.decode(reader, reader.uint32());
                    break;
                case 2:
                    if (!(message.skill_items && message.skill_items.length))
                        message.skill_items = [];
                    message.skill_items.push($root.pb_test.Pt_SkillItem.decode(reader, reader.uint32()));
                    break;
                case 3:
                    if (!(message.p_skill_items && message.p_skill_items.length))
                        message.p_skill_items = [];
                    message.p_skill_items.push($root.pb_test.Pt_SkillItem.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("HeroAtt"))
                throw $util.ProtocolError("missing required 'HeroAtt'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_WarHeroAtt message.
         * @function verify
         * @memberof pb_test.Pt_WarHeroAtt
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_WarHeroAtt.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.Pt_HeroAttList.verify(message.HeroAtt);
                if (error)
                    return "HeroAtt." + error;
            }
            if (message.skill_items != null && message.hasOwnProperty("skill_items")) {
                if (!Array.isArray(message.skill_items))
                    return "skill_items: array expected";
                for (var i = 0; i < message.skill_items.length; ++i) {
                    var error = $root.pb_test.Pt_SkillItem.verify(message.skill_items[i]);
                    if (error)
                        return "skill_items." + error;
                }
            }
            if (message.p_skill_items != null && message.hasOwnProperty("p_skill_items")) {
                if (!Array.isArray(message.p_skill_items))
                    return "p_skill_items: array expected";
                for (var i = 0; i < message.p_skill_items.length; ++i) {
                    var error = $root.pb_test.Pt_SkillItem.verify(message.p_skill_items[i]);
                    if (error)
                        return "p_skill_items." + error;
                }
            }
            return null;
        };

        return Pt_WarHeroAtt;
    })();

    pb_test.Cs_10000001 = (function() {

        /**
         * Properties of a Cs_10000001.
         * @memberof pb_test
         * @interface ICs_10000001
         * @property {string} mg_name Cs_10000001 mg_name
         * @property {number} id Cs_10000001 id
         * @property {number} num Cs_10000001 num
         */

        /**
         * Constructs a new Cs_10000001.
         * @memberof pb_test
         * @classdesc Represents a Cs_10000001.
         * @implements ICs_10000001
         * @constructor
         * @param {pb_test.ICs_10000001=} [properties] Properties to set
         */
        function Cs_10000001(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Cs_10000001 mg_name.
         * @member {string} mg_name
         * @memberof pb_test.Cs_10000001
         * @instance
         */
        Cs_10000001.prototype.mg_name = "";

        /**
         * Cs_10000001 id.
         * @member {number} id
         * @memberof pb_test.Cs_10000001
         * @instance
         */
        Cs_10000001.prototype.id = 0;

        /**
         * Cs_10000001 num.
         * @member {number} num
         * @memberof pb_test.Cs_10000001
         * @instance
         */
        Cs_10000001.prototype.num = 0;

        /**
         * Creates a new Cs_10000001 instance using the specified properties.
         * @function create
         * @memberof pb_test.Cs_10000001
         * @static
         * @param {pb_test.ICs_10000001=} [properties] Properties to set
         * @returns {pb_test.Cs_10000001} Cs_10000001 instance
         */
        Cs_10000001.create = function create(properties) {
            return new Cs_10000001(properties);
        };

        /**
         * Encodes the specified Cs_10000001 message. Does not implicitly {@link pb_test.Cs_10000001.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Cs_10000001
         * @static
         * @param {pb_test.ICs_10000001} message Cs_10000001 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Cs_10000001.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.mg_name);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.id);
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.num);
            return writer;
        };

        /**
         * Decodes a Cs_10000001 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Cs_10000001
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Cs_10000001} Cs_10000001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Cs_10000001.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Cs_10000001();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.mg_name = reader.string();
                    break;
                case 2:
                    message.id = reader.uint32();
                    break;
                case 3:
                    message.num = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("mg_name"))
                throw $util.ProtocolError("missing required 'mg_name'", { instance: message });
            if (!message.hasOwnProperty("id"))
                throw $util.ProtocolError("missing required 'id'", { instance: message });
            if (!message.hasOwnProperty("num"))
                throw $util.ProtocolError("missing required 'num'", { instance: message });
            return message;
        };

        /**
         * Verifies a Cs_10000001 message.
         * @function verify
         * @memberof pb_test.Cs_10000001
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Cs_10000001.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.mg_name))
                return "mg_name: string expected";
            if (!$util.isInteger(message.id))
                return "id: integer expected";
            if (!$util.isInteger(message.num))
                return "num: integer expected";
            return null;
        };

        return Cs_10000001;
    })();

    pb_test.Sc_10000001 = (function() {

        /**
         * Properties of a Sc_10000001.
         * @memberof pb_test
         * @interface ISc_10000001
         * @property {pb_test.IResData} res Sc_10000001 res
         */

        /**
         * Constructs a new Sc_10000001.
         * @memberof pb_test
         * @classdesc Represents a Sc_10000001.
         * @implements ISc_10000001
         * @constructor
         * @param {pb_test.ISc_10000001=} [properties] Properties to set
         */
        function Sc_10000001(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_10000001 res.
         * @member {pb_test.IResData} res
         * @memberof pb_test.Sc_10000001
         * @instance
         */
        Sc_10000001.prototype.res = null;

        /**
         * Creates a new Sc_10000001 instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_10000001
         * @static
         * @param {pb_test.ISc_10000001=} [properties] Properties to set
         * @returns {pb_test.Sc_10000001} Sc_10000001 instance
         */
        Sc_10000001.create = function create(properties) {
            return new Sc_10000001(properties);
        };

        /**
         * Encodes the specified Sc_10000001 message. Does not implicitly {@link pb_test.Sc_10000001.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_10000001
         * @static
         * @param {pb_test.ISc_10000001} message Sc_10000001 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_10000001.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.ResData.encode(message.res, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Sc_10000001 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_10000001
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_10000001} Sc_10000001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_10000001.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_10000001();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.res = $root.pb_test.ResData.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("res"))
                throw $util.ProtocolError("missing required 'res'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_10000001 message.
         * @function verify
         * @memberof pb_test.Sc_10000001
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_10000001.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.ResData.verify(message.res);
                if (error)
                    return "res." + error;
            }
            return null;
        };

        return Sc_10000001;
    })();

    pb_test.Cs_Handshake = (function() {

        /**
         * Properties of a Cs_Handshake.
         * @memberof pb_test
         * @interface ICs_Handshake
         * @property {string} ver Cs_Handshake ver
         */

        /**
         * Constructs a new Cs_Handshake.
         * @memberof pb_test
         * @classdesc Represents a Cs_Handshake.
         * @implements ICs_Handshake
         * @constructor
         * @param {pb_test.ICs_Handshake=} [properties] Properties to set
         */
        function Cs_Handshake(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Cs_Handshake ver.
         * @member {string} ver
         * @memberof pb_test.Cs_Handshake
         * @instance
         */
        Cs_Handshake.prototype.ver = "";

        /**
         * Creates a new Cs_Handshake instance using the specified properties.
         * @function create
         * @memberof pb_test.Cs_Handshake
         * @static
         * @param {pb_test.ICs_Handshake=} [properties] Properties to set
         * @returns {pb_test.Cs_Handshake} Cs_Handshake instance
         */
        Cs_Handshake.create = function create(properties) {
            return new Cs_Handshake(properties);
        };

        /**
         * Encodes the specified Cs_Handshake message. Does not implicitly {@link pb_test.Cs_Handshake.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Cs_Handshake
         * @static
         * @param {pb_test.ICs_Handshake} message Cs_Handshake message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Cs_Handshake.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.ver);
            return writer;
        };

        /**
         * Decodes a Cs_Handshake message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Cs_Handshake
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Cs_Handshake} Cs_Handshake
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Cs_Handshake.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Cs_Handshake();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.ver = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("ver"))
                throw $util.ProtocolError("missing required 'ver'", { instance: message });
            return message;
        };

        /**
         * Verifies a Cs_Handshake message.
         * @function verify
         * @memberof pb_test.Cs_Handshake
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Cs_Handshake.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.ver))
                return "ver: string expected";
            return null;
        };

        return Cs_Handshake;
    })();

    pb_test.Cs_Handshake_Ack = (function() {

        /**
         * Properties of a Cs_Handshake_Ack.
         * @memberof pb_test
         * @interface ICs_Handshake_Ack
         */

        /**
         * Constructs a new Cs_Handshake_Ack.
         * @memberof pb_test
         * @classdesc Represents a Cs_Handshake_Ack.
         * @implements ICs_Handshake_Ack
         * @constructor
         * @param {pb_test.ICs_Handshake_Ack=} [properties] Properties to set
         */
        function Cs_Handshake_Ack(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new Cs_Handshake_Ack instance using the specified properties.
         * @function create
         * @memberof pb_test.Cs_Handshake_Ack
         * @static
         * @param {pb_test.ICs_Handshake_Ack=} [properties] Properties to set
         * @returns {pb_test.Cs_Handshake_Ack} Cs_Handshake_Ack instance
         */
        Cs_Handshake_Ack.create = function create(properties) {
            return new Cs_Handshake_Ack(properties);
        };

        /**
         * Encodes the specified Cs_Handshake_Ack message. Does not implicitly {@link pb_test.Cs_Handshake_Ack.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Cs_Handshake_Ack
         * @static
         * @param {pb_test.ICs_Handshake_Ack} message Cs_Handshake_Ack message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Cs_Handshake_Ack.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Decodes a Cs_Handshake_Ack message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Cs_Handshake_Ack
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Cs_Handshake_Ack} Cs_Handshake_Ack
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Cs_Handshake_Ack.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Cs_Handshake_Ack();
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
         * Verifies a Cs_Handshake_Ack message.
         * @function verify
         * @memberof pb_test.Cs_Handshake_Ack
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Cs_Handshake_Ack.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        return Cs_Handshake_Ack;
    })();

    pb_test.Heartbeat = (function() {

        /**
         * Properties of a Heartbeat.
         * @memberof pb_test
         * @interface IHeartbeat
         */

        /**
         * Constructs a new Heartbeat.
         * @memberof pb_test
         * @classdesc Represents a Heartbeat.
         * @implements IHeartbeat
         * @constructor
         * @param {pb_test.IHeartbeat=} [properties] Properties to set
         */
        function Heartbeat(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new Heartbeat instance using the specified properties.
         * @function create
         * @memberof pb_test.Heartbeat
         * @static
         * @param {pb_test.IHeartbeat=} [properties] Properties to set
         * @returns {pb_test.Heartbeat} Heartbeat instance
         */
        Heartbeat.create = function create(properties) {
            return new Heartbeat(properties);
        };

        /**
         * Encodes the specified Heartbeat message. Does not implicitly {@link pb_test.Heartbeat.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Heartbeat
         * @static
         * @param {pb_test.IHeartbeat} message Heartbeat message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Heartbeat.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Decodes a Heartbeat message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Heartbeat
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Heartbeat} Heartbeat
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Heartbeat.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Heartbeat();
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
         * Verifies a Heartbeat message.
         * @function verify
         * @memberof pb_test.Heartbeat
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Heartbeat.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        return Heartbeat;
    })();

    pb_test.Sc_Handshake = (function() {

        /**
         * Properties of a Sc_Handshake.
         * @memberof pb_test
         * @interface ISc_Handshake
         * @property {number} heartbeat Sc_Handshake heartbeat
         * @property {number} heartbeatTimeout Sc_Handshake heartbeatTimeout
         * @property {number} code 返回码
         * RES_OK 200
         * RES_FAIL 500
         * RES_OLD_CLIENT 501
         */

        /**
         * Constructs a new Sc_Handshake.
         * @memberof pb_test
         * @classdesc Represents a Sc_Handshake.
         * @implements ISc_Handshake
         * @constructor
         * @param {pb_test.ISc_Handshake=} [properties] Properties to set
         */
        function Sc_Handshake(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_Handshake heartbeat.
         * @member {number} heartbeat
         * @memberof pb_test.Sc_Handshake
         * @instance
         */
        Sc_Handshake.prototype.heartbeat = 0;

        /**
         * Sc_Handshake heartbeatTimeout.
         * @member {number} heartbeatTimeout
         * @memberof pb_test.Sc_Handshake
         * @instance
         */
        Sc_Handshake.prototype.heartbeatTimeout = 0;

        /**
         * 返回码
         * RES_OK 200
         * RES_FAIL 500
         * RES_OLD_CLIENT 501
         * @member {number} code
         * @memberof pb_test.Sc_Handshake
         * @instance
         */
        Sc_Handshake.prototype.code = 0;

        /**
         * Creates a new Sc_Handshake instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_Handshake
         * @static
         * @param {pb_test.ISc_Handshake=} [properties] Properties to set
         * @returns {pb_test.Sc_Handshake} Sc_Handshake instance
         */
        Sc_Handshake.create = function create(properties) {
            return new Sc_Handshake(properties);
        };

        /**
         * Encodes the specified Sc_Handshake message. Does not implicitly {@link pb_test.Sc_Handshake.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_Handshake
         * @static
         * @param {pb_test.ISc_Handshake} message Sc_Handshake message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_Handshake.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.heartbeat);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.heartbeatTimeout);
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.code);
            return writer;
        };

        /**
         * Decodes a Sc_Handshake message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_Handshake
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_Handshake} Sc_Handshake
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_Handshake.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_Handshake();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.heartbeat = reader.uint32();
                    break;
                case 2:
                    message.heartbeatTimeout = reader.uint32();
                    break;
                case 3:
                    message.code = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("heartbeat"))
                throw $util.ProtocolError("missing required 'heartbeat'", { instance: message });
            if (!message.hasOwnProperty("heartbeatTimeout"))
                throw $util.ProtocolError("missing required 'heartbeatTimeout'", { instance: message });
            if (!message.hasOwnProperty("code"))
                throw $util.ProtocolError("missing required 'code'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_Handshake message.
         * @function verify
         * @memberof pb_test.Sc_Handshake
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_Handshake.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.heartbeat))
                return "heartbeat: integer expected";
            if (!$util.isInteger(message.heartbeatTimeout))
                return "heartbeatTimeout: integer expected";
            if (!$util.isInteger(message.code))
                return "code: integer expected";
            return null;
        };

        return Sc_Handshake;
    })();

    pb_test.Pt_HeroMsg = (function() {

        /**
         * Properties of a Pt_HeroMsg.
         * @memberof pb_test
         * @interface IPt_HeroMsg
         * @property {number|Long} id Pt_HeroMsg id
         * @property {number} hero_id Pt_HeroMsg hero_id
         * @property {number} index_id Pt_HeroMsg index_id
         * @property {number} grade Pt_HeroMsg grade
         * @property {string} hero_name Pt_HeroMsg hero_name
         */

        /**
         * Constructs a new Pt_HeroMsg.
         * @memberof pb_test
         * @classdesc Represents a Pt_HeroMsg.
         * @implements IPt_HeroMsg
         * @constructor
         * @param {pb_test.IPt_HeroMsg=} [properties] Properties to set
         */
        function Pt_HeroMsg(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_HeroMsg id.
         * @member {number|Long} id
         * @memberof pb_test.Pt_HeroMsg
         * @instance
         */
        Pt_HeroMsg.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Pt_HeroMsg hero_id.
         * @member {number} hero_id
         * @memberof pb_test.Pt_HeroMsg
         * @instance
         */
        Pt_HeroMsg.prototype.hero_id = 0;

        /**
         * Pt_HeroMsg index_id.
         * @member {number} index_id
         * @memberof pb_test.Pt_HeroMsg
         * @instance
         */
        Pt_HeroMsg.prototype.index_id = 0;

        /**
         * Pt_HeroMsg grade.
         * @member {number} grade
         * @memberof pb_test.Pt_HeroMsg
         * @instance
         */
        Pt_HeroMsg.prototype.grade = 0;

        /**
         * Pt_HeroMsg hero_name.
         * @member {string} hero_name
         * @memberof pb_test.Pt_HeroMsg
         * @instance
         */
        Pt_HeroMsg.prototype.hero_name = "";

        /**
         * Creates a new Pt_HeroMsg instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_HeroMsg
         * @static
         * @param {pb_test.IPt_HeroMsg=} [properties] Properties to set
         * @returns {pb_test.Pt_HeroMsg} Pt_HeroMsg instance
         */
        Pt_HeroMsg.create = function create(properties) {
            return new Pt_HeroMsg(properties);
        };

        /**
         * Encodes the specified Pt_HeroMsg message. Does not implicitly {@link pb_test.Pt_HeroMsg.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_HeroMsg
         * @static
         * @param {pb_test.IPt_HeroMsg} message Pt_HeroMsg message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_HeroMsg.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.hero_id);
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.index_id);
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.grade);
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.hero_name);
            return writer;
        };

        /**
         * Decodes a Pt_HeroMsg message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_HeroMsg
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_HeroMsg} Pt_HeroMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_HeroMsg.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_HeroMsg();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.uint64();
                    break;
                case 2:
                    message.hero_id = reader.uint32();
                    break;
                case 3:
                    message.index_id = reader.uint32();
                    break;
                case 4:
                    message.grade = reader.uint32();
                    break;
                case 5:
                    message.hero_name = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("id"))
                throw $util.ProtocolError("missing required 'id'", { instance: message });
            if (!message.hasOwnProperty("hero_id"))
                throw $util.ProtocolError("missing required 'hero_id'", { instance: message });
            if (!message.hasOwnProperty("index_id"))
                throw $util.ProtocolError("missing required 'index_id'", { instance: message });
            if (!message.hasOwnProperty("grade"))
                throw $util.ProtocolError("missing required 'grade'", { instance: message });
            if (!message.hasOwnProperty("hero_name"))
                throw $util.ProtocolError("missing required 'hero_name'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_HeroMsg message.
         * @function verify
         * @memberof pb_test.Pt_HeroMsg
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_HeroMsg.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                return "id: integer|Long expected";
            if (!$util.isInteger(message.hero_id))
                return "hero_id: integer expected";
            if (!$util.isInteger(message.index_id))
                return "index_id: integer expected";
            if (!$util.isInteger(message.grade))
                return "grade: integer expected";
            if (!$util.isString(message.hero_name))
                return "hero_name: string expected";
            return null;
        };

        return Pt_HeroMsg;
    })();

    pb_test.Pt_RoleInfo = (function() {

        /**
         * Properties of a Pt_RoleInfo.
         * @memberof pb_test
         * @interface IPt_RoleInfo
         * @property {number|Long} role_id Pt_RoleInfo role_id
         * @property {number} headicon_id Pt_RoleInfo headicon_id
         * @property {string} nickname Pt_RoleInfo nickname
         * @property {number|Long} exp_pool Pt_RoleInfo exp_pool
         * @property {number} vip_grade Pt_RoleInfo vip_grade
         * @property {number} vip_exp Pt_RoleInfo vip_exp
         * @property {number} gold_coin Pt_RoleInfo gold_coin
         * @property {number} diamond Pt_RoleInfo diamond
         * @property {number} fighting Pt_RoleInfo fighting
         * @property {Array.<pb_test.IPt_HeroMsg>|null} [hero_list] Pt_RoleInfo hero_list
         */

        /**
         * Constructs a new Pt_RoleInfo.
         * @memberof pb_test
         * @classdesc Represents a Pt_RoleInfo.
         * @implements IPt_RoleInfo
         * @constructor
         * @param {pb_test.IPt_RoleInfo=} [properties] Properties to set
         */
        function Pt_RoleInfo(properties) {
            this.hero_list = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_RoleInfo role_id.
         * @member {number|Long} role_id
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.role_id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Pt_RoleInfo headicon_id.
         * @member {number} headicon_id
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.headicon_id = 0;

        /**
         * Pt_RoleInfo nickname.
         * @member {string} nickname
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.nickname = "";

        /**
         * Pt_RoleInfo exp_pool.
         * @member {number|Long} exp_pool
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.exp_pool = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Pt_RoleInfo vip_grade.
         * @member {number} vip_grade
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.vip_grade = 0;

        /**
         * Pt_RoleInfo vip_exp.
         * @member {number} vip_exp
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.vip_exp = 0;

        /**
         * Pt_RoleInfo gold_coin.
         * @member {number} gold_coin
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.gold_coin = 0;

        /**
         * Pt_RoleInfo diamond.
         * @member {number} diamond
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.diamond = 0;

        /**
         * Pt_RoleInfo fighting.
         * @member {number} fighting
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.fighting = 0;

        /**
         * Pt_RoleInfo hero_list.
         * @member {Array.<pb_test.IPt_HeroMsg>} hero_list
         * @memberof pb_test.Pt_RoleInfo
         * @instance
         */
        Pt_RoleInfo.prototype.hero_list = $util.emptyArray;

        /**
         * Creates a new Pt_RoleInfo instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_RoleInfo
         * @static
         * @param {pb_test.IPt_RoleInfo=} [properties] Properties to set
         * @returns {pb_test.Pt_RoleInfo} Pt_RoleInfo instance
         */
        Pt_RoleInfo.create = function create(properties) {
            return new Pt_RoleInfo(properties);
        };

        /**
         * Encodes the specified Pt_RoleInfo message. Does not implicitly {@link pb_test.Pt_RoleInfo.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_RoleInfo
         * @static
         * @param {pb_test.IPt_RoleInfo} message Pt_RoleInfo message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_RoleInfo.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.role_id);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.headicon_id);
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.nickname);
            writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.exp_pool);
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.vip_grade);
            writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.vip_exp);
            writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.gold_coin);
            writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.diamond);
            writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.fighting);
            if (message.hero_list != null && message.hero_list.length)
                for (var i = 0; i < message.hero_list.length; ++i)
                    $root.pb_test.Pt_HeroMsg.encode(message.hero_list[i], writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Pt_RoleInfo message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_RoleInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_RoleInfo} Pt_RoleInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_RoleInfo.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_RoleInfo();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.role_id = reader.uint64();
                    break;
                case 2:
                    message.headicon_id = reader.uint32();
                    break;
                case 3:
                    message.nickname = reader.string();
                    break;
                case 4:
                    message.exp_pool = reader.uint64();
                    break;
                case 5:
                    message.vip_grade = reader.uint32();
                    break;
                case 6:
                    message.vip_exp = reader.uint32();
                    break;
                case 7:
                    message.gold_coin = reader.uint32();
                    break;
                case 8:
                    message.diamond = reader.uint32();
                    break;
                case 9:
                    message.fighting = reader.uint32();
                    break;
                case 10:
                    if (!(message.hero_list && message.hero_list.length))
                        message.hero_list = [];
                    message.hero_list.push($root.pb_test.Pt_HeroMsg.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("role_id"))
                throw $util.ProtocolError("missing required 'role_id'", { instance: message });
            if (!message.hasOwnProperty("headicon_id"))
                throw $util.ProtocolError("missing required 'headicon_id'", { instance: message });
            if (!message.hasOwnProperty("nickname"))
                throw $util.ProtocolError("missing required 'nickname'", { instance: message });
            if (!message.hasOwnProperty("exp_pool"))
                throw $util.ProtocolError("missing required 'exp_pool'", { instance: message });
            if (!message.hasOwnProperty("vip_grade"))
                throw $util.ProtocolError("missing required 'vip_grade'", { instance: message });
            if (!message.hasOwnProperty("vip_exp"))
                throw $util.ProtocolError("missing required 'vip_exp'", { instance: message });
            if (!message.hasOwnProperty("gold_coin"))
                throw $util.ProtocolError("missing required 'gold_coin'", { instance: message });
            if (!message.hasOwnProperty("diamond"))
                throw $util.ProtocolError("missing required 'diamond'", { instance: message });
            if (!message.hasOwnProperty("fighting"))
                throw $util.ProtocolError("missing required 'fighting'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_RoleInfo message.
         * @function verify
         * @memberof pb_test.Pt_RoleInfo
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_RoleInfo.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.role_id) && !(message.role_id && $util.isInteger(message.role_id.low) && $util.isInteger(message.role_id.high)))
                return "role_id: integer|Long expected";
            if (!$util.isInteger(message.headicon_id))
                return "headicon_id: integer expected";
            if (!$util.isString(message.nickname))
                return "nickname: string expected";
            if (!$util.isInteger(message.exp_pool) && !(message.exp_pool && $util.isInteger(message.exp_pool.low) && $util.isInteger(message.exp_pool.high)))
                return "exp_pool: integer|Long expected";
            if (!$util.isInteger(message.vip_grade))
                return "vip_grade: integer expected";
            if (!$util.isInteger(message.vip_exp))
                return "vip_exp: integer expected";
            if (!$util.isInteger(message.gold_coin))
                return "gold_coin: integer expected";
            if (!$util.isInteger(message.diamond))
                return "diamond: integer expected";
            if (!$util.isInteger(message.fighting))
                return "fighting: integer expected";
            if (message.hero_list != null && message.hasOwnProperty("hero_list")) {
                if (!Array.isArray(message.hero_list))
                    return "hero_list: array expected";
                for (var i = 0; i < message.hero_list.length; ++i) {
                    var error = $root.pb_test.Pt_HeroMsg.verify(message.hero_list[i]);
                    if (error)
                        return "hero_list." + error;
                }
            }
            return null;
        };

        return Pt_RoleInfo;
    })();

    pb_test.Pt_Currency = (function() {

        /**
         * Properties of a Pt_Currency.
         * @memberof pb_test
         * @interface IPt_Currency
         * @property {number} vip_grade Pt_Currency vip_grade
         * @property {number} vip_exp Pt_Currency vip_exp
         * @property {number} gold_coin Pt_Currency gold_coin
         * @property {number} diamond Pt_Currency diamond
         * @property {number} fighting Pt_Currency fighting
         */

        /**
         * Constructs a new Pt_Currency.
         * @memberof pb_test
         * @classdesc Represents a Pt_Currency.
         * @implements IPt_Currency
         * @constructor
         * @param {pb_test.IPt_Currency=} [properties] Properties to set
         */
        function Pt_Currency(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Pt_Currency vip_grade.
         * @member {number} vip_grade
         * @memberof pb_test.Pt_Currency
         * @instance
         */
        Pt_Currency.prototype.vip_grade = 0;

        /**
         * Pt_Currency vip_exp.
         * @member {number} vip_exp
         * @memberof pb_test.Pt_Currency
         * @instance
         */
        Pt_Currency.prototype.vip_exp = 0;

        /**
         * Pt_Currency gold_coin.
         * @member {number} gold_coin
         * @memberof pb_test.Pt_Currency
         * @instance
         */
        Pt_Currency.prototype.gold_coin = 0;

        /**
         * Pt_Currency diamond.
         * @member {number} diamond
         * @memberof pb_test.Pt_Currency
         * @instance
         */
        Pt_Currency.prototype.diamond = 0;

        /**
         * Pt_Currency fighting.
         * @member {number} fighting
         * @memberof pb_test.Pt_Currency
         * @instance
         */
        Pt_Currency.prototype.fighting = 0;

        /**
         * Creates a new Pt_Currency instance using the specified properties.
         * @function create
         * @memberof pb_test.Pt_Currency
         * @static
         * @param {pb_test.IPt_Currency=} [properties] Properties to set
         * @returns {pb_test.Pt_Currency} Pt_Currency instance
         */
        Pt_Currency.create = function create(properties) {
            return new Pt_Currency(properties);
        };

        /**
         * Encodes the specified Pt_Currency message. Does not implicitly {@link pb_test.Pt_Currency.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Pt_Currency
         * @static
         * @param {pb_test.IPt_Currency} message Pt_Currency message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Pt_Currency.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.vip_grade);
            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.vip_exp);
            writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.gold_coin);
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.diamond);
            writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.fighting);
            return writer;
        };

        /**
         * Decodes a Pt_Currency message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Pt_Currency
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Pt_Currency} Pt_Currency
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Pt_Currency.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Pt_Currency();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.vip_grade = reader.uint32();
                    break;
                case 2:
                    message.vip_exp = reader.uint32();
                    break;
                case 3:
                    message.gold_coin = reader.uint32();
                    break;
                case 4:
                    message.diamond = reader.uint32();
                    break;
                case 5:
                    message.fighting = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("vip_grade"))
                throw $util.ProtocolError("missing required 'vip_grade'", { instance: message });
            if (!message.hasOwnProperty("vip_exp"))
                throw $util.ProtocolError("missing required 'vip_exp'", { instance: message });
            if (!message.hasOwnProperty("gold_coin"))
                throw $util.ProtocolError("missing required 'gold_coin'", { instance: message });
            if (!message.hasOwnProperty("diamond"))
                throw $util.ProtocolError("missing required 'diamond'", { instance: message });
            if (!message.hasOwnProperty("fighting"))
                throw $util.ProtocolError("missing required 'fighting'", { instance: message });
            return message;
        };

        /**
         * Verifies a Pt_Currency message.
         * @function verify
         * @memberof pb_test.Pt_Currency
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Pt_Currency.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.vip_grade))
                return "vip_grade: integer expected";
            if (!$util.isInteger(message.vip_exp))
                return "vip_exp: integer expected";
            if (!$util.isInteger(message.gold_coin))
                return "gold_coin: integer expected";
            if (!$util.isInteger(message.diamond))
                return "diamond: integer expected";
            if (!$util.isInteger(message.fighting))
                return "fighting: integer expected";
            return null;
        };

        return Pt_Currency;
    })();

    pb_test.Cs_10010001 = (function() {

        /**
         * Properties of a Cs_10010001.
         * @memberof pb_test
         * @interface ICs_10010001
         * @property {number} account_id Cs_10010001 account_id
         * @property {string} token Cs_10010001 token
         */

        /**
         * Constructs a new Cs_10010001.
         * @memberof pb_test
         * @classdesc Represents a Cs_10010001.
         * @implements ICs_10010001
         * @constructor
         * @param {pb_test.ICs_10010001=} [properties] Properties to set
         */
        function Cs_10010001(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Cs_10010001 account_id.
         * @member {number} account_id
         * @memberof pb_test.Cs_10010001
         * @instance
         */
        Cs_10010001.prototype.account_id = 0;

        /**
         * Cs_10010001 token.
         * @member {string} token
         * @memberof pb_test.Cs_10010001
         * @instance
         */
        Cs_10010001.prototype.token = "";

        /**
         * Creates a new Cs_10010001 instance using the specified properties.
         * @function create
         * @memberof pb_test.Cs_10010001
         * @static
         * @param {pb_test.ICs_10010001=} [properties] Properties to set
         * @returns {pb_test.Cs_10010001} Cs_10010001 instance
         */
        Cs_10010001.create = function create(properties) {
            return new Cs_10010001(properties);
        };

        /**
         * Encodes the specified Cs_10010001 message. Does not implicitly {@link pb_test.Cs_10010001.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Cs_10010001
         * @static
         * @param {pb_test.ICs_10010001} message Cs_10010001 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Cs_10010001.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.account_id);
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.token);
            return writer;
        };

        /**
         * Decodes a Cs_10010001 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Cs_10010001
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Cs_10010001} Cs_10010001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Cs_10010001.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Cs_10010001();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.account_id = reader.uint32();
                    break;
                case 2:
                    message.token = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("account_id"))
                throw $util.ProtocolError("missing required 'account_id'", { instance: message });
            if (!message.hasOwnProperty("token"))
                throw $util.ProtocolError("missing required 'token'", { instance: message });
            return message;
        };

        /**
         * Verifies a Cs_10010001 message.
         * @function verify
         * @memberof pb_test.Cs_10010001
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Cs_10010001.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.account_id))
                return "account_id: integer expected";
            if (!$util.isString(message.token))
                return "token: string expected";
            return null;
        };

        return Cs_10010001;
    })();

    pb_test.Sc_10010001 = (function() {

        /**
         * Properties of a Sc_10010001.
         * @memberof pb_test
         * @interface ISc_10010001
         * @property {pb_test.IResData} res Sc_10010001 res
         * @property {pb_test.IPt_RoleInfo|null} [role_info] Sc_10010001 role_info
         */

        /**
         * Constructs a new Sc_10010001.
         * @memberof pb_test
         * @classdesc Represents a Sc_10010001.
         * @implements ISc_10010001
         * @constructor
         * @param {pb_test.ISc_10010001=} [properties] Properties to set
         */
        function Sc_10010001(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_10010001 res.
         * @member {pb_test.IResData} res
         * @memberof pb_test.Sc_10010001
         * @instance
         */
        Sc_10010001.prototype.res = null;

        /**
         * Sc_10010001 role_info.
         * @member {pb_test.IPt_RoleInfo|null|undefined} role_info
         * @memberof pb_test.Sc_10010001
         * @instance
         */
        Sc_10010001.prototype.role_info = null;

        /**
         * Creates a new Sc_10010001 instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_10010001
         * @static
         * @param {pb_test.ISc_10010001=} [properties] Properties to set
         * @returns {pb_test.Sc_10010001} Sc_10010001 instance
         */
        Sc_10010001.create = function create(properties) {
            return new Sc_10010001(properties);
        };

        /**
         * Encodes the specified Sc_10010001 message. Does not implicitly {@link pb_test.Sc_10010001.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_10010001
         * @static
         * @param {pb_test.ISc_10010001} message Sc_10010001 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_10010001.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.ResData.encode(message.res, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.role_info != null && message.hasOwnProperty("role_info"))
                $root.pb_test.Pt_RoleInfo.encode(message.role_info, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Sc_10010001 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_10010001
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_10010001} Sc_10010001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_10010001.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_10010001();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.res = $root.pb_test.ResData.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.role_info = $root.pb_test.Pt_RoleInfo.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("res"))
                throw $util.ProtocolError("missing required 'res'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_10010001 message.
         * @function verify
         * @memberof pb_test.Sc_10010001
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_10010001.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.ResData.verify(message.res);
                if (error)
                    return "res." + error;
            }
            if (message.role_info != null && message.hasOwnProperty("role_info")) {
                var error = $root.pb_test.Pt_RoleInfo.verify(message.role_info);
                if (error)
                    return "role_info." + error;
            }
            return null;
        };

        return Sc_10010001;
    })();

    pb_test.Cs_10010002 = (function() {

        /**
         * Properties of a Cs_10010002.
         * @memberof pb_test
         * @interface ICs_10010002
         * @property {number} account_id Cs_10010002 account_id
         * @property {string} token Cs_10010002 token
         * @property {string} nickname Cs_10010002 nickname
         * @property {number} hero_id Cs_10010002 hero_id
         */

        /**
         * Constructs a new Cs_10010002.
         * @memberof pb_test
         * @classdesc Represents a Cs_10010002.
         * @implements ICs_10010002
         * @constructor
         * @param {pb_test.ICs_10010002=} [properties] Properties to set
         */
        function Cs_10010002(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Cs_10010002 account_id.
         * @member {number} account_id
         * @memberof pb_test.Cs_10010002
         * @instance
         */
        Cs_10010002.prototype.account_id = 0;

        /**
         * Cs_10010002 token.
         * @member {string} token
         * @memberof pb_test.Cs_10010002
         * @instance
         */
        Cs_10010002.prototype.token = "";

        /**
         * Cs_10010002 nickname.
         * @member {string} nickname
         * @memberof pb_test.Cs_10010002
         * @instance
         */
        Cs_10010002.prototype.nickname = "";

        /**
         * Cs_10010002 hero_id.
         * @member {number} hero_id
         * @memberof pb_test.Cs_10010002
         * @instance
         */
        Cs_10010002.prototype.hero_id = 0;

        /**
         * Creates a new Cs_10010002 instance using the specified properties.
         * @function create
         * @memberof pb_test.Cs_10010002
         * @static
         * @param {pb_test.ICs_10010002=} [properties] Properties to set
         * @returns {pb_test.Cs_10010002} Cs_10010002 instance
         */
        Cs_10010002.create = function create(properties) {
            return new Cs_10010002(properties);
        };

        /**
         * Encodes the specified Cs_10010002 message. Does not implicitly {@link pb_test.Cs_10010002.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Cs_10010002
         * @static
         * @param {pb_test.ICs_10010002} message Cs_10010002 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Cs_10010002.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.account_id);
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.token);
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.nickname);
            writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.hero_id);
            return writer;
        };

        /**
         * Decodes a Cs_10010002 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Cs_10010002
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Cs_10010002} Cs_10010002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Cs_10010002.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Cs_10010002();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.account_id = reader.uint32();
                    break;
                case 2:
                    message.token = reader.string();
                    break;
                case 3:
                    message.nickname = reader.string();
                    break;
                case 4:
                    message.hero_id = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("account_id"))
                throw $util.ProtocolError("missing required 'account_id'", { instance: message });
            if (!message.hasOwnProperty("token"))
                throw $util.ProtocolError("missing required 'token'", { instance: message });
            if (!message.hasOwnProperty("nickname"))
                throw $util.ProtocolError("missing required 'nickname'", { instance: message });
            if (!message.hasOwnProperty("hero_id"))
                throw $util.ProtocolError("missing required 'hero_id'", { instance: message });
            return message;
        };

        /**
         * Verifies a Cs_10010002 message.
         * @function verify
         * @memberof pb_test.Cs_10010002
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Cs_10010002.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.account_id))
                return "account_id: integer expected";
            if (!$util.isString(message.token))
                return "token: string expected";
            if (!$util.isString(message.nickname))
                return "nickname: string expected";
            if (!$util.isInteger(message.hero_id))
                return "hero_id: integer expected";
            return null;
        };

        return Cs_10010002;
    })();

    pb_test.Sc_10010002 = (function() {

        /**
         * Properties of a Sc_10010002.
         * @memberof pb_test
         * @interface ISc_10010002
         * @property {pb_test.IResData} res Sc_10010002 res
         */

        /**
         * Constructs a new Sc_10010002.
         * @memberof pb_test
         * @classdesc Represents a Sc_10010002.
         * @implements ISc_10010002
         * @constructor
         * @param {pb_test.ISc_10010002=} [properties] Properties to set
         */
        function Sc_10010002(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_10010002 res.
         * @member {pb_test.IResData} res
         * @memberof pb_test.Sc_10010002
         * @instance
         */
        Sc_10010002.prototype.res = null;

        /**
         * Creates a new Sc_10010002 instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_10010002
         * @static
         * @param {pb_test.ISc_10010002=} [properties] Properties to set
         * @returns {pb_test.Sc_10010002} Sc_10010002 instance
         */
        Sc_10010002.create = function create(properties) {
            return new Sc_10010002(properties);
        };

        /**
         * Encodes the specified Sc_10010002 message. Does not implicitly {@link pb_test.Sc_10010002.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_10010002
         * @static
         * @param {pb_test.ISc_10010002} message Sc_10010002 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_10010002.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.ResData.encode(message.res, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Sc_10010002 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_10010002
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_10010002} Sc_10010002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_10010002.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_10010002();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.res = $root.pb_test.ResData.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("res"))
                throw $util.ProtocolError("missing required 'res'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_10010002 message.
         * @function verify
         * @memberof pb_test.Sc_10010002
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_10010002.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.ResData.verify(message.res);
                if (error)
                    return "res." + error;
            }
            return null;
        };

        return Sc_10010002;
    })();

    pb_test.Cs_10010003 = (function() {

        /**
         * Properties of a Cs_10010003.
         * @memberof pb_test
         * @interface ICs_10010003
         * @property {number|null} [rand] Cs_10010003 rand
         */

        /**
         * Constructs a new Cs_10010003.
         * @memberof pb_test
         * @classdesc Represents a Cs_10010003.
         * @implements ICs_10010003
         * @constructor
         * @param {pb_test.ICs_10010003=} [properties] Properties to set
         */
        function Cs_10010003(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Cs_10010003 rand.
         * @member {number} rand
         * @memberof pb_test.Cs_10010003
         * @instance
         */
        Cs_10010003.prototype.rand = 0;

        /**
         * Creates a new Cs_10010003 instance using the specified properties.
         * @function create
         * @memberof pb_test.Cs_10010003
         * @static
         * @param {pb_test.ICs_10010003=} [properties] Properties to set
         * @returns {pb_test.Cs_10010003} Cs_10010003 instance
         */
        Cs_10010003.create = function create(properties) {
            return new Cs_10010003(properties);
        };

        /**
         * Encodes the specified Cs_10010003 message. Does not implicitly {@link pb_test.Cs_10010003.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Cs_10010003
         * @static
         * @param {pb_test.ICs_10010003} message Cs_10010003 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Cs_10010003.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.rand != null && message.hasOwnProperty("rand"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.rand);
            return writer;
        };

        /**
         * Decodes a Cs_10010003 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Cs_10010003
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Cs_10010003} Cs_10010003
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Cs_10010003.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Cs_10010003();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.rand = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Verifies a Cs_10010003 message.
         * @function verify
         * @memberof pb_test.Cs_10010003
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Cs_10010003.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.rand != null && message.hasOwnProperty("rand"))
                if (!$util.isInteger(message.rand))
                    return "rand: integer expected";
            return null;
        };

        return Cs_10010003;
    })();

    pb_test.Sc_10010003 = (function() {

        /**
         * Properties of a Sc_10010003.
         * @memberof pb_test
         * @interface ISc_10010003
         * @property {number} interval Sc_10010003 interval
         */

        /**
         * Constructs a new Sc_10010003.
         * @memberof pb_test
         * @classdesc Represents a Sc_10010003.
         * @implements ISc_10010003
         * @constructor
         * @param {pb_test.ISc_10010003=} [properties] Properties to set
         */
        function Sc_10010003(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_10010003 interval.
         * @member {number} interval
         * @memberof pb_test.Sc_10010003
         * @instance
         */
        Sc_10010003.prototype.interval = 0;

        /**
         * Creates a new Sc_10010003 instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_10010003
         * @static
         * @param {pb_test.ISc_10010003=} [properties] Properties to set
         * @returns {pb_test.Sc_10010003} Sc_10010003 instance
         */
        Sc_10010003.create = function create(properties) {
            return new Sc_10010003(properties);
        };

        /**
         * Encodes the specified Sc_10010003 message. Does not implicitly {@link pb_test.Sc_10010003.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_10010003
         * @static
         * @param {pb_test.ISc_10010003} message Sc_10010003 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_10010003.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.interval);
            return writer;
        };

        /**
         * Decodes a Sc_10010003 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_10010003
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_10010003} Sc_10010003
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_10010003.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_10010003();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.interval = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("interval"))
                throw $util.ProtocolError("missing required 'interval'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_10010003 message.
         * @function verify
         * @memberof pb_test.Sc_10010003
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_10010003.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.interval))
                return "interval: integer expected";
            return null;
        };

        return Sc_10010003;
    })();

    pb_test.Sc_10010004 = (function() {

        /**
         * Properties of a Sc_10010004.
         * @memberof pb_test
         * @interface ISc_10010004
         * @property {pb_test.IResData} res Sc_10010004 res
         */

        /**
         * Constructs a new Sc_10010004.
         * @memberof pb_test
         * @classdesc Represents a Sc_10010004.
         * @implements ISc_10010004
         * @constructor
         * @param {pb_test.ISc_10010004=} [properties] Properties to set
         */
        function Sc_10010004(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_10010004 res.
         * @member {pb_test.IResData} res
         * @memberof pb_test.Sc_10010004
         * @instance
         */
        Sc_10010004.prototype.res = null;

        /**
         * Creates a new Sc_10010004 instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_10010004
         * @static
         * @param {pb_test.ISc_10010004=} [properties] Properties to set
         * @returns {pb_test.Sc_10010004} Sc_10010004 instance
         */
        Sc_10010004.create = function create(properties) {
            return new Sc_10010004(properties);
        };

        /**
         * Encodes the specified Sc_10010004 message. Does not implicitly {@link pb_test.Sc_10010004.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_10010004
         * @static
         * @param {pb_test.ISc_10010004} message Sc_10010004 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_10010004.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.ResData.encode(message.res, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Sc_10010004 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_10010004
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_10010004} Sc_10010004
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_10010004.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_10010004();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.res = $root.pb_test.ResData.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("res"))
                throw $util.ProtocolError("missing required 'res'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_10010004 message.
         * @function verify
         * @memberof pb_test.Sc_10010004
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_10010004.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.ResData.verify(message.res);
                if (error)
                    return "res." + error;
            }
            return null;
        };

        return Sc_10010004;
    })();

    pb_test.Sc_10010005 = (function() {

        /**
         * Properties of a Sc_10010005.
         * @memberof pb_test
         * @interface ISc_10010005
         * @property {pb_test.IPt_Currency} currency Sc_10010005 currency
         */

        /**
         * Constructs a new Sc_10010005.
         * @memberof pb_test
         * @classdesc Represents a Sc_10010005.
         * @implements ISc_10010005
         * @constructor
         * @param {pb_test.ISc_10010005=} [properties] Properties to set
         */
        function Sc_10010005(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Sc_10010005 currency.
         * @member {pb_test.IPt_Currency} currency
         * @memberof pb_test.Sc_10010005
         * @instance
         */
        Sc_10010005.prototype.currency = null;

        /**
         * Creates a new Sc_10010005 instance using the specified properties.
         * @function create
         * @memberof pb_test.Sc_10010005
         * @static
         * @param {pb_test.ISc_10010005=} [properties] Properties to set
         * @returns {pb_test.Sc_10010005} Sc_10010005 instance
         */
        Sc_10010005.create = function create(properties) {
            return new Sc_10010005(properties);
        };

        /**
         * Encodes the specified Sc_10010005 message. Does not implicitly {@link pb_test.Sc_10010005.verify|verify} messages.
         * @function encode
         * @memberof pb_test.Sc_10010005
         * @static
         * @param {pb_test.ISc_10010005} message Sc_10010005 message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Sc_10010005.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            $root.pb_test.Pt_Currency.encode(message.currency, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Decodes a Sc_10010005 message from the specified reader or buffer.
         * @function decode
         * @memberof pb_test.Sc_10010005
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {pb_test.Sc_10010005} Sc_10010005
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Sc_10010005.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.pb_test.Sc_10010005();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.currency = $root.pb_test.Pt_Currency.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("currency"))
                throw $util.ProtocolError("missing required 'currency'", { instance: message });
            return message;
        };

        /**
         * Verifies a Sc_10010005 message.
         * @function verify
         * @memberof pb_test.Sc_10010005
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Sc_10010005.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            {
                var error = $root.pb_test.Pt_Currency.verify(message.currency);
                if (error)
                    return "currency." + error;
            }
            return null;
        };

        return Sc_10010005;
    })();

    return pb_test;
})();
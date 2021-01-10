type Long = protobuf.Long;
// DO NOT EDIT! This is a generated file. Edit the JSDoc in src/*.js instead and run 'npm run types'.

/** Namespace doomsday_pt. */
declare namespace doomsday_pt {

    /** Properties of a ResData. */
    interface IResData {

        /** ResData result */
        result: number;

        /** ResData param */
        param?: (string[]|null);
    }

    /** Represents a ResData. */
    class ResData implements IResData {

        /**
         * Constructs a new ResData.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IResData);

        /** ResData result. */
        public result: number;

        /** ResData param. */
        public param: string[];

        /**
         * Creates a new ResData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ResData instance
         */
        public static create(properties?: doomsday_pt.IResData): doomsday_pt.ResData;

        /**
         * Encodes the specified ResData message. Does not implicitly {@link doomsday_pt.ResData.verify|verify} messages.
         * @param message ResData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IResData, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a ResData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ResData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.ResData;

        /**
         * Verifies a ResData message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ResData message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ResData
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.ResData;

        /**
         * Creates a plain object from a ResData message. Also converts values to other types if specified.
         * @param message ResData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.ResData, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ResData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a DrawAward. */
    interface IDrawAward {

        /** DrawAward award_type */
        award_type: number;

        /** DrawAward award_id */
        award_id: number;

        /** DrawAward award_num */
        award_num: number;
    }

    /** Represents a DrawAward. */
    class DrawAward implements IDrawAward {

        /**
         * Constructs a new DrawAward.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IDrawAward);

        /** DrawAward award_type. */
        public award_type: number;

        /** DrawAward award_id. */
        public award_id: number;

        /** DrawAward award_num. */
        public award_num: number;

        /**
         * Creates a new DrawAward instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DrawAward instance
         */
        public static create(properties?: doomsday_pt.IDrawAward): doomsday_pt.DrawAward;

        /**
         * Encodes the specified DrawAward message. Does not implicitly {@link doomsday_pt.DrawAward.verify|verify} messages.
         * @param message DrawAward message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IDrawAward, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a DrawAward message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DrawAward
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.DrawAward;

        /**
         * Verifies a DrawAward message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DrawAward message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DrawAward
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.DrawAward;

        /**
         * Creates a plain object from a DrawAward message. Also converts values to other types if specified.
         * @param message DrawAward
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.DrawAward, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DrawAward to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a HeroExpMsg. */
    interface IHeroExpMsg {

        /** HeroExpMsg hero_id */
        hero_id: number;

        /** HeroExpMsg grade */
        grade: number;

        /** HeroExpMsg exp */
        exp: number;
    }

    /** Represents a HeroExpMsg. */
    class HeroExpMsg implements IHeroExpMsg {

        /**
         * Constructs a new HeroExpMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IHeroExpMsg);

        /** HeroExpMsg hero_id. */
        public hero_id: number;

        /** HeroExpMsg grade. */
        public grade: number;

        /** HeroExpMsg exp. */
        public exp: number;

        /**
         * Creates a new HeroExpMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns HeroExpMsg instance
         */
        public static create(properties?: doomsday_pt.IHeroExpMsg): doomsday_pt.HeroExpMsg;

        /**
         * Encodes the specified HeroExpMsg message. Does not implicitly {@link doomsday_pt.HeroExpMsg.verify|verify} messages.
         * @param message HeroExpMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IHeroExpMsg, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a HeroExpMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns HeroExpMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.HeroExpMsg;

        /**
         * Verifies a HeroExpMsg message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a HeroExpMsg message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns HeroExpMsg
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.HeroExpMsg;

        /**
         * Creates a plain object from a HeroExpMsg message. Also converts values to other types if specified.
         * @param message HeroExpMsg
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.HeroExpMsg, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this HeroExpMsg to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a BattleAward. */
    interface IBattleAward {

        /** BattleAward draw_award */
        draw_award?: (doomsday_pt.IDrawAward[]|null);

        /** BattleAward hero_exp_msg */
        hero_exp_msg?: (doomsday_pt.IHeroExpMsg[]|null);
    }

    /** Represents a BattleAward. */
    class BattleAward implements IBattleAward {

        /**
         * Constructs a new BattleAward.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IBattleAward);

        /** BattleAward draw_award. */
        public draw_award: doomsday_pt.IDrawAward[];

        /** BattleAward hero_exp_msg. */
        public hero_exp_msg: doomsday_pt.IHeroExpMsg[];

        /**
         * Creates a new BattleAward instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BattleAward instance
         */
        public static create(properties?: doomsday_pt.IBattleAward): doomsday_pt.BattleAward;

        /**
         * Encodes the specified BattleAward message. Does not implicitly {@link doomsday_pt.BattleAward.verify|verify} messages.
         * @param message BattleAward message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IBattleAward, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a BattleAward message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns BattleAward
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.BattleAward;

        /**
         * Verifies a BattleAward message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a BattleAward message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns BattleAward
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.BattleAward;

        /**
         * Creates a plain object from a BattleAward message. Also converts values to other types if specified.
         * @param message BattleAward
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.BattleAward, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this BattleAward to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetGoods. */
    interface IGetGoods {

        /** GetGoods tab_id */
        tab_id: number;

        /** GetGoods number */
        number: number;
    }

    /** Represents a GetGoods. */
    class GetGoods implements IGetGoods {

        /**
         * Constructs a new GetGoods.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IGetGoods);

        /** GetGoods tab_id. */
        public tab_id: number;

        /** GetGoods number. */
        public number: number;

        /**
         * Creates a new GetGoods instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetGoods instance
         */
        public static create(properties?: doomsday_pt.IGetGoods): doomsday_pt.GetGoods;

        /**
         * Encodes the specified GetGoods message. Does not implicitly {@link doomsday_pt.GetGoods.verify|verify} messages.
         * @param message GetGoods message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IGetGoods, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a GetGoods message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetGoods
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.GetGoods;

        /**
         * Verifies a GetGoods message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetGoods message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetGoods
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.GetGoods;

        /**
         * Creates a plain object from a GetGoods message. Also converts values to other types if specified.
         * @param message GetGoods
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.GetGoods, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetGoods to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10000001. */
    interface ICs_10000001 {

        /** Cs_10000001 mg_name */
        mg_name: string;

        /** Cs_10000001 id */
        id: number;

        /** Cs_10000001 num */
        num: number;
    }

    /** Represents a Cs_10000001. */
    class Cs_10000001 implements ICs_10000001 {

        /**
         * Constructs a new Cs_10000001.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10000001);

        /** Cs_10000001 mg_name. */
        public mg_name: string;

        /** Cs_10000001 id. */
        public id: number;

        /** Cs_10000001 num. */
        public num: number;

        /**
         * Creates a new Cs_10000001 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10000001 instance
         */
        public static create(properties?: doomsday_pt.ICs_10000001): doomsday_pt.Cs_10000001;

        /**
         * Encodes the specified Cs_10000001 message. Does not implicitly {@link doomsday_pt.Cs_10000001.verify|verify} messages.
         * @param message Cs_10000001 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10000001, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10000001 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10000001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10000001;

        /**
         * Verifies a Cs_10000001 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10000001 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10000001
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10000001;

        /**
         * Creates a plain object from a Cs_10000001 message. Also converts values to other types if specified.
         * @param message Cs_10000001
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10000001, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10000001 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10000001. */
    interface ISc_10000001 {

        /** Sc_10000001 res */
        res: doomsday_pt.IResData;
    }

    /** Represents a Sc_10000001. */
    class Sc_10000001 implements ISc_10000001 {

        /**
         * Constructs a new Sc_10000001.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10000001);

        /** Sc_10000001 res. */
        public res: doomsday_pt.IResData;

        /**
         * Creates a new Sc_10000001 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10000001 instance
         */
        public static create(properties?: doomsday_pt.ISc_10000001): doomsday_pt.Sc_10000001;

        /**
         * Encodes the specified Sc_10000001 message. Does not implicitly {@link doomsday_pt.Sc_10000001.verify|verify} messages.
         * @param message Sc_10000001 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10000001, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10000001 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10000001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10000001;

        /**
         * Verifies a Sc_10000001 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10000001 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10000001
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10000001;

        /**
         * Creates a plain object from a Sc_10000001 message. Also converts values to other types if specified.
         * @param message Sc_10000001
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10000001, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10000001 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Pt_HeroMsg. */
    interface IPt_HeroMsg {

        /** Pt_HeroMsg hero_id */
        hero_id: (number|Long);

        /** Pt_HeroMsg index_id */
        index_id: number;

        /** Pt_HeroMsg grade */
        grade: number;
    }

    /** Represents a Pt_HeroMsg. */
    class Pt_HeroMsg implements IPt_HeroMsg {

        /**
         * Constructs a new Pt_HeroMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_HeroMsg);

        /** Pt_HeroMsg hero_id. */
        public hero_id: (number|Long);

        /** Pt_HeroMsg index_id. */
        public index_id: number;

        /** Pt_HeroMsg grade. */
        public grade: number;

        /**
         * Creates a new Pt_HeroMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_HeroMsg instance
         */
        public static create(properties?: doomsday_pt.IPt_HeroMsg): doomsday_pt.Pt_HeroMsg;

        /**
         * Encodes the specified Pt_HeroMsg message. Does not implicitly {@link doomsday_pt.Pt_HeroMsg.verify|verify} messages.
         * @param message Pt_HeroMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_HeroMsg, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_HeroMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_HeroMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_HeroMsg;

        /**
         * Verifies a Pt_HeroMsg message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pt_HeroMsg message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pt_HeroMsg
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Pt_HeroMsg;

        /**
         * Creates a plain object from a Pt_HeroMsg message. Also converts values to other types if specified.
         * @param message Pt_HeroMsg
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Pt_HeroMsg, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pt_HeroMsg to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Pt_RoleInfo. */
    interface IPt_RoleInfo {

        /** Pt_RoleInfo role_id */
        role_id: (number|Long);

        /** Pt_RoleInfo nickname */
        nickname: string;

        /** Pt_RoleInfo exp_pool */
        exp_pool: (number|Long);

        /** Pt_RoleInfo vip_grade */
        vip_grade: number;

        /** Pt_RoleInfo vip_exp */
        vip_exp: number;

        /** Pt_RoleInfo gold_coin */
        gold_coin: number;

        /** Pt_RoleInfo diamond */
        diamond: number;

        /** Pt_RoleInfo fighting */
        fighting: number;

        /** Pt_RoleInfo hero_list */
        hero_list?: (doomsday_pt.IPt_HeroMsg[]|null);
    }

    /** Represents a Pt_RoleInfo. */
    class Pt_RoleInfo implements IPt_RoleInfo {

        /**
         * Constructs a new Pt_RoleInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_RoleInfo);

        /** Pt_RoleInfo role_id. */
        public role_id: (number|Long);

        /** Pt_RoleInfo nickname. */
        public nickname: string;

        /** Pt_RoleInfo exp_pool. */
        public exp_pool: (number|Long);

        /** Pt_RoleInfo vip_grade. */
        public vip_grade: number;

        /** Pt_RoleInfo vip_exp. */
        public vip_exp: number;

        /** Pt_RoleInfo gold_coin. */
        public gold_coin: number;

        /** Pt_RoleInfo diamond. */
        public diamond: number;

        /** Pt_RoleInfo fighting. */
        public fighting: number;

        /** Pt_RoleInfo hero_list. */
        public hero_list: doomsday_pt.IPt_HeroMsg[];

        /**
         * Creates a new Pt_RoleInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_RoleInfo instance
         */
        public static create(properties?: doomsday_pt.IPt_RoleInfo): doomsday_pt.Pt_RoleInfo;

        /**
         * Encodes the specified Pt_RoleInfo message. Does not implicitly {@link doomsday_pt.Pt_RoleInfo.verify|verify} messages.
         * @param message Pt_RoleInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_RoleInfo, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_RoleInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_RoleInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_RoleInfo;

        /**
         * Verifies a Pt_RoleInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pt_RoleInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pt_RoleInfo
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Pt_RoleInfo;

        /**
         * Creates a plain object from a Pt_RoleInfo message. Also converts values to other types if specified.
         * @param message Pt_RoleInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Pt_RoleInfo, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pt_RoleInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Pt_Currency. */
    interface IPt_Currency {

        /** Pt_Currency exp_pool */
        exp_pool: number;

        /** Pt_Currency vip_grade */
        vip_grade: number;

        /** Pt_Currency vip_exp */
        vip_exp: number;

        /** Pt_Currency gold_coin */
        gold_coin: number;

        /** Pt_Currency diamond */
        diamond: number;

        /** Pt_Currency fighting */
        fighting: number;
    }

    /** Represents a Pt_Currency. */
    class Pt_Currency implements IPt_Currency {

        /**
         * Constructs a new Pt_Currency.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_Currency);

        /** Pt_Currency exp_pool. */
        public exp_pool: number;

        /** Pt_Currency vip_grade. */
        public vip_grade: number;

        /** Pt_Currency vip_exp. */
        public vip_exp: number;

        /** Pt_Currency gold_coin. */
        public gold_coin: number;

        /** Pt_Currency diamond. */
        public diamond: number;

        /** Pt_Currency fighting. */
        public fighting: number;

        /**
         * Creates a new Pt_Currency instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_Currency instance
         */
        public static create(properties?: doomsday_pt.IPt_Currency): doomsday_pt.Pt_Currency;

        /**
         * Encodes the specified Pt_Currency message. Does not implicitly {@link doomsday_pt.Pt_Currency.verify|verify} messages.
         * @param message Pt_Currency message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_Currency, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_Currency message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_Currency
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_Currency;

        /**
         * Verifies a Pt_Currency message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pt_Currency message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pt_Currency
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Pt_Currency;

        /**
         * Creates a plain object from a Pt_Currency message. Also converts values to other types if specified.
         * @param message Pt_Currency
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Pt_Currency, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pt_Currency to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10010001. */
    interface ICs_10010001 {

        /** Cs_10010001 account_id */
        account_id: number;

        /** Cs_10010001 token */
        token: string;
    }

    /** Represents a Cs_10010001. */
    class Cs_10010001 implements ICs_10010001 {

        /**
         * Constructs a new Cs_10010001.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10010001);

        /** Cs_10010001 account_id. */
        public account_id: number;

        /** Cs_10010001 token. */
        public token: string;

        /**
         * Creates a new Cs_10010001 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10010001 instance
         */
        public static create(properties?: doomsday_pt.ICs_10010001): doomsday_pt.Cs_10010001;

        /**
         * Encodes the specified Cs_10010001 message. Does not implicitly {@link doomsday_pt.Cs_10010001.verify|verify} messages.
         * @param message Cs_10010001 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10010001, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10010001 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10010001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10010001;

        /**
         * Verifies a Cs_10010001 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10010001 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10010001
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10010001;

        /**
         * Creates a plain object from a Cs_10010001 message. Also converts values to other types if specified.
         * @param message Cs_10010001
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10010001, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10010001 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10010001. */
    interface ISc_10010001 {

        /** Sc_10010001 res */
        res: doomsday_pt.IResData;

        /** Sc_10010001 role_info */
        role_info?: (doomsday_pt.IPt_RoleInfo|null);
    }

    /** Represents a Sc_10010001. */
    class Sc_10010001 implements ISc_10010001 {

        /**
         * Constructs a new Sc_10010001.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10010001);

        /** Sc_10010001 res. */
        public res: doomsday_pt.IResData;

        /** Sc_10010001 role_info. */
        public role_info?: (doomsday_pt.IPt_RoleInfo|null);

        /**
         * Creates a new Sc_10010001 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10010001 instance
         */
        public static create(properties?: doomsday_pt.ISc_10010001): doomsday_pt.Sc_10010001;

        /**
         * Encodes the specified Sc_10010001 message. Does not implicitly {@link doomsday_pt.Sc_10010001.verify|verify} messages.
         * @param message Sc_10010001 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10010001, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10010001 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10010001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10010001;

        /**
         * Verifies a Sc_10010001 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10010001 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10010001
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10010001;

        /**
         * Creates a plain object from a Sc_10010001 message. Also converts values to other types if specified.
         * @param message Sc_10010001
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10010001, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10010001 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10010002. */
    interface ICs_10010002 {

        /** Cs_10010002 account_id */
        account_id: number;

        /** Cs_10010002 token */
        token: string;

        /** Cs_10010002 nickname */
        nickname: string;

        /** Cs_10010002 hero_id */
        hero_id: number;
    }

    /** Represents a Cs_10010002. */
    class Cs_10010002 implements ICs_10010002 {

        /**
         * Constructs a new Cs_10010002.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10010002);

        /** Cs_10010002 account_id. */
        public account_id: number;

        /** Cs_10010002 token. */
        public token: string;

        /** Cs_10010002 nickname. */
        public nickname: string;

        /** Cs_10010002 hero_id. */
        public hero_id: number;

        /**
         * Creates a new Cs_10010002 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10010002 instance
         */
        public static create(properties?: doomsday_pt.ICs_10010002): doomsday_pt.Cs_10010002;

        /**
         * Encodes the specified Cs_10010002 message. Does not implicitly {@link doomsday_pt.Cs_10010002.verify|verify} messages.
         * @param message Cs_10010002 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10010002, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10010002 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10010002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10010002;

        /**
         * Verifies a Cs_10010002 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10010002 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10010002
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10010002;

        /**
         * Creates a plain object from a Cs_10010002 message. Also converts values to other types if specified.
         * @param message Cs_10010002
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10010002, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10010002 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10010002. */
    interface ISc_10010002 {

        /** Sc_10010002 res */
        res: doomsday_pt.IResData;
    }

    /** Represents a Sc_10010002. */
    class Sc_10010002 implements ISc_10010002 {

        /**
         * Constructs a new Sc_10010002.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10010002);

        /** Sc_10010002 res. */
        public res: doomsday_pt.IResData;

        /**
         * Creates a new Sc_10010002 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10010002 instance
         */
        public static create(properties?: doomsday_pt.ISc_10010002): doomsday_pt.Sc_10010002;

        /**
         * Encodes the specified Sc_10010002 message. Does not implicitly {@link doomsday_pt.Sc_10010002.verify|verify} messages.
         * @param message Sc_10010002 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10010002, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10010002 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10010002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10010002;

        /**
         * Verifies a Sc_10010002 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10010002 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10010002
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10010002;

        /**
         * Creates a plain object from a Sc_10010002 message. Also converts values to other types if specified.
         * @param message Sc_10010002
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10010002, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10010002 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10010003. */
    interface ICs_10010003 {

        /** Cs_10010003 rand */
        rand?: (number|null);
    }

    /** Represents a Cs_10010003. */
    class Cs_10010003 implements ICs_10010003 {

        /**
         * Constructs a new Cs_10010003.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10010003);

        /** Cs_10010003 rand. */
        public rand: number;

        /**
         * Creates a new Cs_10010003 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10010003 instance
         */
        public static create(properties?: doomsday_pt.ICs_10010003): doomsday_pt.Cs_10010003;

        /**
         * Encodes the specified Cs_10010003 message. Does not implicitly {@link doomsday_pt.Cs_10010003.verify|verify} messages.
         * @param message Cs_10010003 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10010003, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10010003 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10010003
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10010003;

        /**
         * Verifies a Cs_10010003 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10010003 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10010003
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10010003;

        /**
         * Creates a plain object from a Cs_10010003 message. Also converts values to other types if specified.
         * @param message Cs_10010003
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10010003, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10010003 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10010003. */
    interface ISc_10010003 {

        /** Sc_10010003 interval */
        interval: number;
    }

    /** Represents a Sc_10010003. */
    class Sc_10010003 implements ISc_10010003 {

        /**
         * Constructs a new Sc_10010003.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10010003);

        /** Sc_10010003 interval. */
        public interval: number;

        /**
         * Creates a new Sc_10010003 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10010003 instance
         */
        public static create(properties?: doomsday_pt.ISc_10010003): doomsday_pt.Sc_10010003;

        /**
         * Encodes the specified Sc_10010003 message. Does not implicitly {@link doomsday_pt.Sc_10010003.verify|verify} messages.
         * @param message Sc_10010003 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10010003, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10010003 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10010003
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10010003;

        /**
         * Verifies a Sc_10010003 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10010003 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10010003
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10010003;

        /**
         * Creates a plain object from a Sc_10010003 message. Also converts values to other types if specified.
         * @param message Sc_10010003
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10010003, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10010003 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10010004. */
    interface ISc_10010004 {

        /** Sc_10010004 res */
        res: doomsday_pt.IResData;
    }

    /** Represents a Sc_10010004. */
    class Sc_10010004 implements ISc_10010004 {

        /**
         * Constructs a new Sc_10010004.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10010004);

        /** Sc_10010004 res. */
        public res: doomsday_pt.IResData;

        /**
         * Creates a new Sc_10010004 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10010004 instance
         */
        public static create(properties?: doomsday_pt.ISc_10010004): doomsday_pt.Sc_10010004;

        /**
         * Encodes the specified Sc_10010004 message. Does not implicitly {@link doomsday_pt.Sc_10010004.verify|verify} messages.
         * @param message Sc_10010004 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10010004, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10010004 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10010004
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10010004;

        /**
         * Verifies a Sc_10010004 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10010004 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10010004
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10010004;

        /**
         * Creates a plain object from a Sc_10010004 message. Also converts values to other types if specified.
         * @param message Sc_10010004
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10010004, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10010004 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10010005. */
    interface ISc_10010005 {

        /** Sc_10010005 currency */
        currency: doomsday_pt.IPt_Currency;
    }

    /** Represents a Sc_10010005. */
    class Sc_10010005 implements ISc_10010005 {

        /**
         * Constructs a new Sc_10010005.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10010005);

        /** Sc_10010005 currency. */
        public currency: doomsday_pt.IPt_Currency;

        /**
         * Creates a new Sc_10010005 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10010005 instance
         */
        public static create(properties?: doomsday_pt.ISc_10010005): doomsday_pt.Sc_10010005;

        /**
         * Encodes the specified Sc_10010005 message. Does not implicitly {@link doomsday_pt.Sc_10010005.verify|verify} messages.
         * @param message Sc_10010005 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10010005, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10010005 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10010005
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10010005;

        /**
         * Verifies a Sc_10010005 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10010005 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10010005
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10010005;

        /**
         * Creates a plain object from a Sc_10010005 message. Also converts values to other types if specified.
         * @param message Sc_10010005
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10010005, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10010005 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Pt_AttList. */
    interface IPt_AttList {

        /** Pt_AttList att_id */
        att_id: number;

        /** Pt_AttList att_value */
        att_value: number;
    }

    /** Represents a Pt_AttList. */
    class Pt_AttList implements IPt_AttList {

        /**
         * Constructs a new Pt_AttList.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_AttList);

        /** Pt_AttList att_id. */
        public att_id: number;

        /** Pt_AttList att_value. */
        public att_value: number;

        /**
         * Creates a new Pt_AttList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_AttList instance
         */
        public static create(properties?: doomsday_pt.IPt_AttList): doomsday_pt.Pt_AttList;

        /**
         * Encodes the specified Pt_AttList message. Does not implicitly {@link doomsday_pt.Pt_AttList.verify|verify} messages.
         * @param message Pt_AttList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_AttList, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_AttList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_AttList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_AttList;

        /**
         * Verifies a Pt_AttList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pt_AttList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pt_AttList
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Pt_AttList;

        /**
         * Creates a plain object from a Pt_AttList message. Also converts values to other types if specified.
         * @param message Pt_AttList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Pt_AttList, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pt_AttList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Pt_HeroPanel. */
    interface IPt_HeroPanel {

        /** Pt_HeroPanel power */
        power: (number|Long);

        /** Pt_HeroPanel heroname */
        heroname: string;
    }

    /** Represents a Pt_HeroPanel. */
    class Pt_HeroPanel implements IPt_HeroPanel {

        /**
         * Constructs a new Pt_HeroPanel.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_HeroPanel);

        /** Pt_HeroPanel power. */
        public power: (number|Long);

        /** Pt_HeroPanel heroname. */
        public heroname: string;

        /**
         * Creates a new Pt_HeroPanel instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_HeroPanel instance
         */
        public static create(properties?: doomsday_pt.IPt_HeroPanel): doomsday_pt.Pt_HeroPanel;

        /**
         * Encodes the specified Pt_HeroPanel message. Does not implicitly {@link doomsday_pt.Pt_HeroPanel.verify|verify} messages.
         * @param message Pt_HeroPanel message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_HeroPanel, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_HeroPanel message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_HeroPanel
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_HeroPanel;

        /**
         * Verifies a Pt_HeroPanel message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pt_HeroPanel message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pt_HeroPanel
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Pt_HeroPanel;

        /**
         * Creates a plain object from a Pt_HeroPanel message. Also converts values to other types if specified.
         * @param message Pt_HeroPanel
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Pt_HeroPanel, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pt_HeroPanel to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Pt_HeroInfo. */
    interface IPt_HeroInfo {

        /** Pt_HeroInfo hero_id */
        hero_id: (number|Long);

        /** Pt_HeroInfo index_id */
        index_id: number;

        /** Pt_HeroInfo heroname */
        heroname: string;

        /** Pt_HeroInfo exper */
        exper: (number|Long);

        /** Pt_HeroInfo grade */
        grade: number;
    }

    /** Represents a Pt_HeroInfo. */
    class Pt_HeroInfo implements IPt_HeroInfo {

        /**
         * Constructs a new Pt_HeroInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_HeroInfo);

        /** Pt_HeroInfo hero_id. */
        public hero_id: (number|Long);

        /** Pt_HeroInfo index_id. */
        public index_id: number;

        /** Pt_HeroInfo heroname. */
        public heroname: string;

        /** Pt_HeroInfo exper. */
        public exper: (number|Long);

        /** Pt_HeroInfo grade. */
        public grade: number;

        /**
         * Creates a new Pt_HeroInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_HeroInfo instance
         */
        public static create(properties?: doomsday_pt.IPt_HeroInfo): doomsday_pt.Pt_HeroInfo;

        /**
         * Encodes the specified Pt_HeroInfo message. Does not implicitly {@link doomsday_pt.Pt_HeroInfo.verify|verify} messages.
         * @param message Pt_HeroInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_HeroInfo, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_HeroInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_HeroInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_HeroInfo;

        /**
         * Verifies a Pt_HeroInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pt_HeroInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pt_HeroInfo
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Pt_HeroInfo;

        /**
         * Creates a plain object from a Pt_HeroInfo message. Also converts values to other types if specified.
         * @param message Pt_HeroInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Pt_HeroInfo, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pt_HeroInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10020001. */
    interface ICs_10020001 {

        /** Cs_10020001 hero_id */
        hero_id: (number|Long);
    }

    /** Represents a Cs_10020001. */
    class Cs_10020001 implements ICs_10020001 {

        /**
         * Constructs a new Cs_10020001.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10020001);

        /** Cs_10020001 hero_id. */
        public hero_id: (number|Long);

        /**
         * Creates a new Cs_10020001 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10020001 instance
         */
        public static create(properties?: doomsday_pt.ICs_10020001): doomsday_pt.Cs_10020001;

        /**
         * Encodes the specified Cs_10020001 message. Does not implicitly {@link doomsday_pt.Cs_10020001.verify|verify} messages.
         * @param message Cs_10020001 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10020001, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10020001 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10020001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10020001;

        /**
         * Verifies a Cs_10020001 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10020001 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10020001
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10020001;

        /**
         * Creates a plain object from a Cs_10020001 message. Also converts values to other types if specified.
         * @param message Cs_10020001
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10020001, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10020001 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10020001. */
    interface ISc_10020001 {

        /** Sc_10020001 att_list */
        att_list?: (doomsday_pt.IPt_AttList[]|null);
    }

    /** Represents a Sc_10020001. */
    class Sc_10020001 implements ISc_10020001 {

        /**
         * Constructs a new Sc_10020001.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10020001);

        /** Sc_10020001 att_list. */
        public att_list: doomsday_pt.IPt_AttList[];

        /**
         * Creates a new Sc_10020001 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10020001 instance
         */
        public static create(properties?: doomsday_pt.ISc_10020001): doomsday_pt.Sc_10020001;

        /**
         * Encodes the specified Sc_10020001 message. Does not implicitly {@link doomsday_pt.Sc_10020001.verify|verify} messages.
         * @param message Sc_10020001 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10020001, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10020001 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10020001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10020001;

        /**
         * Verifies a Sc_10020001 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10020001 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10020001
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10020001;

        /**
         * Creates a plain object from a Sc_10020001 message. Also converts values to other types if specified.
         * @param message Sc_10020001
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10020001, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10020001 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10020002. */
    interface ICs_10020002 {

        /** Cs_10020002 hero_id */
        hero_id: (number|Long);
    }

    /** Represents a Cs_10020002. */
    class Cs_10020002 implements ICs_10020002 {

        /**
         * Constructs a new Cs_10020002.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10020002);

        /** Cs_10020002 hero_id. */
        public hero_id: (number|Long);

        /**
         * Creates a new Cs_10020002 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10020002 instance
         */
        public static create(properties?: doomsday_pt.ICs_10020002): doomsday_pt.Cs_10020002;

        /**
         * Encodes the specified Cs_10020002 message. Does not implicitly {@link doomsday_pt.Cs_10020002.verify|verify} messages.
         * @param message Cs_10020002 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10020002, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10020002 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10020002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10020002;

        /**
         * Verifies a Cs_10020002 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10020002 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10020002
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10020002;

        /**
         * Creates a plain object from a Cs_10020002 message. Also converts values to other types if specified.
         * @param message Cs_10020002
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10020002, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10020002 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10020002. */
    interface ISc_10020002 {

        /** Sc_10020002 HeroPanel */
        HeroPanel: doomsday_pt.IPt_HeroPanel;

        /** Sc_10020002 att_list */
        att_list?: (doomsday_pt.IPt_AttList[]|null);
    }

    /** Represents a Sc_10020002. */
    class Sc_10020002 implements ISc_10020002 {

        /**
         * Constructs a new Sc_10020002.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10020002);

        /** Sc_10020002 HeroPanel. */
        public HeroPanel: doomsday_pt.IPt_HeroPanel;

        /** Sc_10020002 att_list. */
        public att_list: doomsday_pt.IPt_AttList[];

        /**
         * Creates a new Sc_10020002 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10020002 instance
         */
        public static create(properties?: doomsday_pt.ISc_10020002): doomsday_pt.Sc_10020002;

        /**
         * Encodes the specified Sc_10020002 message. Does not implicitly {@link doomsday_pt.Sc_10020002.verify|verify} messages.
         * @param message Sc_10020002 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10020002, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10020002 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10020002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10020002;

        /**
         * Verifies a Sc_10020002 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10020002 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10020002
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10020002;

        /**
         * Creates a plain object from a Sc_10020002 message. Also converts values to other types if specified.
         * @param message Sc_10020002
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10020002, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10020002 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10020003. */
    interface ICs_10020003 {

        /** Cs_10020003 rand */
        rand?: (number|null);
    }

    /** Represents a Cs_10020003. */
    class Cs_10020003 implements ICs_10020003 {

        /**
         * Constructs a new Cs_10020003.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10020003);

        /** Cs_10020003 rand. */
        public rand: number;

        /**
         * Creates a new Cs_10020003 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10020003 instance
         */
        public static create(properties?: doomsday_pt.ICs_10020003): doomsday_pt.Cs_10020003;

        /**
         * Encodes the specified Cs_10020003 message. Does not implicitly {@link doomsday_pt.Cs_10020003.verify|verify} messages.
         * @param message Cs_10020003 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10020003, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10020003 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10020003
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10020003;

        /**
         * Verifies a Cs_10020003 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10020003 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10020003
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10020003;

        /**
         * Creates a plain object from a Cs_10020003 message. Also converts values to other types if specified.
         * @param message Cs_10020003
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10020003, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10020003 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10020003. */
    interface ISc_10020003 {

        /** Sc_10020003 exper_pool */
        exper_pool: (number|Long);

        /** Sc_10020003 hero_list */
        hero_list?: (doomsday_pt.IPt_HeroInfo[]|null);
    }

    /** Represents a Sc_10020003. */
    class Sc_10020003 implements ISc_10020003 {

        /**
         * Constructs a new Sc_10020003.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10020003);

        /** Sc_10020003 exper_pool. */
        public exper_pool: (number|Long);

        /** Sc_10020003 hero_list. */
        public hero_list: doomsday_pt.IPt_HeroInfo[];

        /**
         * Creates a new Sc_10020003 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10020003 instance
         */
        public static create(properties?: doomsday_pt.ISc_10020003): doomsday_pt.Sc_10020003;

        /**
         * Encodes the specified Sc_10020003 message. Does not implicitly {@link doomsday_pt.Sc_10020003.verify|verify} messages.
         * @param message Sc_10020003 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10020003, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10020003 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10020003
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10020003;

        /**
         * Verifies a Sc_10020003 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10020003 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10020003
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10020003;

        /**
         * Creates a plain object from a Sc_10020003 message. Also converts values to other types if specified.
         * @param message Sc_10020003
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10020003, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10020003 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10020004. */
    interface ICs_10020004 {

        /** Cs_10020004 hero_id */
        hero_id: (number|Long);
    }

    /** Represents a Cs_10020004. */
    class Cs_10020004 implements ICs_10020004 {

        /**
         * Constructs a new Cs_10020004.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10020004);

        /** Cs_10020004 hero_id. */
        public hero_id: (number|Long);

        /**
         * Creates a new Cs_10020004 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10020004 instance
         */
        public static create(properties?: doomsday_pt.ICs_10020004): doomsday_pt.Cs_10020004;

        /**
         * Encodes the specified Cs_10020004 message. Does not implicitly {@link doomsday_pt.Cs_10020004.verify|verify} messages.
         * @param message Cs_10020004 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10020004, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10020004 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10020004
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10020004;

        /**
         * Verifies a Cs_10020004 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10020004 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10020004
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10020004;

        /**
         * Creates a plain object from a Cs_10020004 message. Also converts values to other types if specified.
         * @param message Cs_10020004
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10020004, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10020004 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10020004. */
    interface ISc_10020004 {

        /** Sc_10020004 res */
        res: doomsday_pt.IResData;

        /** Sc_10020004 hero_info */
        hero_info: doomsday_pt.IPt_HeroInfo;
    }

    /** Represents a Sc_10020004. */
    class Sc_10020004 implements ISc_10020004 {

        /**
         * Constructs a new Sc_10020004.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10020004);

        /** Sc_10020004 res. */
        public res: doomsday_pt.IResData;

        /** Sc_10020004 hero_info. */
        public hero_info: doomsday_pt.IPt_HeroInfo;

        /**
         * Creates a new Sc_10020004 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10020004 instance
         */
        public static create(properties?: doomsday_pt.ISc_10020004): doomsday_pt.Sc_10020004;

        /**
         * Encodes the specified Sc_10020004 message. Does not implicitly {@link doomsday_pt.Sc_10020004.verify|verify} messages.
         * @param message Sc_10020004 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10020004, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10020004 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10020004
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10020004;

        /**
         * Verifies a Sc_10020004 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10020004 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10020004
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10020004;

        /**
         * Creates a plain object from a Sc_10020004 message. Also converts values to other types if specified.
         * @param message Sc_10020004
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10020004, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10020004 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Pt_GoodsMsg. */
    interface IPt_GoodsMsg {

        /** Pt_GoodsMsg id */
        id: (number|Long);

        /** Pt_GoodsMsg base_id */
        base_id: number;

        /** Pt_GoodsMsg num */
        num: number;

        /** Pt_GoodsMsg valid_time */
        valid_time?: (number|null);
    }

    /** Represents a Pt_GoodsMsg. */
    class Pt_GoodsMsg implements IPt_GoodsMsg {

        /**
         * Constructs a new Pt_GoodsMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_GoodsMsg);

        /** Pt_GoodsMsg id. */
        public id: (number|Long);

        /** Pt_GoodsMsg base_id. */
        public base_id: number;

        /** Pt_GoodsMsg num. */
        public num: number;

        /** Pt_GoodsMsg valid_time. */
        public valid_time: number;

        /**
         * Creates a new Pt_GoodsMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_GoodsMsg instance
         */
        public static create(properties?: doomsday_pt.IPt_GoodsMsg): doomsday_pt.Pt_GoodsMsg;

        /**
         * Encodes the specified Pt_GoodsMsg message. Does not implicitly {@link doomsday_pt.Pt_GoodsMsg.verify|verify} messages.
         * @param message Pt_GoodsMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_GoodsMsg, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_GoodsMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_GoodsMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_GoodsMsg;

        /**
         * Verifies a Pt_GoodsMsg message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pt_GoodsMsg message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pt_GoodsMsg
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Pt_GoodsMsg;

        /**
         * Creates a plain object from a Pt_GoodsMsg message. Also converts values to other types if specified.
         * @param message Pt_GoodsMsg
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Pt_GoodsMsg, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pt_GoodsMsg to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10030001. */
    interface ISc_10030001 {

        /** Sc_10030001 now_time */
        now_time: number;

        /** Sc_10030001 bag_msg */
        bag_msg?: (doomsday_pt.IPt_GoodsMsg[]|null);

        /** Sc_10030001 entrepot_msg */
        entrepot_msg?: (doomsday_pt.IPt_GoodsMsg[]|null);
    }

    /** Represents a Sc_10030001. */
    class Sc_10030001 implements ISc_10030001 {

        /**
         * Constructs a new Sc_10030001.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10030001);

        /** Sc_10030001 now_time. */
        public now_time: number;

        /** Sc_10030001 bag_msg. */
        public bag_msg: doomsday_pt.IPt_GoodsMsg[];

        /** Sc_10030001 entrepot_msg. */
        public entrepot_msg: doomsday_pt.IPt_GoodsMsg[];

        /**
         * Creates a new Sc_10030001 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10030001 instance
         */
        public static create(properties?: doomsday_pt.ISc_10030001): doomsday_pt.Sc_10030001;

        /**
         * Encodes the specified Sc_10030001 message. Does not implicitly {@link doomsday_pt.Sc_10030001.verify|verify} messages.
         * @param message Sc_10030001 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10030001, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10030001 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10030001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10030001;

        /**
         * Verifies a Sc_10030001 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10030001 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10030001
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10030001;

        /**
         * Creates a plain object from a Sc_10030001 message. Also converts values to other types if specified.
         * @param message Sc_10030001
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10030001, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10030001 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10030002. */
    interface ISc_10030002 {

        /** Sc_10030002 location */
        location: number;

        /** Sc_10030002 goods_msg */
        goods_msg?: (doomsday_pt.IPt_GoodsMsg[]|null);
    }

    /** Represents a Sc_10030002. */
    class Sc_10030002 implements ISc_10030002 {

        /**
         * Constructs a new Sc_10030002.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10030002);

        /** Sc_10030002 location. */
        public location: number;

        /** Sc_10030002 goods_msg. */
        public goods_msg: doomsday_pt.IPt_GoodsMsg[];

        /**
         * Creates a new Sc_10030002 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10030002 instance
         */
        public static create(properties?: doomsday_pt.ISc_10030002): doomsday_pt.Sc_10030002;

        /**
         * Encodes the specified Sc_10030002 message. Does not implicitly {@link doomsday_pt.Sc_10030002.verify|verify} messages.
         * @param message Sc_10030002 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10030002, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10030002 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10030002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10030002;

        /**
         * Verifies a Sc_10030002 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10030002 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10030002
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10030002;

        /**
         * Creates a plain object from a Sc_10030002 message. Also converts values to other types if specified.
         * @param message Sc_10030002
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10030002, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10030002 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10030003. */
    interface ICs_10030003 {

        /** Cs_10030003 id */
        id: (number|Long);

        /** Cs_10030003 num */
        num: number;
    }

    /** Represents a Cs_10030003. */
    class Cs_10030003 implements ICs_10030003 {

        /**
         * Constructs a new Cs_10030003.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10030003);

        /** Cs_10030003 id. */
        public id: (number|Long);

        /** Cs_10030003 num. */
        public num: number;

        /**
         * Creates a new Cs_10030003 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10030003 instance
         */
        public static create(properties?: doomsday_pt.ICs_10030003): doomsday_pt.Cs_10030003;

        /**
         * Encodes the specified Cs_10030003 message. Does not implicitly {@link doomsday_pt.Cs_10030003.verify|verify} messages.
         * @param message Cs_10030003 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10030003, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10030003 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10030003
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10030003;

        /**
         * Verifies a Cs_10030003 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10030003 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10030003
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10030003;

        /**
         * Creates a plain object from a Cs_10030003 message. Also converts values to other types if specified.
         * @param message Cs_10030003
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10030003, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10030003 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10030003. */
    interface ISc_10030003 {

        /** Sc_10030003 res */
        res: doomsday_pt.IResData;
    }

    /** Represents a Sc_10030003. */
    class Sc_10030003 implements ISc_10030003 {

        /**
         * Constructs a new Sc_10030003.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10030003);

        /** Sc_10030003 res. */
        public res: doomsday_pt.IResData;

        /**
         * Creates a new Sc_10030003 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10030003 instance
         */
        public static create(properties?: doomsday_pt.ISc_10030003): doomsday_pt.Sc_10030003;

        /**
         * Encodes the specified Sc_10030003 message. Does not implicitly {@link doomsday_pt.Sc_10030003.verify|verify} messages.
         * @param message Sc_10030003 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10030003, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10030003 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10030003
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10030003;

        /**
         * Verifies a Sc_10030003 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10030003 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10030003
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10030003;

        /**
         * Creates a plain object from a Sc_10030003 message. Also converts values to other types if specified.
         * @param message Sc_10030003
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10030003, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10030003 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10030004. */
    interface ICs_10030004 {

        /** Cs_10030004 id */
        id: (number|Long);
    }

    /** Represents a Cs_10030004. */
    class Cs_10030004 implements ICs_10030004 {

        /**
         * Constructs a new Cs_10030004.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10030004);

        /** Cs_10030004 id. */
        public id: (number|Long);

        /**
         * Creates a new Cs_10030004 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10030004 instance
         */
        public static create(properties?: doomsday_pt.ICs_10030004): doomsday_pt.Cs_10030004;

        /**
         * Encodes the specified Cs_10030004 message. Does not implicitly {@link doomsday_pt.Cs_10030004.verify|verify} messages.
         * @param message Cs_10030004 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10030004, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10030004 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10030004
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10030004;

        /**
         * Verifies a Cs_10030004 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10030004 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10030004
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10030004;

        /**
         * Creates a plain object from a Cs_10030004 message. Also converts values to other types if specified.
         * @param message Cs_10030004
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10030004, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10030004 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10030004. */
    interface ISc_10030004 {

        /** Sc_10030004 res */
        res: doomsday_pt.IResData;
    }

    /** Represents a Sc_10030004. */
    class Sc_10030004 implements ISc_10030004 {

        /**
         * Constructs a new Sc_10030004.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10030004);

        /** Sc_10030004 res. */
        public res: doomsday_pt.IResData;

        /**
         * Creates a new Sc_10030004 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10030004 instance
         */
        public static create(properties?: doomsday_pt.ISc_10030004): doomsday_pt.Sc_10030004;

        /**
         * Encodes the specified Sc_10030004 message. Does not implicitly {@link doomsday_pt.Sc_10030004.verify|verify} messages.
         * @param message Sc_10030004 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10030004, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10030004 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10030004
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10030004;

        /**
         * Verifies a Sc_10030004 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10030004 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10030004
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10030004;

        /**
         * Creates a plain object from a Sc_10030004 message. Also converts values to other types if specified.
         * @param message Sc_10030004
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10030004, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10030004 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10030005. */
    interface ICs_10030005 {

        /** Cs_10030005 id */
        id?: (number|null);
    }

    /** Represents a Cs_10030005. */
    class Cs_10030005 implements ICs_10030005 {

        /**
         * Constructs a new Cs_10030005.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10030005);

        /** Cs_10030005 id. */
        public id: number;

        /**
         * Creates a new Cs_10030005 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10030005 instance
         */
        public static create(properties?: doomsday_pt.ICs_10030005): doomsday_pt.Cs_10030005;

        /**
         * Encodes the specified Cs_10030005 message. Does not implicitly {@link doomsday_pt.Cs_10030005.verify|verify} messages.
         * @param message Cs_10030005 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10030005, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10030005 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10030005
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10030005;

        /**
         * Verifies a Cs_10030005 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10030005 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10030005
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10030005;

        /**
         * Creates a plain object from a Cs_10030005 message. Also converts values to other types if specified.
         * @param message Cs_10030005
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10030005, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10030005 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10030005. */
    interface ISc_10030005 {

        /** Sc_10030005 res */
        res: doomsday_pt.IResData;
    }

    /** Represents a Sc_10030005. */
    class Sc_10030005 implements ISc_10030005 {

        /**
         * Constructs a new Sc_10030005.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10030005);

        /** Sc_10030005 res. */
        public res: doomsday_pt.IResData;

        /**
         * Creates a new Sc_10030005 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10030005 instance
         */
        public static create(properties?: doomsday_pt.ISc_10030005): doomsday_pt.Sc_10030005;

        /**
         * Encodes the specified Sc_10030005 message. Does not implicitly {@link doomsday_pt.Sc_10030005.verify|verify} messages.
         * @param message Sc_10030005 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10030005, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10030005 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10030005
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10030005;

        /**
         * Verifies a Sc_10030005 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10030005 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10030005
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10030005;

        /**
         * Creates a plain object from a Sc_10030005 message. Also converts values to other types if specified.
         * @param message Sc_10030005
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10030005, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10030005 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10030006. */
    interface ICs_10030006 {

        /** Cs_10030006 id */
        id: (number|Long);
    }

    /** Represents a Cs_10030006. */
    class Cs_10030006 implements ICs_10030006 {

        /**
         * Constructs a new Cs_10030006.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10030006);

        /** Cs_10030006 id. */
        public id: (number|Long);

        /**
         * Creates a new Cs_10030006 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10030006 instance
         */
        public static create(properties?: doomsday_pt.ICs_10030006): doomsday_pt.Cs_10030006;

        /**
         * Encodes the specified Cs_10030006 message. Does not implicitly {@link doomsday_pt.Cs_10030006.verify|verify} messages.
         * @param message Cs_10030006 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10030006, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10030006 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10030006
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10030006;

        /**
         * Verifies a Cs_10030006 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10030006 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10030006
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10030006;

        /**
         * Creates a plain object from a Cs_10030006 message. Also converts values to other types if specified.
         * @param message Cs_10030006
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10030006, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10030006 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10030006. */
    interface ISc_10030006 {

        /** Sc_10030006 res */
        res: doomsday_pt.IResData;
    }

    /** Represents a Sc_10030006. */
    class Sc_10030006 implements ISc_10030006 {

        /**
         * Constructs a new Sc_10030006.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10030006);

        /** Sc_10030006 res. */
        public res: doomsday_pt.IResData;

        /**
         * Creates a new Sc_10030006 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10030006 instance
         */
        public static create(properties?: doomsday_pt.ISc_10030006): doomsday_pt.Sc_10030006;

        /**
         * Encodes the specified Sc_10030006 message. Does not implicitly {@link doomsday_pt.Sc_10030006.verify|verify} messages.
         * @param message Sc_10030006 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10030006, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10030006 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10030006
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10030006;

        /**
         * Verifies a Sc_10030006 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10030006 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10030006
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10030006;

        /**
         * Creates a plain object from a Sc_10030006 message. Also converts values to other types if specified.
         * @param message Sc_10030006
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10030006, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10030006 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10030007. */
    interface ICs_10030007 {

        /** Cs_10030007 id */
        id: (number|Long);

        /** Cs_10030007 use_num */
        use_num: number;

        /** Cs_10030007 select_id */
        select_id?: (number|null);
    }

    /** Represents a Cs_10030007. */
    class Cs_10030007 implements ICs_10030007 {

        /**
         * Constructs a new Cs_10030007.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10030007);

        /** Cs_10030007 id. */
        public id: (number|Long);

        /** Cs_10030007 use_num. */
        public use_num: number;

        /** Cs_10030007 select_id. */
        public select_id: number;

        /**
         * Creates a new Cs_10030007 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10030007 instance
         */
        public static create(properties?: doomsday_pt.ICs_10030007): doomsday_pt.Cs_10030007;

        /**
         * Encodes the specified Cs_10030007 message. Does not implicitly {@link doomsday_pt.Cs_10030007.verify|verify} messages.
         * @param message Cs_10030007 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10030007, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10030007 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10030007
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10030007;

        /**
         * Verifies a Cs_10030007 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10030007 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10030007
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10030007;

        /**
         * Creates a plain object from a Cs_10030007 message. Also converts values to other types if specified.
         * @param message Cs_10030007
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10030007, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10030007 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10030007. */
    interface ISc_10030007 {

        /** Sc_10030007 res */
        res: doomsday_pt.IResData;
    }

    /** Represents a Sc_10030007. */
    class Sc_10030007 implements ISc_10030007 {

        /**
         * Constructs a new Sc_10030007.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10030007);

        /** Sc_10030007 res. */
        public res: doomsday_pt.IResData;

        /**
         * Creates a new Sc_10030007 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10030007 instance
         */
        public static create(properties?: doomsday_pt.ISc_10030007): doomsday_pt.Sc_10030007;

        /**
         * Encodes the specified Sc_10030007 message. Does not implicitly {@link doomsday_pt.Sc_10030007.verify|verify} messages.
         * @param message Sc_10030007 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10030007, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10030007 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10030007
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10030007;

        /**
         * Verifies a Sc_10030007 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10030007 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10030007
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10030007;

        /**
         * Creates a plain object from a Sc_10030007 message. Also converts values to other types if specified.
         * @param message Sc_10030007
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10030007, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10030007 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Pt_Pos. */
    interface IPt_Pos {

        /** Pt_Pos x */
        x: number;

        /** Pt_Pos y */
        y: number;
    }

    /** Represents a Pt_Pos. */
    class Pt_Pos implements IPt_Pos {

        /**
         * Constructs a new Pt_Pos.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_Pos);

        /** Pt_Pos x. */
        public x: number;

        /** Pt_Pos y. */
        public y: number;

        /**
         * Creates a new Pt_Pos instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_Pos instance
         */
        public static create(properties?: doomsday_pt.IPt_Pos): doomsday_pt.Pt_Pos;

        /**
         * Encodes the specified Pt_Pos message. Does not implicitly {@link doomsday_pt.Pt_Pos.verify|verify} messages.
         * @param message Pt_Pos message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_Pos, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_Pos message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_Pos
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_Pos;

        /**
         * Verifies a Pt_Pos message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pt_Pos message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pt_Pos
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Pt_Pos;

        /**
         * Creates a plain object from a Pt_Pos message. Also converts values to other types if specified.
         * @param message Pt_Pos
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Pt_Pos, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pt_Pos to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10040001. */
    interface ICs_10040001 {

        /** Cs_10040001 id */
        id: number;
    }

    /** Represents a Cs_10040001. */
    class Cs_10040001 implements ICs_10040001 {

        /**
         * Constructs a new Cs_10040001.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10040001);

        /** Cs_10040001 id. */
        public id: number;

        /**
         * Creates a new Cs_10040001 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10040001 instance
         */
        public static create(properties?: doomsday_pt.ICs_10040001): doomsday_pt.Cs_10040001;

        /**
         * Encodes the specified Cs_10040001 message. Does not implicitly {@link doomsday_pt.Cs_10040001.verify|verify} messages.
         * @param message Cs_10040001 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10040001, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10040001 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10040001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10040001;

        /**
         * Verifies a Cs_10040001 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10040001 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10040001
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10040001;

        /**
         * Creates a plain object from a Cs_10040001 message. Also converts values to other types if specified.
         * @param message Cs_10040001
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10040001, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10040001 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10040001. */
    interface ISc_10040001 {

        /** Sc_10040001 id_list */
        id_list?: (number[]|null);
    }

    /** Represents a Sc_10040001. */
    class Sc_10040001 implements ISc_10040001 {

        /**
         * Constructs a new Sc_10040001.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10040001);

        /** Sc_10040001 id_list. */
        public id_list: number[];

        /**
         * Creates a new Sc_10040001 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10040001 instance
         */
        public static create(properties?: doomsday_pt.ISc_10040001): doomsday_pt.Sc_10040001;

        /**
         * Encodes the specified Sc_10040001 message. Does not implicitly {@link doomsday_pt.Sc_10040001.verify|verify} messages.
         * @param message Sc_10040001 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10040001, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10040001 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10040001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10040001;

        /**
         * Verifies a Sc_10040001 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10040001 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10040001
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10040001;

        /**
         * Creates a plain object from a Sc_10040001 message. Also converts values to other types if specified.
         * @param message Sc_10040001
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10040001, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10040001 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10040002. */
    interface ICs_10040002 {

        /** Cs_10040002 atk_id */
        atk_id: number;

        /** Cs_10040002 tar_id */
        tar_id: number;
    }

    /** Represents a Cs_10040002. */
    class Cs_10040002 implements ICs_10040002 {

        /**
         * Constructs a new Cs_10040002.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10040002);

        /** Cs_10040002 atk_id. */
        public atk_id: number;

        /** Cs_10040002 tar_id. */
        public tar_id: number;

        /**
         * Creates a new Cs_10040002 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10040002 instance
         */
        public static create(properties?: doomsday_pt.ICs_10040002): doomsday_pt.Cs_10040002;

        /**
         * Encodes the specified Cs_10040002 message. Does not implicitly {@link doomsday_pt.Cs_10040002.verify|verify} messages.
         * @param message Cs_10040002 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10040002, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10040002 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10040002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10040002;

        /**
         * Verifies a Cs_10040002 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10040002 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10040002
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10040002;

        /**
         * Creates a plain object from a Cs_10040002 message. Also converts values to other types if specified.
         * @param message Cs_10040002
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10040002, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10040002 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10040002. */
    interface ISc_10040002 {

        /** Sc_10040002 tar_pos */
        tar_pos?: (doomsday_pt.IPt_Pos|null);
    }

    /** Represents a Sc_10040002. */
    class Sc_10040002 implements ISc_10040002 {

        /**
         * Constructs a new Sc_10040002.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10040002);

        /** Sc_10040002 tar_pos. */
        public tar_pos?: (doomsday_pt.IPt_Pos|null);

        /**
         * Creates a new Sc_10040002 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10040002 instance
         */
        public static create(properties?: doomsday_pt.ISc_10040002): doomsday_pt.Sc_10040002;

        /**
         * Encodes the specified Sc_10040002 message. Does not implicitly {@link doomsday_pt.Sc_10040002.verify|verify} messages.
         * @param message Sc_10040002 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10040002, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10040002 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10040002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10040002;

        /**
         * Verifies a Sc_10040002 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10040002 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10040002
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10040002;

        /**
         * Creates a plain object from a Sc_10040002 message. Also converts values to other types if specified.
         * @param message Sc_10040002
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10040002, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10040002 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Pt_GoodsList. */
    interface IPt_GoodsList {

        /** Pt_GoodsList goods_id */
        goods_id: number;

        /** Pt_GoodsList goods_bought */
        goods_bought: number;
    }

    /** Represents a Pt_GoodsList. */
    class Pt_GoodsList implements IPt_GoodsList {

        /**
         * Constructs a new Pt_GoodsList.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_GoodsList);

        /** Pt_GoodsList goods_id. */
        public goods_id: number;

        /** Pt_GoodsList goods_bought. */
        public goods_bought: number;

        /**
         * Creates a new Pt_GoodsList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_GoodsList instance
         */
        public static create(properties?: doomsday_pt.IPt_GoodsList): doomsday_pt.Pt_GoodsList;

        /**
         * Encodes the specified Pt_GoodsList message. Does not implicitly {@link doomsday_pt.Pt_GoodsList.verify|verify} messages.
         * @param message Pt_GoodsList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_GoodsList, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_GoodsList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_GoodsList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_GoodsList;

        /**
         * Verifies a Pt_GoodsList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pt_GoodsList message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pt_GoodsList
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Pt_GoodsList;

        /**
         * Creates a plain object from a Pt_GoodsList message. Also converts values to other types if specified.
         * @param message Pt_GoodsList
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Pt_GoodsList, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pt_GoodsList to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Pt_Goodsfresh. */
    interface IPt_Goodsfresh {

        /** Pt_Goodsfresh goods_id */
        goods_id: number;

        /** Pt_Goodsfresh goods_num */
        goods_num: number;
    }

    /** Represents a Pt_Goodsfresh. */
    class Pt_Goodsfresh implements IPt_Goodsfresh {

        /**
         * Constructs a new Pt_Goodsfresh.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_Goodsfresh);

        /** Pt_Goodsfresh goods_id. */
        public goods_id: number;

        /** Pt_Goodsfresh goods_num. */
        public goods_num: number;

        /**
         * Creates a new Pt_Goodsfresh instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_Goodsfresh instance
         */
        public static create(properties?: doomsday_pt.IPt_Goodsfresh): doomsday_pt.Pt_Goodsfresh;

        /**
         * Encodes the specified Pt_Goodsfresh message. Does not implicitly {@link doomsday_pt.Pt_Goodsfresh.verify|verify} messages.
         * @param message Pt_Goodsfresh message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_Goodsfresh, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_Goodsfresh message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_Goodsfresh
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_Goodsfresh;

        /**
         * Verifies a Pt_Goodsfresh message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pt_Goodsfresh message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pt_Goodsfresh
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Pt_Goodsfresh;

        /**
         * Creates a plain object from a Pt_Goodsfresh message. Also converts values to other types if specified.
         * @param message Pt_Goodsfresh
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Pt_Goodsfresh, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pt_Goodsfresh to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10050001. */
    interface ICs_10050001 {

        /** Cs_10050001 shop_type */
        shop_type: number;

        /** Cs_10050001 shop_lv */
        shop_lv: number;
    }

    /** Represents a Cs_10050001. */
    class Cs_10050001 implements ICs_10050001 {

        /**
         * Constructs a new Cs_10050001.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10050001);

        /** Cs_10050001 shop_type. */
        public shop_type: number;

        /** Cs_10050001 shop_lv. */
        public shop_lv: number;

        /**
         * Creates a new Cs_10050001 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10050001 instance
         */
        public static create(properties?: doomsday_pt.ICs_10050001): doomsday_pt.Cs_10050001;

        /**
         * Encodes the specified Cs_10050001 message. Does not implicitly {@link doomsday_pt.Cs_10050001.verify|verify} messages.
         * @param message Cs_10050001 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10050001, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10050001 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10050001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10050001;

        /**
         * Verifies a Cs_10050001 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10050001 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10050001
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10050001;

        /**
         * Creates a plain object from a Cs_10050001 message. Also converts values to other types if specified.
         * @param message Cs_10050001
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10050001, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10050001 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10050001. */
    interface ISc_10050001 {

        /** Sc_10050001 goods_list */
        goods_list?: (doomsday_pt.IPt_GoodsList[]|null);

        /** Sc_10050001 goods_fresh */
        goods_fresh: doomsday_pt.IPt_Goodsfresh;
    }

    /** Represents a Sc_10050001. */
    class Sc_10050001 implements ISc_10050001 {

        /**
         * Constructs a new Sc_10050001.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10050001);

        /** Sc_10050001 goods_list. */
        public goods_list: doomsday_pt.IPt_GoodsList[];

        /** Sc_10050001 goods_fresh. */
        public goods_fresh: doomsday_pt.IPt_Goodsfresh;

        /**
         * Creates a new Sc_10050001 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10050001 instance
         */
        public static create(properties?: doomsday_pt.ISc_10050001): doomsday_pt.Sc_10050001;

        /**
         * Encodes the specified Sc_10050001 message. Does not implicitly {@link doomsday_pt.Sc_10050001.verify|verify} messages.
         * @param message Sc_10050001 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10050001, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10050001 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10050001
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10050001;

        /**
         * Verifies a Sc_10050001 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10050001 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10050001
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10050001;

        /**
         * Creates a plain object from a Sc_10050001 message. Also converts values to other types if specified.
         * @param message Sc_10050001
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10050001, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10050001 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10050002. */
    interface ICs_10050002 {

        /** Cs_10050002 shop_type */
        shop_type: number;

        /** Cs_10050002 shop_lv */
        shop_lv: number;

        /** Cs_10050002 goods_id */
        goods_id: number;
    }

    /** Represents a Cs_10050002. */
    class Cs_10050002 implements ICs_10050002 {

        /**
         * Constructs a new Cs_10050002.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10050002);

        /** Cs_10050002 shop_type. */
        public shop_type: number;

        /** Cs_10050002 shop_lv. */
        public shop_lv: number;

        /** Cs_10050002 goods_id. */
        public goods_id: number;

        /**
         * Creates a new Cs_10050002 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10050002 instance
         */
        public static create(properties?: doomsday_pt.ICs_10050002): doomsday_pt.Cs_10050002;

        /**
         * Encodes the specified Cs_10050002 message. Does not implicitly {@link doomsday_pt.Cs_10050002.verify|verify} messages.
         * @param message Cs_10050002 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10050002, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10050002 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10050002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10050002;

        /**
         * Verifies a Cs_10050002 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10050002 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10050002
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10050002;

        /**
         * Creates a plain object from a Cs_10050002 message. Also converts values to other types if specified.
         * @param message Cs_10050002
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10050002, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10050002 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10050002. */
    interface ISc_10050002 {

        /** Sc_10050002 res */
        res: doomsday_pt.IResData;

        /** Sc_10050002 goods_list */
        goods_list: doomsday_pt.IPt_GoodsList;
    }

    /** Represents a Sc_10050002. */
    class Sc_10050002 implements ISc_10050002 {

        /**
         * Constructs a new Sc_10050002.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10050002);

        /** Sc_10050002 res. */
        public res: doomsday_pt.IResData;

        /** Sc_10050002 goods_list. */
        public goods_list: doomsday_pt.IPt_GoodsList;

        /**
         * Creates a new Sc_10050002 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10050002 instance
         */
        public static create(properties?: doomsday_pt.ISc_10050002): doomsday_pt.Sc_10050002;

        /**
         * Encodes the specified Sc_10050002 message. Does not implicitly {@link doomsday_pt.Sc_10050002.verify|verify} messages.
         * @param message Sc_10050002 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10050002, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10050002 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10050002
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10050002;

        /**
         * Verifies a Sc_10050002 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10050002 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10050002
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10050002;

        /**
         * Creates a plain object from a Sc_10050002 message. Also converts values to other types if specified.
         * @param message Sc_10050002
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10050002, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10050002 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Cs_10050003. */
    interface ICs_10050003 {

        /** Cs_10050003 shop_type */
        shop_type: number;

        /** Cs_10050003 shop_lv */
        shop_lv: number;

        /** Cs_10050003 fresh_goodsid */
        fresh_goodsid: number;
    }

    /** Represents a Cs_10050003. */
    class Cs_10050003 implements ICs_10050003 {

        /**
         * Constructs a new Cs_10050003.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ICs_10050003);

        /** Cs_10050003 shop_type. */
        public shop_type: number;

        /** Cs_10050003 shop_lv. */
        public shop_lv: number;

        /** Cs_10050003 fresh_goodsid. */
        public fresh_goodsid: number;

        /**
         * Creates a new Cs_10050003 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_10050003 instance
         */
        public static create(properties?: doomsday_pt.ICs_10050003): doomsday_pt.Cs_10050003;

        /**
         * Encodes the specified Cs_10050003 message. Does not implicitly {@link doomsday_pt.Cs_10050003.verify|verify} messages.
         * @param message Cs_10050003 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ICs_10050003, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_10050003 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_10050003
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Cs_10050003;

        /**
         * Verifies a Cs_10050003 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cs_10050003 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cs_10050003
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Cs_10050003;

        /**
         * Creates a plain object from a Cs_10050003 message. Also converts values to other types if specified.
         * @param message Cs_10050003
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Cs_10050003, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cs_10050003 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Sc_10050003. */
    interface ISc_10050003 {

        /** Sc_10050003 res */
        res: doomsday_pt.IResData;

        /** Sc_10050003 goods_list */
        goods_list?: (doomsday_pt.IPt_GoodsList[]|null);
    }

    /** Represents a Sc_10050003. */
    class Sc_10050003 implements ISc_10050003 {

        /**
         * Constructs a new Sc_10050003.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.ISc_10050003);

        /** Sc_10050003 res. */
        public res: doomsday_pt.IResData;

        /** Sc_10050003 goods_list. */
        public goods_list: doomsday_pt.IPt_GoodsList[];

        /**
         * Creates a new Sc_10050003 instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_10050003 instance
         */
        public static create(properties?: doomsday_pt.ISc_10050003): doomsday_pt.Sc_10050003;

        /**
         * Encodes the specified Sc_10050003 message. Does not implicitly {@link doomsday_pt.Sc_10050003.verify|verify} messages.
         * @param message Sc_10050003 message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.ISc_10050003, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_10050003 message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_10050003
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Sc_10050003;

        /**
         * Verifies a Sc_10050003 message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Sc_10050003 message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Sc_10050003
         */
        public static fromObject(object: { [k: string]: any }): doomsday_pt.Sc_10050003;

        /**
         * Creates a plain object from a Sc_10050003 message. Also converts values to other types if specified.
         * @param message Sc_10050003
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: doomsday_pt.Sc_10050003, options?: protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Sc_10050003 to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}

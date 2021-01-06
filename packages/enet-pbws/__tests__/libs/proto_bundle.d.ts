type Long = protobuf.Long;

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
        public param: [ 'Array' ].<string>;

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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
    }

    /** Properties of a Pt_GetAsset. */
    interface IPt_GetAsset {

        /** Pt_GetAsset asset_type */
        asset_type: number;

        /** Pt_GetAsset asset_num */
        asset_num: (number|Long);
    }

    /** Represents a Pt_GetAsset. */
    class Pt_GetAsset implements IPt_GetAsset {

        /**
         * Constructs a new Pt_GetAsset.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_GetAsset);

        /** Pt_GetAsset asset_type. */
        public asset_type: number;

        /** Pt_GetAsset asset_num. */
        public asset_num: (number|Long);

        /**
         * Creates a new Pt_GetAsset instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_GetAsset instance
         */
        public static create(properties?: doomsday_pt.IPt_GetAsset): doomsday_pt.Pt_GetAsset;

        /**
         * Encodes the specified Pt_GetAsset message. Does not implicitly {@link doomsday_pt.Pt_GetAsset.verify|verify} messages.
         * @param message Pt_GetAsset message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_GetAsset, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_GetAsset message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_GetAsset
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_GetAsset;

        /**
         * Verifies a Pt_GetAsset message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: [ 'object' ].<string, any>): (string|null);
    }

    /** Properties of a Pt_BaseGoods. */
    interface IPt_BaseGoods {

        /** Pt_BaseGoods base_id */
        base_id: number;

        /** Pt_BaseGoods num */
        num: number;
    }

    /** Represents a Pt_BaseGoods. */
    class Pt_BaseGoods implements IPt_BaseGoods {

        /**
         * Constructs a new Pt_BaseGoods.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_BaseGoods);

        /** Pt_BaseGoods base_id. */
        public base_id: number;

        /** Pt_BaseGoods num. */
        public num: number;

        /**
         * Creates a new Pt_BaseGoods instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_BaseGoods instance
         */
        public static create(properties?: doomsday_pt.IPt_BaseGoods): doomsday_pt.Pt_BaseGoods;

        /**
         * Encodes the specified Pt_BaseGoods message. Does not implicitly {@link doomsday_pt.Pt_BaseGoods.verify|verify} messages.
         * @param message Pt_BaseGoods message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_BaseGoods, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_BaseGoods message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_BaseGoods
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_BaseGoods;

        /**
         * Verifies a Pt_BaseGoods message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: [ 'object' ].<string, any>): (string|null);
    }

    /** Properties of a Pt_BaseGene. */
    interface IPt_BaseGene {

        /** Pt_BaseGene base_id */
        base_id: number;

        /** Pt_BaseGene strg_rank */
        strg_rank: number;

        /** Pt_BaseGene star_rank */
        star_rank: number;

        /** Pt_BaseGene limit_id */
        limit_id: number;
    }

    /** Represents a Pt_BaseGene. */
    class Pt_BaseGene implements IPt_BaseGene {

        /**
         * Constructs a new Pt_BaseGene.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_BaseGene);

        /** Pt_BaseGene base_id. */
        public base_id: number;

        /** Pt_BaseGene strg_rank. */
        public strg_rank: number;

        /** Pt_BaseGene star_rank. */
        public star_rank: number;

        /** Pt_BaseGene limit_id. */
        public limit_id: number;

        /**
         * Creates a new Pt_BaseGene instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_BaseGene instance
         */
        public static create(properties?: doomsday_pt.IPt_BaseGene): doomsday_pt.Pt_BaseGene;

        /**
         * Encodes the specified Pt_BaseGene message. Does not implicitly {@link doomsday_pt.Pt_BaseGene.verify|verify} messages.
         * @param message Pt_BaseGene message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_BaseGene, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_BaseGene message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_BaseGene
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_BaseGene;

        /**
         * Verifies a Pt_BaseGene message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: [ 'object' ].<string, any>): (string|null);
    }

    /** Properties of a DrawAward. */
    interface IDrawAward {

        /** DrawAward award_goods */
        award_goods?: (doomsday_pt.IPt_BaseGoods[]|null);

        /** DrawAward award_asset */
        award_asset?: (doomsday_pt.IPt_GetAsset[]|null);

        /** DrawAward award_genome */
        award_genome?: (doomsday_pt.IPt_BaseGene[]|null);
    }

    /** Represents a DrawAward. */
    class DrawAward implements IDrawAward {

        /**
         * Constructs a new DrawAward.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IDrawAward);

        /** DrawAward award_goods. */
        public award_goods: [ 'Array' ].<doomsday_pt.IPt_BaseGoods>;

        /** DrawAward award_asset. */
        public award_asset: [ 'Array' ].<doomsday_pt.IPt_GetAsset>;

        /** DrawAward award_genome. */
        public award_genome: [ 'Array' ].<doomsday_pt.IPt_BaseGene>;

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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public draw_award: [ 'Array' ].<doomsday_pt.IDrawAward>;

        /** BattleAward hero_exp_msg. */
        public hero_exp_msg: [ 'Array' ].<doomsday_pt.IHeroExpMsg>;

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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
    }

    /** Properties of a Pt_HeroAttList. */
    interface IPt_HeroAttList {

        /** Pt_HeroAttList hid */
        hid: (number|Long);

        /** Pt_HeroAttList hero_id */
        hero_id: number;

        /** Pt_HeroAttList index_id */
        index_id: number;

        /** Pt_HeroAttList att_list */
        att_list?: (doomsday_pt.IPt_AttList[]|null);
    }

    /** Represents a Pt_HeroAttList. */
    class Pt_HeroAttList implements IPt_HeroAttList {

        /**
         * Constructs a new Pt_HeroAttList.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_HeroAttList);

        /** Pt_HeroAttList hid. */
        public hid: (number|Long);

        /** Pt_HeroAttList hero_id. */
        public hero_id: number;

        /** Pt_HeroAttList index_id. */
        public index_id: number;

        /** Pt_HeroAttList att_list. */
        public att_list: [ 'Array' ].<doomsday_pt.IPt_AttList>;

        /**
         * Creates a new Pt_HeroAttList instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_HeroAttList instance
         */
        public static create(properties?: doomsday_pt.IPt_HeroAttList): doomsday_pt.Pt_HeroAttList;

        /**
         * Encodes the specified Pt_HeroAttList message. Does not implicitly {@link doomsday_pt.Pt_HeroAttList.verify|verify} messages.
         * @param message Pt_HeroAttList message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_HeroAttList, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_HeroAttList message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_HeroAttList
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_HeroAttList;

        /**
         * Verifies a Pt_HeroAttList message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: [ 'object' ].<string, any>): (string|null);
    }

    /** Properties of a Pt_SkillItem. */
    interface IPt_SkillItem {

        /** Pt_SkillItem cfg_skill_id */
        cfg_skill_id: number;

        /** Pt_SkillItem lvl */
        lvl: number;

        /** Pt_SkillItem extra_hurt */
        extra_hurt: number;
    }

    /** Represents a Pt_SkillItem. */
    class Pt_SkillItem implements IPt_SkillItem {

        /**
         * Constructs a new Pt_SkillItem.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_SkillItem);

        /** Pt_SkillItem cfg_skill_id. */
        public cfg_skill_id: number;

        /** Pt_SkillItem lvl. */
        public lvl: number;

        /** Pt_SkillItem extra_hurt. */
        public extra_hurt: number;

        /**
         * Creates a new Pt_SkillItem instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_SkillItem instance
         */
        public static create(properties?: doomsday_pt.IPt_SkillItem): doomsday_pt.Pt_SkillItem;

        /**
         * Encodes the specified Pt_SkillItem message. Does not implicitly {@link doomsday_pt.Pt_SkillItem.verify|verify} messages.
         * @param message Pt_SkillItem message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_SkillItem, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_SkillItem message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_SkillItem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_SkillItem;

        /**
         * Verifies a Pt_SkillItem message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: [ 'object' ].<string, any>): (string|null);
    }

    /** Properties of a Pt_WarHeroAtt. */
    interface IPt_WarHeroAtt {

        /** Pt_WarHeroAtt HeroAtt */
        HeroAtt: doomsday_pt.IPt_HeroAttList;

        /** Pt_WarHeroAtt skill_items */
        skill_items?: (doomsday_pt.IPt_SkillItem[]|null);

        /** Pt_WarHeroAtt p_skill_items */
        p_skill_items?: (doomsday_pt.IPt_SkillItem[]|null);
    }

    /** Represents a Pt_WarHeroAtt. */
    class Pt_WarHeroAtt implements IPt_WarHeroAtt {

        /**
         * Constructs a new Pt_WarHeroAtt.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_WarHeroAtt);

        /** Pt_WarHeroAtt HeroAtt. */
        public HeroAtt: doomsday_pt.IPt_HeroAttList;

        /** Pt_WarHeroAtt skill_items. */
        public skill_items: [ 'Array' ].<doomsday_pt.IPt_SkillItem>;

        /** Pt_WarHeroAtt p_skill_items. */
        public p_skill_items: [ 'Array' ].<doomsday_pt.IPt_SkillItem>;

        /**
         * Creates a new Pt_WarHeroAtt instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pt_WarHeroAtt instance
         */
        public static create(properties?: doomsday_pt.IPt_WarHeroAtt): doomsday_pt.Pt_WarHeroAtt;

        /**
         * Encodes the specified Pt_WarHeroAtt message. Does not implicitly {@link doomsday_pt.Pt_WarHeroAtt.verify|verify} messages.
         * @param message Pt_WarHeroAtt message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: doomsday_pt.IPt_WarHeroAtt, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Pt_WarHeroAtt message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pt_WarHeroAtt
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): doomsday_pt.Pt_WarHeroAtt;

        /**
         * Verifies a Pt_WarHeroAtt message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
    }

    /** Properties of a Pt_HeroMsg. */
    interface IPt_HeroMsg {

        /** Pt_HeroMsg id */
        id: (number|Long);

        /** Pt_HeroMsg hero_id */
        hero_id: number;

        /** Pt_HeroMsg index_id */
        index_id: number;

        /** Pt_HeroMsg grade */
        grade: number;

        /** Pt_HeroMsg hero_name */
        hero_name: string;
    }

    /** Represents a Pt_HeroMsg. */
    class Pt_HeroMsg implements IPt_HeroMsg {

        /**
         * Constructs a new Pt_HeroMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: doomsday_pt.IPt_HeroMsg);

        /** Pt_HeroMsg id. */
        public id: (number|Long);

        /** Pt_HeroMsg hero_id. */
        public hero_id: number;

        /** Pt_HeroMsg index_id. */
        public index_id: number;

        /** Pt_HeroMsg grade. */
        public grade: number;

        /** Pt_HeroMsg hero_name. */
        public hero_name: string;

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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
    }

    /** Properties of a Pt_RoleInfo. */
    interface IPt_RoleInfo {

        /** Pt_RoleInfo role_id */
        role_id: (number|Long);

        /** Pt_RoleInfo headicon_id */
        headicon_id: number;

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

        /** Pt_RoleInfo headicon_id. */
        public headicon_id: number;

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
        public hero_list: [ 'Array' ].<doomsday_pt.IPt_HeroMsg>;

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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
    }

    /** Properties of a Pt_Currency. */
    interface IPt_Currency {

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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
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
        public static verify(message: [ 'object' ].<string, any>): (string|null);
    }
}

type Long = protobuf.Long;
// DO NOT EDIT! This is a generated file. Edit the JSDoc in src/*.js instead and run 'npm run types'.

/** Namespace pb_test. */
declare namespace pb_test {

    /** Properties of a HeartBeat. */
    interface IHeartBeat {
    }

    /** Represents a HeartBeat. */
    class HeartBeat implements IHeartBeat {

        /**
         * Constructs a new HeartBeat.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb_test.IHeartBeat);

        /**
         * Creates a new HeartBeat instance using the specified properties.
         * @param [properties] Properties to set
         * @returns HeartBeat instance
         */
        public static create(properties?: pb_test.IHeartBeat): pb_test.HeartBeat;

        /**
         * Encodes the specified HeartBeat message. Does not implicitly {@link pb_test.HeartBeat.verify|verify} messages.
         * @param message HeartBeat message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb_test.IHeartBeat, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Encodes the specified HeartBeat message, length delimited. Does not implicitly {@link pb_test.HeartBeat.verify|verify} messages.
         * @param message HeartBeat message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb_test.IHeartBeat, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a HeartBeat message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns HeartBeat
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.HeartBeat;

        /**
         * Decodes a HeartBeat message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns HeartBeat
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: (protobuf.Reader|Uint8Array)): pb_test.HeartBeat;

        /**
         * Verifies a HeartBeat message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);
    }

    /** Properties of a LoginReq. */
    interface ILoginReq {

        /** LoginReq name */
        name: string;

        /** LoginReq pwd */
        pwd: string;
    }

    /** Represents a LoginReq. */
    class LoginReq implements ILoginReq {

        /**
         * Constructs a new LoginReq.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb_test.ILoginReq);

        /** LoginReq name. */
        public name: string;

        /** LoginReq pwd. */
        public pwd: string;

        /**
         * Creates a new LoginReq instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LoginReq instance
         */
        public static create(properties?: pb_test.ILoginReq): pb_test.LoginReq;

        /**
         * Encodes the specified LoginReq message. Does not implicitly {@link pb_test.LoginReq.verify|verify} messages.
         * @param message LoginReq message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb_test.ILoginReq, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Encodes the specified LoginReq message, length delimited. Does not implicitly {@link pb_test.LoginReq.verify|verify} messages.
         * @param message LoginReq message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb_test.ILoginReq, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a LoginReq message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LoginReq
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.LoginReq;

        /**
         * Decodes a LoginReq message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns LoginReq
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: (protobuf.Reader|Uint8Array)): pb_test.LoginReq;

        /**
         * Verifies a LoginReq message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);
    }

    /** Properties of a LoginRes. */
    interface ILoginRes {

        /** LoginRes uid */
        uid: number;
    }

    /** Represents a LoginRes. */
    class LoginRes implements ILoginRes {

        /**
         * Constructs a new LoginRes.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb_test.ILoginRes);

        /** LoginRes uid. */
        public uid: number;

        /**
         * Creates a new LoginRes instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LoginRes instance
         */
        public static create(properties?: pb_test.ILoginRes): pb_test.LoginRes;

        /**
         * Encodes the specified LoginRes message. Does not implicitly {@link pb_test.LoginRes.verify|verify} messages.
         * @param message LoginRes message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb_test.ILoginRes, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Encodes the specified LoginRes message, length delimited. Does not implicitly {@link pb_test.LoginRes.verify|verify} messages.
         * @param message LoginRes message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb_test.ILoginRes, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a LoginRes message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LoginRes
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.LoginRes;

        /**
         * Decodes a LoginRes message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns LoginRes
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: (protobuf.Reader|Uint8Array)): pb_test.LoginRes;

        /**
         * Verifies a LoginRes message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);
    }

    /** Properties of a ChatMsg. */
    interface IChatMsg {

        /** ChatMsg uid */
        uid: number;

        /** ChatMsg msg */
        msg: string;
    }

    /** Represents a ChatMsg. */
    class ChatMsg implements IChatMsg {

        /**
         * Constructs a new ChatMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb_test.IChatMsg);

        /** ChatMsg uid. */
        public uid: number;

        /** ChatMsg msg. */
        public msg: string;

        /**
         * Creates a new ChatMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ChatMsg instance
         */
        public static create(properties?: pb_test.IChatMsg): pb_test.ChatMsg;

        /**
         * Encodes the specified ChatMsg message. Does not implicitly {@link pb_test.ChatMsg.verify|verify} messages.
         * @param message ChatMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb_test.IChatMsg, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Encodes the specified ChatMsg message, length delimited. Does not implicitly {@link pb_test.ChatMsg.verify|verify} messages.
         * @param message ChatMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb_test.IChatMsg, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a ChatMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ChatMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.ChatMsg;

        /**
         * Decodes a ChatMsg message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ChatMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: (protobuf.Reader|Uint8Array)): pb_test.ChatMsg;

        /**
         * Verifies a ChatMsg message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);
    }

    /** Properties of a Kick. */
    interface IKick {
    }

    /** Represents a Kick. */
    class Kick implements IKick {

        /**
         * Constructs a new Kick.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb_test.IKick);

        /**
         * Creates a new Kick instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Kick instance
         */
        public static create(properties?: pb_test.IKick): pb_test.Kick;

        /**
         * Encodes the specified Kick message. Does not implicitly {@link pb_test.Kick.verify|verify} messages.
         * @param message Kick message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb_test.IKick, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Encodes the specified Kick message, length delimited. Does not implicitly {@link pb_test.Kick.verify|verify} messages.
         * @param message Kick message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: pb_test.IKick, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Kick message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Kick
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.Kick;

        /**
         * Decodes a Kick message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Kick
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: (protobuf.Reader|Uint8Array)): pb_test.Kick;

        /**
         * Verifies a Kick message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);
    }
}

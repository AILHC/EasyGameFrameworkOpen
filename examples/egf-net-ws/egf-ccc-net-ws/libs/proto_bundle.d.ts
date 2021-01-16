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
         * Decodes a HeartBeat message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns HeartBeat
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.HeartBeat;

        /**
         * Verifies a HeartBeat message.
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
         * Decodes a Kick message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Kick
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.Kick;

        /**
         * Verifies a Kick message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);
    }

    /** Properties of a Cs_Login. */
    interface ICs_Login {

        /** Cs_Login name */
        name: string;
    }

    /** Represents a Cs_Login. */
    class Cs_Login implements ICs_Login {

        /**
         * Constructs a new Cs_Login.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb_test.ICs_Login);

        /** Cs_Login name. */
        public name: string;

        /**
         * Creates a new Cs_Login instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_Login instance
         */
        public static create(properties?: pb_test.ICs_Login): pb_test.Cs_Login;

        /**
         * Encodes the specified Cs_Login message. Does not implicitly {@link pb_test.Cs_Login.verify|verify} messages.
         * @param message Cs_Login message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb_test.ICs_Login, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_Login message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_Login
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.Cs_Login;

        /**
         * Verifies a Cs_Login message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);
    }

    /** Properties of a Sc_Login. */
    interface ISc_Login {

        /** Sc_Login uid */
        uid: number;
    }

    /** Represents a Sc_Login. */
    class Sc_Login implements ISc_Login {

        /**
         * Constructs a new Sc_Login.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb_test.ISc_Login);

        /** Sc_Login uid. */
        public uid: number;

        /**
         * Creates a new Sc_Login instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_Login instance
         */
        public static create(properties?: pb_test.ISc_Login): pb_test.Sc_Login;

        /**
         * Encodes the specified Sc_Login message. Does not implicitly {@link pb_test.Sc_Login.verify|verify} messages.
         * @param message Sc_Login message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb_test.ISc_Login, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_Login message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_Login
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.Sc_Login;

        /**
         * Verifies a Sc_Login message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);
    }

    /** Properties of a Sc_userEnter. */
    interface ISc_userEnter {

        /** Sc_userEnter name */
        name: string;

        /** Sc_userEnter uid */
        uid: number;
    }

    /** Represents a Sc_userEnter. */
    class Sc_userEnter implements ISc_userEnter {

        /**
         * Constructs a new Sc_userEnter.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb_test.ISc_userEnter);

        /** Sc_userEnter name. */
        public name: string;

        /** Sc_userEnter uid. */
        public uid: number;

        /**
         * Creates a new Sc_userEnter instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_userEnter instance
         */
        public static create(properties?: pb_test.ISc_userEnter): pb_test.Sc_userEnter;

        /**
         * Encodes the specified Sc_userEnter message. Does not implicitly {@link pb_test.Sc_userEnter.verify|verify} messages.
         * @param message Sc_userEnter message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb_test.ISc_userEnter, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_userEnter message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_userEnter
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.Sc_userEnter;

        /**
         * Verifies a Sc_userEnter message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);
    }

    /** Properties of a Sc_userLeave. */
    interface ISc_userLeave {

        /** Sc_userLeave uid */
        uid: number;
    }

    /** Represents a Sc_userLeave. */
    class Sc_userLeave implements ISc_userLeave {

        /**
         * Constructs a new Sc_userLeave.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb_test.ISc_userLeave);

        /** Sc_userLeave uid. */
        public uid: number;

        /**
         * Creates a new Sc_userLeave instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_userLeave instance
         */
        public static create(properties?: pb_test.ISc_userLeave): pb_test.Sc_userLeave;

        /**
         * Encodes the specified Sc_userLeave message. Does not implicitly {@link pb_test.Sc_userLeave.verify|verify} messages.
         * @param message Sc_userLeave message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb_test.ISc_userLeave, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_userLeave message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_userLeave
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.Sc_userLeave;

        /**
         * Verifies a Sc_userLeave message.
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
         * Decodes a ChatMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ChatMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.ChatMsg;

        /**
         * Verifies a ChatMsg message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);
    }

    /** Properties of a Cs_SendMsg. */
    interface ICs_SendMsg {

        /** Cs_SendMsg msg */
        msg: pb_test.IChatMsg;
    }

    /** Represents a Cs_SendMsg. */
    class Cs_SendMsg implements ICs_SendMsg {

        /**
         * Constructs a new Cs_SendMsg.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb_test.ICs_SendMsg);

        /** Cs_SendMsg msg. */
        public msg: pb_test.IChatMsg;

        /**
         * Creates a new Cs_SendMsg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cs_SendMsg instance
         */
        public static create(properties?: pb_test.ICs_SendMsg): pb_test.Cs_SendMsg;

        /**
         * Encodes the specified Cs_SendMsg message. Does not implicitly {@link pb_test.Cs_SendMsg.verify|verify} messages.
         * @param message Cs_SendMsg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb_test.ICs_SendMsg, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Cs_SendMsg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cs_SendMsg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.Cs_SendMsg;

        /**
         * Verifies a Cs_SendMsg message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);
    }

    /** Properties of a Sc_Msg. */
    interface ISc_Msg {

        /** Sc_Msg msg */
        msg: pb_test.IChatMsg;
    }

    /** Represents a Sc_Msg. */
    class Sc_Msg implements ISc_Msg {

        /**
         * Constructs a new Sc_Msg.
         * @param [properties] Properties to set
         */
        constructor(properties?: pb_test.ISc_Msg);

        /** Sc_Msg msg. */
        public msg: pb_test.IChatMsg;

        /**
         * Creates a new Sc_Msg instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Sc_Msg instance
         */
        public static create(properties?: pb_test.ISc_Msg): pb_test.Sc_Msg;

        /**
         * Encodes the specified Sc_Msg message. Does not implicitly {@link pb_test.Sc_Msg.verify|verify} messages.
         * @param message Sc_Msg message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: pb_test.ISc_Msg, writer?: protobuf.Writer): protobuf.Writer;

        /**
         * Decodes a Sc_Msg message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Sc_Msg
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: (protobuf.Reader|Uint8Array), length?: number): pb_test.Sc_Msg;

        /**
         * Verifies a Sc_Msg message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);
    }
}

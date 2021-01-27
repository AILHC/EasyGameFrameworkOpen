
/**
 * @type {EgfProtobufConfig}
 */
module.exports = {
	/**protobufjs 编译选项 */
	options: {
		/**
		 * Does not generate create functions used for reflection compatibility.
		 * 不生成用于反射兼容性的create函数。
		 * 默认 false
		 */
		"no-create": false,
		/**
		 * Does not generate verify functions.
		 * 不生成 verify函数和代码
		 * false
		 */
		"no-verify": false,
		/**
		 * Does not generate convert functions like from/toObject
		 * 不生成转换函数 像这种 from/toObject
		 * 默认true
		 */
		"no-convert": true,
		/**
		 * Does not generate delimited encode/decode functions.
		 * 不生成带分隔符的encode/decode函数。
		 * 默认false
		 */
		"no-delimited": true
	},
	/**是否合并protobufjs库，即在输出protobuf proto文件的静态js时合并上protobuf的js库 */
	concatPbjsLib: false,
	/**库类型 
	 * 默认minimal ，暂不支持使用其他类型
	 * full 支持所有特性
	 * light light库的预构建浏览器版本，适合与反射、静态代码和JSON描述符/模块一起使用。
	 * minimal 包含预构建的浏览器版本的最小库，只适合与静态生成的代码一起使用。
	 * */
	libType: undefined,
	/**pbjs库输出文件夹,concatPbjsLib为false时有效，不填就不输出 */
	pbjsLibDir: "egf-ccc-net-ws/assets/libs",
	/**输出protojs文件类型  0 全部（js和.min.js）1(js) 2(.min.js)*/
	outputFileType: 1,
	/**.proto 文件夹路径  */
	sourceRoot: "protofiles",
	/**输出js文件名 */
	outFileName: "proto_bundle",
	/**生成js的输出路径 */
	outputDir: "egf-ccc-net-ws/assets/protojs",
	/**声明文件输出路径 */
	dtsOutDir:  "egf-ccc-net-ws/libs",
	/**是否使用压缩库，默认false */
	isUseMinLib: false,
	/**服务端输出配置 */
	serverOutputConfig: {
		/**protobufjs库输出目录 */
		pbjsLibDir: "egf-net-ws-server/libs",
        /**生成的proto js文件输出 */
		pbjsOutDir: "egf-net-ws-server/protojs",
        /**声明文件输出路径 */
		dtsOutDir: "egf-net-ws-server/libs"

	}

} 
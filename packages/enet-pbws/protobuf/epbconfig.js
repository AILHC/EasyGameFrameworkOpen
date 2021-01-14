/**
 * @type {EgfProtobufConfig}
 */
module.exports = {
	options: {
		"no-create": false,
		"no-verify": false,
		"no-convert": true,
		"no-delimited": true
	},
	concatPbjsLib: false,
	pbjsLibDir: undefined,
	outputFileType: 1,
	dtsOutDir: "__tests__/libs",
	sourceRoot: "protobuf/protofiles",
	outFileName: "proto_bundle",
	outputDir: "__tests__/protojs",
	// serverOutputConfig: {
	// 	pbjsLibDir: "server/libs",
	// 	pbjsOutDir: "server/protojs"

	// }

} 
/**
 * @type {EgfProtobufConfig}
 */
module.exports = {
	options: {
		"no-create": false,
		"no-verify": false,
		"no-convert": true,
		"no-delimited": false
	},
	concatPbjsLib: false,
	pbjsLibDir: "client/bin/libs",
	outputFileType: 1,
	dtsOutDir: "client/libs",
	sourceRoot: "protobuf/protofiles",
	outFileName: "proto_bundle",
	outputDir: "client/protojs",
	// serverOutputConfig: {
	// 	pbjsLibDir: "server/libs",
	// 	pbjsOutDir: "server/protojs"

	// }

} 
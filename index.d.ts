import jsonschema = require("jsonschema");

interface NestedSchemas {
	[key: string]: NestedSchemas;
}

interface PollResponseHelpers {
	validateSchema: (data: any) => jsonschema.ValidatorResult;
	validateSignature: (data: any, publicKey?: string) => boolean;
}

interface OpenPollHelpers {
	generic: any;
	mainChain: any;
	pollResponse: PollResponseHelpers;
	poll: any;
	shardBlock: any;
}

declare var _: OpenPollHelpers;
export = _;
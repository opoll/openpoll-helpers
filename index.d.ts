interface NestedSchemas {
	[key: string]: NestedSchemas;
}

interface GenericHelpers {
	publicKeyToAddress: (publicKey: string, versionByte?: string) => string;
}

interface PollHelpers {
	validateSchema: (data: any) => boolean;
	isExpired: (data: any) => boolean;
	hash: (data: any, digestType?: string) => string;
}

interface PollResponseHelpers {
	validateSchema: (data: any) => boolean;
	validateAnswers: (pollData: any, responseData: any) => boolean;
	hash: (data: any, digestType?: string) => string;
	validateSignature: (data: any, publicKey?: string) => boolean;
	sign: (data: any, privateKey: string | Buffer, publicKey: string | Buffer, rewardAddress?: string) => void;
}

interface OpenPollHelpers {
	generic: GenericHelpers;
	mainchain: any;
	pollResponse: PollResponseHelpers;
	poll: PollHelpers;
	shardBlock: any;
	transaction: any;
}

declare var _: OpenPollHelpers;
export = _;
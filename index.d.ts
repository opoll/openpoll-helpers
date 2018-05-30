interface NestedSchemas {
	[key: string]: NestedSchemas;
}

interface PollHelpers {
	validateSchema: (data: any) => boolean;
	isExpired: (data: any) => boolean;
	generateGenesisBlock: (data: any) => any;
	getFundingDistribution: (data: any) => any;
	orderedHashFields: (data: any) => any;
	hash: (data: any, digestType?: string) => string;
	hashQuestions: (data: any[], digestType?: string) => string[];
}

interface PollResponseHelpers {
	validateSchema: (data: any) => boolean;
	validateAnswers: (pollData: any, responseData: any) => boolean;
	hash: (data: any, digestType?: string) => string;
	validateSignature: (data: any, publicKey?: string) => boolean;
	sign: (data: any, privateKey: string | Buffer, publicKey: string | Buffer, rewardAddress?: string) => any;
}

interface OpenPollHelpers {
	generic: any;
	mainChain: any;
	pollResponse: PollResponseHelpers;
	poll: PollHelpers;
	shardBlock: any;
	transaction: any;
}

declare var _: OpenPollHelpers;
export = _;

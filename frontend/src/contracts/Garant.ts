export const GARANT_ADDRESS = '0xcc8A93723FF338c15d908DfBe517eF63F55E71Cf';

export const GARANT_ABI = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint32',
				name: '_id',
				type: 'uint32'
			}
		],
		name: 'Closed',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint32',
				name: '_id',
				type: 'uint32'
			}
		],
		name: 'Confirmed',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint32',
				name: '_id',
				type: 'uint32'
			}
		],
		name: 'Created',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint32',
				name: '_id',
				type: 'uint32'
			}
		],
		name: 'Declined',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint32',
				name: '_id',
				type: 'uint32'
			}
		],
		name: 'Joined',
		type: 'event'
	},
	{
		inputs: [
			{
				internalType: 'uint32',
				name: '_dealId',
				type: 'uint32'
			}
		],
		name: 'confirmDeal',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_amount',
				type: 'uint256'
			},
			{
				internalType: 'address',
				name: '_tokenAddress',
				type: 'address'
			}
		],
		name: 'createDeal',
		outputs: [],
		stateMutability: 'payable',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'uint32',
				name: '',
				type: 'uint32'
			}
		],
		name: 'deals',
		outputs: [
			{
				components: [
					{
						internalType: 'bool',
						name: 'confirmed',
						type: 'bool'
					},
					{
						internalType: 'uint256',
						name: 'amount',
						type: 'uint256'
					},
					{
						internalType: 'address',
						name: 'tokenAddress',
						type: 'address'
					},
					{
						internalType: 'address payable',
						name: 'sender',
						type: 'address'
					}
				],
				internalType: 'struct Garant.DealSide',
				name: 'creator',
				type: 'tuple'
			},
			{
				components: [
					{
						internalType: 'bool',
						name: 'confirmed',
						type: 'bool'
					},
					{
						internalType: 'uint256',
						name: 'amount',
						type: 'uint256'
					},
					{
						internalType: 'address',
						name: 'tokenAddress',
						type: 'address'
					},
					{
						internalType: 'address payable',
						name: 'sender',
						type: 'address'
					}
				],
				internalType: 'struct Garant.DealSide',
				name: 'acceptor',
				type: 'tuple'
			},
			{
				internalType: 'enum Garant.DealStatus',
				name: 'status',
				type: 'uint8'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'uint32',
				name: '_dealId',
				type: 'uint32'
			}
		],
		name: 'declineDeal',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'uint32',
				name: '_dealId',
				type: 'uint32'
			},
			{
				internalType: 'uint256',
				name: '_amount',
				type: 'uint256'
			},
			{
				internalType: 'address',
				name: '_tokenAddress',
				type: 'address'
			}
		],
		name: 'joinDeal',
		outputs: [],
		stateMutability: 'payable',
		type: 'function'
	}
];

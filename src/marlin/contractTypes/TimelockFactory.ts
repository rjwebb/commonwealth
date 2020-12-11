/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { BigNumberish } from "ethers/utils";

import { TransactionOverrides } from ".";
import { Timelock } from "./Timelock";

export class TimelockFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    admin_: string,
    delay_: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<Timelock> {
    return super.deploy(admin_, delay_, overrides) as Promise<Timelock>;
  }
  getDeployTransaction(
    admin_: string,
    delay_: BigNumberish,
    overrides?: TransactionOverrides
  ): UnsignedTransaction {
    return super.getDeployTransaction(admin_, delay_, overrides);
  }
  attach(address: string): Timelock {
    return super.attach(address) as Timelock;
  }
  connect(signer: Signer): TimelockFactory {
    return super.connect(signer) as TimelockFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Timelock {
    return new Contract(address, _abi, signerOrProvider) as Timelock;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "admin_",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "delay_",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "txHash",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "string",
        name: "signature",
        type: "string"
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "eta",
        type: "uint256"
      }
    ],
    name: "CancelTransaction",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "txHash",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "string",
        name: "signature",
        type: "string"
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "eta",
        type: "uint256"
      }
    ],
    name: "ExecuteTransaction",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAdmin",
        type: "address"
      }
    ],
    name: "NewAdmin",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "newDelay",
        type: "uint256"
      }
    ],
    name: "NewDelay",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newPendingAdmin",
        type: "address"
      }
    ],
    name: "NewPendingAdmin",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "txHash",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "string",
        name: "signature",
        type: "string"
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "eta",
        type: "uint256"
      }
    ],
    name: "QueueTransaction",
    type: "event"
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback"
  },
  {
    constant: true,
    inputs: [],
    name: "GRACE_PERIOD",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "MAXIMUM_DELAY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "MINIMUM_DELAY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "delay",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "pendingAdmin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    name: "queuedTransactions",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "delay_",
        type: "uint256"
      }
    ],
    name: "setDelay",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "acceptAdmin",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "pendingAdmin_",
        type: "address"
      }
    ],
    name: "setPendingAdmin",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "signature",
        type: "string"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "eta",
        type: "uint256"
      }
    ],
    name: "queueTransaction",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "signature",
        type: "string"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "eta",
        type: "uint256"
      }
    ],
    name: "cancelTransaction",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "signature",
        type: "string"
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes"
      },
      {
        internalType: "uint256",
        name: "eta",
        type: "uint256"
      }
    ],
    name: "executeTransaction",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes"
      }
    ],
    payable: true,
    stateMutability: "payable",
    type: "function"
  }
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516120143803806120148339818101604052604081101561003357600080fd5b8101908080519060200190929190805190602001909291905050506202a3008110156100aa576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526037815260200180611fa56037913960400191505060405180910390fd5b62278d00811115610106576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526038815260200180611fdc6038913960400191505060405180910390fd5b816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550806002819055505050611e478061015e6000396000f3fe6080604052600436106100c25760003560e01c80636a42b8f81161007f578063c1a287e211610059578063c1a287e21461073d578063e177246e14610768578063f2b06537146107a3578063f851a440146107f6576100c2565b80636a42b8f8146106bc5780637d645fab146106e7578063b1b43ae514610712576100c2565b80630825f38f146100c45780630e18b681146102c357806326782247146102da5780633a66f901146103315780634dd18bf5146104d8578063591fcdfe14610529575b005b610248600480360360a08110156100da57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561012157600080fd5b82018360208201111561013357600080fd5b8035906020019184600183028401116401000000008311171561015557600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290803590602001906401000000008111156101b857600080fd5b8201836020820111156101ca57600080fd5b803590602001918460018302840111640100000000831117156101ec57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019092919050505061084d565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561028857808201518184015260208101905061026d565b50505050905090810190601f1680156102b55780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156102cf57600080fd5b506102d8610ece565b005b3480156102e657600080fd5b506102ef61105c565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561033d57600080fd5b506104c2600480360360a081101561035457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561039b57600080fd5b8201836020820111156103ad57600080fd5b803590602001918460018302840111640100000000831117156103cf57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561043257600080fd5b82018360208201111561044457600080fd5b8035906020019184600183028401116401000000008311171561046657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050919291929080359060200190929190505050611082565b6040518082815260200191505060405180910390f35b3480156104e457600080fd5b50610527600480360360208110156104fb57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611448565b005b34801561053557600080fd5b506106ba600480360360a081101561054c57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561059357600080fd5b8201836020820111156105a557600080fd5b803590602001918460018302840111640100000000831117156105c757600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561062a57600080fd5b82018360208201111561063c57600080fd5b8035906020019184600183028401116401000000008311171561065e57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050919291929080359060200190929190505050611575565b005b3480156106c857600080fd5b506106d16118c0565b6040518082815260200191505060405180910390f35b3480156106f357600080fd5b506106fc6118c6565b6040518082815260200191505060405180910390f35b34801561071e57600080fd5b506107276118cd565b6040518082815260200191505060405180910390f35b34801561074957600080fd5b506107526118d4565b6040518082815260200191505060405180910390f35b34801561077457600080fd5b506107a16004803603602081101561078b57600080fd5b81019080803590602001909291905050506118db565b005b3480156107af57600080fd5b506107dc600480360360208110156107c657600080fd5b8101908080359060200190929190505050611a50565b604051808215151515815260200191505060405180910390f35b34801561080257600080fd5b5061080b611a70565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b60606000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146108f4576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526038815260200180611b266038913960400191505060405180910390fd5b60008686868686604051602001808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018581526020018060200180602001848152602001838103835286818151815260200191508051906020019080838360005b83811015610980578082015181840152602081019050610965565b50505050905090810190601f1680156109ad5780820380516001836020036101000a031916815260200191505b50838103825285818151815260200191508051906020019080838360005b838110156109e65780820151818401526020810190506109cb565b50505050905090810190601f168015610a135780820380516001836020036101000a031916815260200191505b509750505050505050506040516020818303038152906040528051906020012090506003600082815260200190815260200160002060009054906101000a900460ff16610aab576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603d815260200180611c79603d913960400191505060405180910390fd5b82610ab4611a95565b1015610b0b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526045815260200180611bc86045913960600191505060405180910390fd5b610b216212750084611a9d90919063ffffffff16565b610b29611a95565b1115610b80576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526033815260200180611b956033913960400191505060405180910390fd5b60006003600083815260200190815260200160002060006101000a81548160ff0219169083151502179055506060600086511415610bc057849050610c7b565b85805190602001208560405160200180837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260040182805190602001908083835b60208310610c435780518252602082019150602081019050602083039250610c20565b6001836020036101000a0380198251168184511680821785525050505050509050019250505060405160208183030381529060405290505b600060608973ffffffffffffffffffffffffffffffffffffffff1689846040518082805190602001908083835b60208310610ccb5780518252602082019150602081019050602083039250610ca8565b6001836020036101000a03801982511681845116808217855250505050505090500191505060006040518083038185875af1925050503d8060008114610d2d576040519150601f19603f3d011682016040523d82523d6000602084013e610d32565b606091505b509150915081610d8d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603d815260200180611d5c603d913960400191505060405180910390fd5b8973ffffffffffffffffffffffffffffffffffffffff16847fa560e3198060a2f10670c1ec5b403077ea6ae93ca8de1c32b451dc1a943cd6e78b8b8b8b604051808581526020018060200180602001848152602001838103835286818151815260200191508051906020019080838360005b83811015610e1a578082015181840152602081019050610dff565b50505050905090810190601f168015610e475780820380516001836020036101000a031916815260200191505b50838103825285818151815260200191508051906020019080838360005b83811015610e80578082015181840152602081019050610e65565b50505050905090810190601f168015610ead5780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390a38094505050505095945050505050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610f74576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526038815260200180611cb66038913960400191505060405180910390fd5b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f71614071b88dee5e0b2ae578a9dd7b2ebbe9ae832ba419dc0242cd065a290b6c60405160405180910390a2565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614611129576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526036815260200180611d266036913960400191505060405180910390fd5b611145600254611137611a95565b611a9d90919063ffffffff16565b82101561119d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526049815260200180611d996049913960600191505060405180910390fd5b60008686868686604051602001808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018581526020018060200180602001848152602001838103835286818151815260200191508051906020019080838360005b8381101561122957808201518184015260208101905061120e565b50505050905090810190601f1680156112565780820380516001836020036101000a031916815260200191505b50838103825285818151815260200191508051906020019080838360005b8381101561128f578082015181840152602081019050611274565b50505050905090810190601f1680156112bc5780820380516001836020036101000a031916815260200191505b5097505050505050505060405160208183030381529060405280519060200120905060016003600083815260200190815260200160002060006101000a81548160ff0219169083151502179055508673ffffffffffffffffffffffffffffffffffffffff16817f76e2796dc3a81d57b0e8504b647febcbeeb5f4af818e164f11eef8131a6a763f88888888604051808581526020018060200180602001848152602001838103835286818151815260200191508051906020019080838360005b8381101561139757808201518184015260208101905061137c565b50505050905090810190601f1680156113c45780820380516001836020036101000a031916815260200191505b50838103825285818151815260200191508051906020019080838360005b838110156113fd5780820151818401526020810190506113e2565b50505050905090810190601f16801561142a5780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390a38091505095945050505050565b3073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146114cc576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526038815260200180611cee6038913960400191505060405180910390fd5b80600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f69d78e38a01985fbb1462961809b4b2d65531bc93b2b94037f3334b82ca4a75660405160405180910390a250565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461161a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526037815260200180611b5e6037913960400191505060405180910390fd5b60008585858585604051602001808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018581526020018060200180602001848152602001838103835286818151815260200191508051906020019080838360005b838110156116a657808201518184015260208101905061168b565b50505050905090810190601f1680156116d35780820380516001836020036101000a031916815260200191505b50838103825285818151815260200191508051906020019080838360005b8381101561170c5780820151818401526020810190506116f1565b50505050905090810190601f1680156117395780820380516001836020036101000a031916815260200191505b5097505050505050505060405160208183030381529060405280519060200120905060006003600083815260200190815260200160002060006101000a81548160ff0219169083151502179055508573ffffffffffffffffffffffffffffffffffffffff16817f2fffc091a501fd91bfbff27141450d3acb40fb8e6d8382b243ec7a812a3aaf8787878787604051808581526020018060200180602001848152602001838103835286818151815260200191508051906020019080838360005b838110156118145780820151818401526020810190506117f9565b50505050905090810190601f1680156118415780820380516001836020036101000a031916815260200191505b50838103825285818151815260200191508051906020019080838360005b8381101561187a57808201518184015260208101905061185f565b50505050905090810190601f1680156118a75780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390a3505050505050565b60025481565b62278d0081565b6202a30081565b6212750081565b3073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461195f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526031815260200180611de26031913960400191505060405180910390fd5b6202a3008110156119bb576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526034815260200180611c0d6034913960400191505060405180910390fd5b62278d00811115611a17576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526038815260200180611c416038913960400191505060405180910390fd5b806002819055506002547f948b1f6a42ee138b7e34058ba85a37f716d55ff25ff05a763f15bed6a04c8d2c60405160405180910390a250565b60036020528060005260406000206000915054906101000a900460ff1681565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600042905090565b600080828401905083811015611b1b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b809150509291505056fe54696d656c6f636b3a3a657865637574655472616e73616374696f6e3a2043616c6c206d75737420636f6d652066726f6d2061646d696e2e54696d656c6f636b3a3a63616e63656c5472616e73616374696f6e3a2043616c6c206d75737420636f6d652066726f6d2061646d696e2e54696d656c6f636b3a3a657865637574655472616e73616374696f6e3a205472616e73616374696f6e206973207374616c652e54696d656c6f636b3a3a657865637574655472616e73616374696f6e3a205472616e73616374696f6e206861736e2774207375727061737365642074696d65206c6f636b2e54696d656c6f636b3a3a73657444656c61793a2044656c6179206d75737420657863656564206d696e696d756d2064656c61792e54696d656c6f636b3a3a73657444656c61793a2044656c6179206d757374206e6f7420657863656564206d6178696d756d2064656c61792e54696d656c6f636b3a3a657865637574655472616e73616374696f6e3a205472616e73616374696f6e206861736e2774206265656e207175657565642e54696d656c6f636b3a3a61636365707441646d696e3a2043616c6c206d75737420636f6d652066726f6d2070656e64696e6741646d696e2e54696d656c6f636b3a3a73657450656e64696e6741646d696e3a2043616c6c206d75737420636f6d652066726f6d2054696d656c6f636b2e54696d656c6f636b3a3a71756575655472616e73616374696f6e3a2043616c6c206d75737420636f6d652066726f6d2061646d696e2e54696d656c6f636b3a3a657865637574655472616e73616374696f6e3a205472616e73616374696f6e20657865637574696f6e2072657665727465642e54696d656c6f636b3a3a71756575655472616e73616374696f6e3a20457374696d6174656420657865637574696f6e20626c6f636b206d75737420736174697366792064656c61792e54696d656c6f636b3a3a73657444656c61793a2043616c6c206d75737420636f6d652066726f6d2054696d656c6f636b2ea265627a7a72315820e589f46d753e04036fd2bb680e61f3badc43f7fea08893226f0a1ccc808da4a864736f6c6343000510003254696d656c6f636b3a3a636f6e7374727563746f723a2044656c6179206d75737420657863656564206d696e696d756d2064656c61792e54696d656c6f636b3a3a73657444656c61793a2044656c6179206d757374206e6f7420657863656564206d6178696d756d2064656c61792e";

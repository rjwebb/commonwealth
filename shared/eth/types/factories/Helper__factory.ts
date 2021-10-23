/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";

import type { Helper } from "../Helper";

export class Helper__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Helper> {
    return super.deploy(overrides || {}) as Promise<Helper>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): Helper {
    return super.attach(address) as Helper;
  }
  connect(signer: Signer): Helper__factory {
    return super.connect(signer) as Helper__factory;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Helper {
    return new Contract(address, _abi, signerOrProvider) as Helper;
  }
}

const _abi = [
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
];

const _bytecode =
  "0x6080604052348015600f57600080fd5b50603e80601d6000396000f3fe6080604052600080fdfea265627a7a723158207b3d63b2b85adea3a30fee1ae99d3a71c79f05c14ce6335a85ccf4c3774e75bd64736f6c63430005100032";

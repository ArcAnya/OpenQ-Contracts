/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export interface BountyStorageV0Interface extends utils.Interface {
  functions: {
    "bountyClosedTime()": FunctionFragment;
    "bountyCreatedTime()": FunctionFragment;
    "bountyId()": FunctionFragment;
    "closer()": FunctionFragment;
    "closerData()": FunctionFragment;
    "depositTime(bytes32)": FunctionFragment;
    "deposits(uint256)": FunctionFragment;
    "expiration(bytes32)": FunctionFragment;
    "funder(bytes32)": FunctionFragment;
    "isNFT(bytes32)": FunctionFragment;
    "issuer()": FunctionFragment;
    "nftDepositLimit()": FunctionFragment;
    "nftDeposits(uint256)": FunctionFragment;
    "onERC721Received(address,address,uint256,bytes)": FunctionFragment;
    "openQ()": FunctionFragment;
    "organization()": FunctionFragment;
    "payoutAddress(bytes32)": FunctionFragment;
    "refunded(bytes32)": FunctionFragment;
    "status()": FunctionFragment;
    "tokenAddress(bytes32)": FunctionFragment;
    "tokenId(bytes32)": FunctionFragment;
    "volume(bytes32)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "bountyClosedTime"
      | "bountyCreatedTime"
      | "bountyId"
      | "closer"
      | "closerData"
      | "depositTime"
      | "deposits"
      | "expiration"
      | "funder"
      | "isNFT"
      | "issuer"
      | "nftDepositLimit"
      | "nftDeposits"
      | "onERC721Received"
      | "openQ"
      | "organization"
      | "payoutAddress"
      | "refunded"
      | "status"
      | "tokenAddress"
      | "tokenId"
      | "volume"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "bountyClosedTime",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "bountyCreatedTime",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "bountyId", values?: undefined): string;
  encodeFunctionData(functionFragment: "closer", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "closerData",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "depositTime",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "deposits",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "expiration",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "funder",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "isNFT",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: "issuer", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "nftDepositLimit",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "nftDeposits",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC721Received",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(functionFragment: "openQ", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "organization",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "payoutAddress",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "refunded",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: "status", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "tokenAddress",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenId",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "volume",
    values: [PromiseOrValue<BytesLike>]
  ): string;

  decodeFunctionResult(
    functionFragment: "bountyClosedTime",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "bountyCreatedTime",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "bountyId", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "closer", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "closerData", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "depositTime",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "deposits", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "expiration", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "funder", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "isNFT", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "issuer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "nftDepositLimit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "nftDeposits",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onERC721Received",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "openQ", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "organization",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "payoutAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "refunded", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "status", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tokenId", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "volume", data: BytesLike): Result;

  events: {
    "Initialized(uint8)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
}

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface BountyStorageV0 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: BountyStorageV0Interface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    bountyClosedTime(overrides?: CallOverrides): Promise<[BigNumber]>;

    bountyCreatedTime(overrides?: CallOverrides): Promise<[BigNumber]>;

    bountyId(overrides?: CallOverrides): Promise<[string]>;

    closer(overrides?: CallOverrides): Promise<[string]>;

    closerData(overrides?: CallOverrides): Promise<[string]>;

    depositTime(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    deposits(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    expiration(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    funder(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    isNFT(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    issuer(overrides?: CallOverrides): Promise<[string]>;

    nftDepositLimit(overrides?: CallOverrides): Promise<[BigNumber]>;

    nftDeposits(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    onERC721Received(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    openQ(overrides?: CallOverrides): Promise<[string]>;

    organization(overrides?: CallOverrides): Promise<[string]>;

    payoutAddress(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    refunded(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    status(overrides?: CallOverrides): Promise<[BigNumber]>;

    tokenAddress(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    tokenId(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    volume(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  bountyClosedTime(overrides?: CallOverrides): Promise<BigNumber>;

  bountyCreatedTime(overrides?: CallOverrides): Promise<BigNumber>;

  bountyId(overrides?: CallOverrides): Promise<string>;

  closer(overrides?: CallOverrides): Promise<string>;

  closerData(overrides?: CallOverrides): Promise<string>;

  depositTime(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  deposits(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  expiration(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  funder(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  isNFT(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  issuer(overrides?: CallOverrides): Promise<string>;

  nftDepositLimit(overrides?: CallOverrides): Promise<BigNumber>;

  nftDeposits(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  onERC721Received(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    arg2: PromiseOrValue<BigNumberish>,
    arg3: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  openQ(overrides?: CallOverrides): Promise<string>;

  organization(overrides?: CallOverrides): Promise<string>;

  payoutAddress(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  refunded(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  status(overrides?: CallOverrides): Promise<BigNumber>;

  tokenAddress(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  tokenId(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  volume(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    bountyClosedTime(overrides?: CallOverrides): Promise<BigNumber>;

    bountyCreatedTime(overrides?: CallOverrides): Promise<BigNumber>;

    bountyId(overrides?: CallOverrides): Promise<string>;

    closer(overrides?: CallOverrides): Promise<string>;

    closerData(overrides?: CallOverrides): Promise<string>;

    depositTime(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    deposits(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    expiration(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    funder(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    isNFT(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    issuer(overrides?: CallOverrides): Promise<string>;

    nftDepositLimit(overrides?: CallOverrides): Promise<BigNumber>;

    nftDeposits(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    onERC721Received(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    openQ(overrides?: CallOverrides): Promise<string>;

    organization(overrides?: CallOverrides): Promise<string>;

    payoutAddress(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    refunded(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    status(overrides?: CallOverrides): Promise<BigNumber>;

    tokenAddress(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    tokenId(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    volume(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {
    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;
  };

  estimateGas: {
    bountyClosedTime(overrides?: CallOverrides): Promise<BigNumber>;

    bountyCreatedTime(overrides?: CallOverrides): Promise<BigNumber>;

    bountyId(overrides?: CallOverrides): Promise<BigNumber>;

    closer(overrides?: CallOverrides): Promise<BigNumber>;

    closerData(overrides?: CallOverrides): Promise<BigNumber>;

    depositTime(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    deposits(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    expiration(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    funder(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isNFT(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    issuer(overrides?: CallOverrides): Promise<BigNumber>;

    nftDepositLimit(overrides?: CallOverrides): Promise<BigNumber>;

    nftDeposits(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    onERC721Received(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    openQ(overrides?: CallOverrides): Promise<BigNumber>;

    organization(overrides?: CallOverrides): Promise<BigNumber>;

    payoutAddress(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    refunded(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    status(overrides?: CallOverrides): Promise<BigNumber>;

    tokenAddress(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenId(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    volume(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    bountyClosedTime(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    bountyCreatedTime(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    bountyId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    closer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    closerData(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    depositTime(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    deposits(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    expiration(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    funder(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isNFT(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    issuer(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nftDepositLimit(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nftDeposits(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    onERC721Received(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    openQ(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    organization(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    payoutAddress(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    refunded(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    status(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokenAddress(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokenId(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    volume(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}

import app from 'state';
import { ethers } from 'ethers';
import { BlockInfo, IWebWallet } from 'models';
import { sessionSigninModal } from 'views/modals/session_signin_modal';

import {
  Block as CanvasBlock,
  ActionPayload,
  SessionPayload,
  getActionSignatureData,
} from "@canvas-js/interfaces";
// import { sessionPayloadType } from "@canvas-js/core";

class SessionsController {
  sessions: Record<string, { sessionPayload: SessionPayload | null, walletSigner: ethers.Wallet, blockInfo: object }>;

  constructor() {
    this.sessions = {}
  }

  // Check for the current session key for a chain, and prompt for re-login if necessary.
  public async ensureSessionIsValid(): Promise {
    const chainId = app.chain?.meta.node.ethChainId || 1;
    if (!this.sessions[chainId]) {
      await sessionSigninModal()
    }
  }

  // Get the current session key for a chain.
  public getAddress(chainId: number): string | null {
    return this.sessions[chainId]?.walletSigner.address;
  }

  // Create a new session key, which still needs to be signed by the user.
  public getOrCreateAddress(chainId: number): string {
    if (this.sessions[chainId]) {
      return this.sessions[chainId].walletSigner.address;
    }
    this.sessions[chainId] = {
      sessionPayload: null,
      blockInfo: null,
      walletSigner: ethers.Wallet.createRandom()
    };
    return this.sessions[chainId].walletSigner.address;
  }

  // Once the user has signed a session key, save the corresponding payload here.
  // Currently, this is done before validating the payload was correctly signed.
  //
  // TODO: Also save the signature, and set `this.valid = true` after validating it.
  //
  public updateSessionPayload(chainId: number, sessionPayload: SessionPayload, blockInfo: BlockInfo) {
    if (!this.sessions[chainId]) throw new Error("Invalid session! We should never get here");
    this.sessions[chainId].sessionPayload = sessionPayload;
    this.sessions[chainId].blockInfo = blockInfo;
  }

  // Sign an arbitrary action. Always call ensureSessionIsValid() right before sign().
  private async sign(call, ...args): Promise<{
    sessionData: SessionPayload,
    actionData: ActionPayload
  }> {
    if (args.some((arg) => arg === undefined)) {
      throw new Error("args cannot be undefined")
    }
    const chainId = app.chain?.meta.node.ethChainId || 1;
    if (!this.sessions[chainId]) throw new Error("Invalid signer");
    const { walletSigner, sessionPayload, blockInfo } = this.sessions[chainId];
    if (!walletSigner || !sessionPayload || !blockInfo) throw new Error("Invalid signer");

		const block: CanvasBlock = {
			chain: "eth",
			chainId,
			blocknum: blockInfo.number,
			blockhash: blockInfo.hash,
			timestamp: blockInfo.timestamp,
		};
		const actionTimestamp = +Date.now();
		const actionData: ActionPayload = {
      from: sessionPayload.from,
      spec: sessionPayload.spec,
      call,
      args,
      timestamp: actionTimestamp,
      block
    };
    const [domain, types, value] = getActionSignatureData(actionData);
    const signature = await walletSigner._signTypedData(domain, types, value);
    const id = signature; // TODO: what's the returned ID of canvas objects?
    return { signature, sessionData: sessionPayload, actionData, id };
  }

  // public signer methods

  public async signThread({ community, title, body, link, topic }) {
    const { signature, sessionData, actionData, id } = this.sign("thread", community || '', title, body, link || '', topic || '');
    return { signature, sessionData, actionData, id }
  }

  public async signDeleteThread({ id }) {
    const { signature, signedData } = this.sign("deleteThread", id);
    return { signature }
  }

  public async signComment({ community, threadId, parentCommentId, text }) {
    const { signature, sessionData, actionData, id } = this.sign("comment", threadId, text, parentCommentId);
    return { signature, sessionData, actionData, id }
  }

  public async signDeleteComment({ id }) {
    const { signature, signedData } = this.sign("deleteComment", id);
    return { signature }
  }

  public async signThreadReaction({ threadId, like }) {
    const reaction = like ? "like" : "dislike";
    const { signature, sessionData, actionData, id } = this.sign("reactThread", reaction, threadId);
    return { signature, sessionData, actionData, id }
  }

  public async signDeleteThreadReaction({ id }) {
    const { signature, signedData } = this.sign("unreactThread", id);
    return { signature }
  }

  public async signCommentReaction({ commentId, like }) {
    const reaction = like ? "like" : "dislike";
    const { signature, sessionData, actionData, id } = this.sign("reactComment", reaction, commentId);
    return { signature, sessionData, actionData, id }
  }

  public async signDeleteCommentReaction({ id }) {
    const { signature, signedData } = this.sign("unreactComment", id);
    return { signature }
  }
}

export default SessionsController;

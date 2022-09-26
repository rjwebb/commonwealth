/* @jsx m */

import m from 'mithril';
import { PopoverMenu } from 'construct-ui';

import 'pages/view_proposal/index.scss';

import app from 'state';
import { getProposalUrlPath } from 'identifiers';
import { slugify } from 'utils';
import { Thread, Comment, AnyProposal } from 'models';
import { SocialSharingCarat } from 'views/components/social_sharing_carat';
import {
  ProposalBodyAvatar,
  ProposalBodyAuthor,
  ProposalBodyCreated,
  ProposalBodyLastEdited,
  ProposalBodyCancelEdit,
  ProposalBodySaveEdit,
  ProposalBodyText,
  ProposalBodyAttachments,
  ProposalBodyEditor,
  ProposalBodyEditMenuItem,
  ProposalBodyDeleteMenuItem,
} from './body';
import { CWIcon } from '../../components/component_kit/cw_icons/cw_icon';
import { InlineReplyButton } from '../../components/inline_reply_button';
import { CommentReactionButton } from '../../components/reaction_button/comment_reaction_button';
import { QuillEditor } from '../../components/quill/quill_editor';
import { GlobalStatus, ProposalPageState } from './types';
import { scrollToForm } from './helpers';

export class ProposalComment
  implements
    m.ClassComponent<{
      comment: Comment<any>;
      getSetGlobalEditingStatus: CallableFunction;
      proposalPageState: ProposalPageState;
      parent: AnyProposal | Comment<any> | Thread;
      proposal: AnyProposal | Thread;
      callback?: CallableFunction;
      isAdmin?: boolean;
      isLast: boolean;
    }>
{
  private editing: boolean;
  private quillEditorState: QuillEditor;
  private replying: boolean;
  private saving: boolean;

  view(vnode) {
    const {
      comment,
      getSetGlobalEditingStatus,
      proposalPageState,
      proposal,
      callback,
      isAdmin,
      isLast,
    } = vnode.attrs;

    if (!comment) return;

    const commentLink = getProposalUrlPath(
      proposal.slug,
      `${proposal.identifier}-${slugify(proposal.title)}?comment=${comment.id}`
    );

    const commentReplyCount = app.comments
      .getByProposal(proposal)
      .filter((c) => c.parentComment === comment.id && !c.deleted).length;

    return (
      <div
        class="ProposalComment"
        onchange={() => m.redraw()} // TODO: avoid catching bubbled input events
      >
        {(!isLast || app.user.activeAccount) && (
          <div class="thread-connector" />
        )}
        <div class="comment-avatar">
          <ProposalBodyAvatar item={comment} />
        </div>
        <div class="comment-body">
          <div class="comment-body-top">
            <ProposalBodyAuthor item={comment} />
            <ProposalBodyCreated item={comment} link={commentLink} />
            <ProposalBodyLastEdited item={comment} />
            {((!this.editing &&
              app.user.activeAccount &&
              !getSetGlobalEditingStatus(GlobalStatus.Get) &&
              app.user.activeAccount?.chain.id === comment.authorChain &&
              app.user.activeAccount?.address === comment.author) ||
              isAdmin) && (
              <PopoverMenu
                closeOnContentClick
                transitionDuration={0}
                content={
                  app.user.activeAccount?.address === comment.author && (
                    <>
                      <ProposalBodyEditMenuItem
                        item={comment}
                        proposalPageState={proposalPageState}
                        getSetGlobalEditingStatus={getSetGlobalEditingStatus}
                        parentState={this}
                      />
                      <ProposalBodyDeleteMenuItem
                        item={comment}
                        refresh={() => callback()}
                      />
                    </>
                  )
                }
                trigger={
                  <div>
                    <CWIcon iconName="chevronDown" iconSize="small" />
                  </div>
                }
              />
            )}
            <SocialSharingCarat commentID={comment.id} />
          </div>
          <div class="comment-body-content">
            {!this.editing && <ProposalBodyText item={comment} />}
            {!this.editing &&
              comment.attachments &&
              comment.attachments.length > 0 && (
                <ProposalBodyAttachments item={comment} />
              )}
            {this.editing && (
              <ProposalBodyEditor item={comment} parentState={this} />
            )}
          </div>
          <div class="comment-body-bottom">
            {this.editing && (
              <div class="comment-edit-buttons">
                <ProposalBodySaveEdit
                  item={comment}
                  getSetGlobalEditingStatus={getSetGlobalEditingStatus}
                  parentState={this}
                  callback={callback}
                />
                <ProposalBodyCancelEdit
                  item={comment}
                  getSetGlobalEditingStatus={getSetGlobalEditingStatus}
                  parentState={this}
                />
              </div>
            )}
            {!this.editing && !comment.deleted && (
              <div class="comment-response-row">
                <CommentReactionButton comment={comment} />
                <InlineReplyButton
                  commentReplyCount={commentReplyCount}
                  onclick={() => {
                    if (
                      !proposalPageState.replying ||
                      proposalPageState.parentCommentId !== comment.id
                    ) {
                      proposalPageState.replying = true;
                      proposalPageState.parentCommentId = comment.id;
                      scrollToForm(comment.id);
                    } else {
                      proposalPageState.replying = false;
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

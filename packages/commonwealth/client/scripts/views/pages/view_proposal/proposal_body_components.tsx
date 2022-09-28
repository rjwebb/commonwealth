/* @jsx m */

import m from 'mithril';
import lity from 'lity';

import app from 'state';
import { Thread, Comment, AnyProposal, Account } from 'models';
import User from 'views/components/widgets/user';
import { QuillFormattedText } from 'views/components/quill/quill_formatted_text';
import { MarkdownFormattedText } from 'views/components/quill/markdown_formatted_text';
import { formatBody } from './helpers';
import {
  QUILL_PROPOSAL_LINES_CUTOFF_LENGTH,
  MARKDOWN_PROPOSAL_LINES_CUTOFF_LENGTH,
} from './constants';
import { CWText } from '../../components/component_kit/cw_text';

export class ProposalBodyText
  implements
    m.ClassComponent<{
      item: AnyProposal | Thread | Comment<any>;
    }>
{
  private body: any;
  private collapsed: boolean;

  oninit(vnode) {
    this.collapsed = false;
    formatBody(vnode, true);
  }

  onupdate(vnode) {
    formatBody(vnode, false);
  }

  view(vnode) {
    const { body } = this;

    const getPlaceholder = () => {
      if (!(vnode.attrs.item instanceof Thread)) return;

      const author: Account = app.chain
        ? app.chain.accounts.get(vnode.attrs.item.author)
        : null;

      return author ? (
        <>
          {m(User, {
            user: author,
            hideAvatar: true,
            hideIdentityIcon: true,
          })}{' '}
          created this thread
        </>
      ) : (
        'Created this thread'
      );
    };

    const text = () => {
      try {
        const doc = JSON.parse(body);

        if (!doc.ops) throw new Error();

        if (
          doc.ops.length === 1 &&
          doc.ops[0] &&
          typeof doc.ops[0].insert === 'string' &&
          doc.ops[0].insert.trim() === ''
        ) {
          return getPlaceholder();
        }

        return (
          <QuillFormattedText
            doc={doc}
            cutoffLines={QUILL_PROPOSAL_LINES_CUTOFF_LENGTH}
            collapse={false}
            hideFormatting={false}
          />
        );
      } catch (e) {
        if (body?.toString().trim() === '') {
          return getPlaceholder();
        }
        return (
          <MarkdownFormattedText
            doc={body}
            cutoffLines={MARKDOWN_PROPOSAL_LINES_CUTOFF_LENGTH}
          />
        );
      }
    };

    return <div>{text()}</div>;
  }
}

export class ProposalBodyAttachments
  implements
    m.Component<{
      item: Thread | Comment<any>;
    }>
{
  view(vnode) {
    const { item } = vnode.attrs;
    if (!item) return;

    return (
      <>
        <CWText>Attachments ({item.attachments.length})</CWText>
        {item.attachments.map((attachment) => (
          <a
            href={attachment.url}
            title={attachment.description}
            target="_blank"
            noopener="noopener"
            noreferrer="noreferrer"
            onclick={(e) => {
              e.preventDefault();
              lity(attachment.url);
            }}
          >
            <img src={attachment.url} />
          </a>
        ))}
      </>
    );
  }
}

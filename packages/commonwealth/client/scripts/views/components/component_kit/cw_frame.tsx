/* @jsx m */

import m from 'mithril';

import 'components/component_kit/cw_card.scss';

import { ComponentType } from './types';
import { getClasses } from './helpers';
import { CWText } from './cw_text';
import { CWDivider } from './cw_divider';
import { CWIcon } from './cw_icons/cw_icon';

type FrameStyleAttrs = {
  className?: string;
};

type FrameAttrs = {
  header: string;
  body: string;
  minimizable: boolean;
} & FrameStyleAttrs;

export class CWFrame implements m.ClassComponent<FrameAttrs> {
  view(vnode) {
    const { className, header, body, minimizable } = vnode.attrs;

    return (
      <div
        class={getClasses<FrameStyleAttrs>(
          {
            className,
          },
          ComponentType.Frame
        )}
        onclick={onclick}
        onmouseover={onmouseover}
        onmouseenter={onmouseenter}
        onmouseleave={onmouseleave}
      >
        <div class="cw-frame-header">
          {minimizable && <CWIcon iconName="chevronDown" iconSize="small" />}
          <CWText type="h5" fontStyle="semibold">
            {header}
          </CWText>
        </div>
        <CWDivider />
        <CWText type="body">{body}</CWText>
      </div>
    );
  }
}

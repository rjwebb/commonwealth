/* @jsx m */

import m from 'mithril';

import 'sublayout_header_right.scss';

import app from 'state';
import { NewProposalButton } from 'views/components/new_proposal_button';
import { ChainInfo } from 'models';
import { NotificationsMenu } from 'views/components/header/notifications_menu';
import { InvitesMenu } from 'views/components/header/invites_menu';
import { LoginSelector } from 'views/components/header/login_selector';
import Sublayout from './sublayout';
import { CWIcon } from './components/component_kit/cw_icons/cw_icon';

type SublayoutHeaderRightAttrs = {
  chain: ChainInfo;
  disableSearch: boolean;
  parentState: Sublayout;
  showNewProposalButton?: boolean;
};

export class SublayoutHeaderRight
  implements m.ClassComponent<SublayoutHeaderRightAttrs>
{
  view(vnode) {
    const { chain, disableSearch, parentState, showNewProposalButton } =
      vnode.attrs;

    return (
      <div class="SublayoutHeaderRight">
        {/* Icon to toggle display of search bar */}
        {!disableSearch && !parentState.searchbarToggled && (
          <CWIcon
            className="search"
            iconName="search"
            onclick={() => {
              parentState.searchbarToggled = true;
              m.redraw();
            }}
          />
        )}
        {/* threadOnly option assumes all chains have proposals beyond threads */}
        {showNewProposalButton && (
          <NewProposalButton fluid={false} threadOnly={!chain} />
        )}
        {app.isLoggedIn() && <NotificationsMenu />}
        {app.isLoggedIn() && <InvitesMenu />}
        <InvitesMenu />
        <LoginSelector />
      </div>
    );
  }
}

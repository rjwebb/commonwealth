import m from 'mithril';
import app from 'state';
import { CWFrame } from '../components/component_kit/cw_frame';

export class CommunityRules implements m.ClassComponent {
  view(vnode) {
    return (
      <>
        <CWFrame
          header="Admins Only"
          body="Only Admins can perform the gated actions"
        />
        <CWFrame
          header="All Rules"
          body="Passes if all the provided rules are passed"
        >
          <CWFrame header="Allowlist" minimizable={true} />
          <CWFrame header="Token Balance Threshold" minimizable={true} />
        </CWFrame>
      </>
    );
  }
}

/* @jsx m */

import m from 'mithril';

import 'pages/discussions/threads_overview.scss';

import app from 'state';
import { LoadingRow } from '../../components/loading_row';
import { CWText } from '../../components/component_kit/cw_text';
import { CWButton } from '../../components/component_kit/cw_button';
import { ThreadSummaryRow } from './thread_summary_row';

export class ThreadsOverview implements m.ClassComponent {
  private initializing: boolean;

  oninit() {
    app.recentActivity.getRecentTopicActivity().then(() => {
      m.redraw();
    });
  }

  view() {
    if (this.initializing) {
      return LoadingRow;
    }

    const topics = app.topics.getByCommunity(app.activeChainId());

    return (
      <div class="ThreadsOverview">
        <div class="header-row">
          <CWText type="h5" fontWeight="semiBold">
            Topic
          </CWText>
          <div class="threads-header-container">
            <CWText type="h5" fontWeight="semiBold">
              Recent threads
            </CWText>
            <CWButton buttonType="mini" label="Create Thread" iconName="plus" />
          </div>
        </div>
        {topics.map((topic) => {
          const monthlyThreads = app.threads.overviewStore
            .getAll()
            .filter((thread) => thread.topic.id === topic.id);

          return (
            <ThreadSummaryRow monthlyThreads={monthlyThreads} topic={topic} />
          );
        })}
      </div>
    );
  }
}

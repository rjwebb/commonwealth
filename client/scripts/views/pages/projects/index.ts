import 'pages/crowdfund/index.scss';

import m from 'mithril';
import app from 'state';
import { AddressInfo } from 'models';
import SearchBar from '../../components/search_bar';
import { CWButton } from '../../components/component_kit/cw_button';
import ProjectCard, { ProjectCardSize } from './project_card';
import Sublayout from '../../sublayout';
import { DummyProject } from './dummy_project';

type ProjectProgress = {
  inBlocks: number;
  asPercent: number;
}

type ProjectDeadline = {
  inBlocks: number;
  asDate: Date;
}

type ProjectFunds = {
  inTokens: number;
  inDollars: number;
}

export type Project = {
  id: number;
  title: string;
  description: string;
  shortDescription?: string;
  coverImage: string;
  token: any;
  creator: AddressInfo;
  beneficiary: AddressInfo;
  backers: AddressInfo[];
  curators: AddressInfo[];
  createdAt: Date;
  progress: ProjectProgress;
  deadline: ProjectDeadline;
  threshold: ProjectFunds;
  raised: ProjectFunds;
}

// interface ProjectListingState {
// }

const ProjectListing: m.Component = {
  view: (vnode) => {
    const projects = app.activeChainId()
      ? app.projects.filter((project) => project.chain === app.activeChainId())
      : app.projects;
    const userCreatedProjects: Project[] = Array(2).fill(DummyProject); // projects.filter(...)
    const userBackedProjects: Project[] = Array(4).fill(DummyProject); // projects.filter(...)
    const userPreviouslyBackedProjects: Project[] = Array(6).fill(DummyProject); // projects.filter(...)
    const trendingProjects: Project[] = Array(2).fill(DummyProject); // projects.filter(...)
    const recommendedProjects: Project[] = Array(4).fill(DummyProject) // projects.filter(...)
    return m(Sublayout, {
      class: 'ProjectListing',
      title: 'Projects',
      showNewProposalButton: false,
    }, [
      (userCreatedProjects.length || userBackedProjects.length || userPreviouslyBackedProjects.length) &&
      m('.user-projects', [
        userCreatedProjects.length
        && m('.user-created-project-wrap', [
          m('.user-created-project-header', [
            m('h1', 'Your Projects'),
            m(CWButton, {
              intent: 'primary',
              label: 'Create New Project',
              onclick: () => true, // m.route.set(`${app.activeId()}/createProject`)
            }),
          ]),
          m('.user-created-projects', userCreatedProjects.map((project) => {
              return m(ProjectCard, { project, size: ProjectCardSize.Large })
           })
          ),
        ]),
        m('.user-backed-project-wrap', [
          m('h2', 'Currently Backing'),
          m('.user-backed-projects', userBackedProjects.map((project) => {
              return m(ProjectCard, { project, size: ProjectCardSize.Medium })
           })
          ),
        ]),
        m('.user-previously-backed-project-wrap', [
          m('h3', 'Past Contributions'),
          m('.user-previously-backed-projects', userPreviouslyBackedProjects.map((project) => {
            return m(ProjectCard, { project, size: ProjectCardSize.Small })
           })
          ),
        ])
      ]),
      (trendingProjects.length || recommendedProjects.length)
      && m('.community-projects', [
        m('h1', 'Discover'),
        m('.project-discovery', [
          m('.trending-projects', [
            m('h2', 'Trending'),
            trendingProjects.map((project) => {
              return m(ProjectCard, { project, size: ProjectCardSize.Large })
            })
          ]),
          m('.recommended-projects', [
            m('h2', 'Recommended'),
            recommendedProjects.map((project) => {
              return m(ProjectCard, { project, size: ProjectCardSize.Medium })
            })
          ]),
        ]),
        // TODO: ModularizeSearch
        m(SearchBar)
      ])
    ])
  }
}

export default ProjectListing;
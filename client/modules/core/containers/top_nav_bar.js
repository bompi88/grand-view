import TopNavBar from '../components/top_nav_bar/top_nav_bar';
import {useDeps, composeWithTracker, composeAll} from 'mantra-core';

export const composer = ({context}, onData) => {
  const {TAPi18n} = context();

  const text = {
    grandview: TAPi18n.__('navbar.grandview'),
    myDocuments: TAPi18n.__('navbar.my_documents'),
    myTemplates: TAPi18n.__('navbar.my_templates'),
    trash: TAPi18n.__('navbar.trash'),
    workArea: TAPi18n.__('navbar.work_area'),
    conceptLogo: TAPi18n.__('navbar.concept_logo'),
    toggleNavigation: TAPi18n.__('navbar.toggle_navigation'),
    gotoHome: TAPi18n.__('navbar.goto_home')
  };

  onData(null, {text});
};

export default composeAll(
  composeWithTracker(composer),
  useDeps()
)(TopNavBar);

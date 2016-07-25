import * as Collections from './../../lib/collections';
import {Meteor} from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {ReactiveDict} from 'meteor/reactive-dict';
import {Tracker} from 'meteor/tracker';
import {$} from 'meteor/jquery';
import {_} from 'meteor/underscore';
import {TAPi18n} from 'meteor/tap:i18n';
import {NotificationManager} from 'react-notifications';
import {moment} from 'meteor/momentjs:moment';

import Helpers from './../lib/helpers';
import SelectedCtrl from './../lib/controllers/selected_nodes';
import ReferencesCtrl from './../lib/controllers/references';
import ShowMoreCtrl from './../lib/controllers/show_more';
import TagsCtrl from './../lib/controllers/tags';

export default function () {
  return {
    NotificationManager,
    moment,
    SelectedCtrl,
    ReferencesCtrl,
    ShowMoreCtrl,
    TagsCtrl,
    TAPi18n,
    Meteor,
    FlowRouter,
    Collections,
    LocalState: new ReactiveDict(),
    Tracker,
    Helpers,
    $,
    _
  };
}

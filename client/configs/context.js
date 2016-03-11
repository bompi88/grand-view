import * as Collections from '/lib/collections';
import {Meteor} from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {ReactiveDict} from 'meteor/reactive-dict';
import {Tracker} from 'meteor/tracker';
import {$} from 'meteor/jquery';
import {_} from 'meteor/underscore';
import Helpers from '/client/lib/helpers';

import SelectedCtrl from '/client/lib/controllers/selected_nodes';
import ReferencesCtrl from '/client/lib/controllers/references';
import ShowMoreCtrl from '/client/lib/controllers/show_more';
import TagsCtrl from '/client/lib/controllers/tags';


export default function () {
  return {
    SelectedCtrl,
    ReferencesCtrl,
    ShowMoreCtrl,
    TagsCtrl,
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

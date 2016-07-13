import * as Collections from './../../lib/collections';
import {Meteor} from 'meteor/meteor';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {ReactiveDict} from 'meteor/reactive-dict';
import {Tracker} from 'meteor/tracker';
import {$} from 'meteor/jquery';
import {_} from 'meteor/underscore';

import Helpers from './../lib/helpers';
import SelectedCtrl from './../lib/controllers/selected_nodes';
import ReferencesCtrl from './../lib/controllers/references';
import ShowMoreCtrl from './../lib/controllers/show_more';
import TagsCtrl from './../lib/controllers/tags';


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

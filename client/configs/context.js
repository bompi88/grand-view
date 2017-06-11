import { NotificationManager } from 'react-notifications';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { reducer as formReducer } from 'redux-form';
import { moment } from 'meteor/momentjs:moment';
// import createLogger from 'redux-logger';
import { TAPi18n } from 'meteor/tap:i18n';
import { Tracker } from 'meteor/tracker';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Match } from 'meteor/check';
import $ from 'jquery';
import 'magnific-popup';
import bootbox from 'bootbox';
import {
  createStore,
  applyMiddleware,
  combineReducers,
} from 'redux';
import undoable from 'redux-undo';

import * as Collections from './../../lib/collections';

import Helpers from './../lib/helpers';
import SelectedCtrl from './../lib/controllers/selected_nodes';
import ReferencesCtrl from './../lib/controllers/references';
import ShowMoreCtrl from './../lib/controllers/show_more';
import TagsCtrl from './../lib/controllers/tags';

const LocalState = new ReactiveDict();

export default function ({ reducers }) {
  const reducer = combineReducers({
    ...reducers,
    form: undoable(formReducer),
  });

  const middlewares = [
    // createLogger()
  ];

  const Store = createStore(reducer, applyMiddleware(...middlewares));

  return {
    NotificationManager,
    moment,
    Match,
    SelectedCtrl,
    ReferencesCtrl,
    ShowMoreCtrl,
    TagsCtrl,
    TAPi18n,
    Meteor,
    FlowRouter,
    Collections,
    LocalState,
    Tracker,
    Helpers,
    $,
    _,
    Store,
    bootbox,
    dispatch: Store.dispatch,
  };
}

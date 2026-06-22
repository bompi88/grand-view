/* eslint-env mocha */

import { expect } from 'meteor/practicalmeteor:chai';
import { spy, stub } from 'sinon';
import { Meteor } from 'meteor/meteor';
import { ReactiveDict } from 'meteor/reactive-dict';
import StubCollections from 'meteor/hwillson:stub-collections';

import actions from './edit_view';

const Nodes = new Meteor.Collection('nodes');

StubCollections.stub(Nodes);

const LocalState = new ReactiveDict();

describe('core.actions.edit_view', function() {
  // beforeEach(() => generateData());
  describe('setNodeEditable', function() {
    it('should set EDIT_NODE in LocalState with nodeId', function() {
      const ls = { set: spy() };
      actions.setNodeEditable({ LocalState: ls }, 'someNodeId');
      const args = ls.set.args[0];

      expect(args.length).to.be.equal(2);
      expect(args[0]).to.be.equal('EDIT_NODE');
      expect(args[1]).to.be.equal('someNodeId');
    });

    it('should set EDIT_NODE with proper value', function() {
      actions.setNodeEditable({ LocalState }, 'someNodeId');
      const value = LocalState.get('EDIT_NODE');

      expect(value).to.be.equal('someNodeId');
    });
  });

  describe('unsetNodeEditable', () => {
    it('should unset EDIT_NODE in LocalState', function() {
      actions.unsetNodeEditable({ LocalState }, 'someNodeId');
      const value = LocalState.get('EDIT_NODE');

      expect(value).to.be.equal(null);
    });
  });

  describe('setReferences', () => {
    it('should update references in minimongo', () => {
      const _id = Nodes.insert({});

      const references = [
        {
          label: 'test1',
          value: 'test1',
        },
        {
          label: 'test2',
          value: 'test2',
        },
      ];

      actions.setReferences({ LocalState, Meteor, Collections: { Nodes } }, references, _id);
      const node = Nodes.findOne(_id);
      expect(node.references).to.deep.equal(references);
      StubCollections.restore();
    });
  });
});

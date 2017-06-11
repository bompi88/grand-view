import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Documents } from './collections';

export default {
  /**
   * Returns true if the current document or the document with the specified id
   * is a template.
   */
  isTemplate(id) {
    if (id) {
      const { template } = Documents.findOne({ _id: id });
      return template;
    }
    if (Meteor.isServer) {
      return '';
    }

    // TODO: convert to flowrouter
    const routeController = FlowRouter.current();
    const currentDoc = routeController && routeController.data && routeController.data();
    return currentDoc && currentDoc.template;
  },
};

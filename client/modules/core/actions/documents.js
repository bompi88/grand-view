////////////////////////////////////////////////////////////////////////////////
// Document Actions
////////////////////////////////////////////////////////////////////////////////
//
// Copyright 2015 Concept
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
////////////////////////////////////////////////////////////////////////////////

const actions = {

  formatDateRelative({moment}, time) {
    return moment && moment(time).calendar();
  },

  formatDateRegular({moment}, time) {
    return moment && moment(time).format('L');
  },

  renderTemplateTitle({Collections, moment}, _id, o) {

    if (!_id) {
      return '-';
    }

    const {doc, text} = o;
    const template = Collections.Documents.findOne({ _id });

    if (!template) {
      return '-';
    }

    const title = template.title;
    return title + ' (' + text.by + ' ' + moment(doc.createdAt).format('L') + ')';
  },

  isDisabledOnManyAndNone({SelectedCtrl}, tableName) {
    return SelectedCtrl.getSelected(tableName).length !== 1;
  },

  isDisabledOnNone({SelectedCtrl}, tableName) {
    return SelectedCtrl.getSelected(tableName).length === 0;
  },

  getTemplateTitle({Collections}, _id) {
    const template = Collections.Documents.findOne({ _id });
    return template && template.title;
  },

  createNewDocument({LocalState}) {
    LocalState.set('NEW_DOCUMENT_MODAL_VISIBLE', true);
  },

  openDocument({LocalState, Collections, FlowRouter}, _id) {
    LocalState.set('CURRENT_DOCUMENT', _id);
    FlowRouter.go('WorkArea');
  },

  openSelectedDocument({LocalState, Collections, FlowRouter, SelectedCtrl}, tableName) {
    const _id = SelectedCtrl.getSelected(tableName)[0];
    LocalState.set('CURRENT_DOCUMENT', _id);
    FlowRouter.go('WorkArea');
  },

  toggleSelected({SelectedCtrl}, id, tableName, e) {
    e.stopPropagation();
    e.preventDefault();

    if (SelectedCtrl.isSelected(tableName, id)) {
      SelectedCtrl.remove(tableName, id);
    } else {
      SelectedCtrl.add(tableName, id);
    }
  },

  toggleSort({LocalState}, field, tableName) {
    let curSort = LocalState.get('TABLE_SORT_' + tableName.toUpperCase());

    if (curSort && curSort[field]) {
      curSort[field] *= -1;
    } else {
      const sortObj = {};
      sortObj[field] = 1;
      curSort = sortObj;
    }
    LocalState.set('TABLE_SORT_' + tableName.toUpperCase(), curSort);
  },

  getSort({LocalState}, field, tableName) {
    const sort = LocalState.get('TABLE_SORT_' + tableName.toUpperCase()) || { title: 1 };
    return sort[field];
  },

  isSelected({SelectedCtrl}, id, tableName) {
    return SelectedCtrl.isSelected(tableName, id);
  },

  selectAll({SelectedCtrl}, ids, tableName) {
    SelectedCtrl.addAll(tableName, ids);
  },

  deselectAll({SelectedCtrl}, ids, tableName) {
    SelectedCtrl.removeAll(tableName, ids);
  },

  hasAllSelected({SelectedCtrl}, len, tableName) {
    const selected = SelectedCtrl.getSelected(tableName).length;
    return selected > 0 && selected === len;
  },

  exportDocument(context, id, e) {
    e.stopPropagation();
    const {Helpers} = context;
    Helpers.exportDocument(context, id);
  },

  exportSelectedDocuments(context, tableName) {
    const {Helpers, SelectedCtrl} = context;
    const selectedIds = SelectedCtrl.getSelected(tableName);
    Helpers.exportDocument(context, selectedIds);
  },

  importDocuments(context, e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    const {Helpers} = context;
    Helpers.importDocuments(context);
  },

  removeDocument({Meteor, NotificationManager, TAPi18n, SelectedCtrl, LocalState}, id, e) {
    e.stopPropagation();

    Meteor.call('documents.softRemove', id, (err) => {
      if (err) {
        NotificationManager.error(
          TAPi18n.__('notifications.soft_remove_document_failed.message'),
          TAPi18n.__('notifications.soft_remove_document_failed.title')
        );
      } else {
        SelectedCtrl.remove('documents', id);

        if (id === LocalState.get('CURRENT_DOCUMENT')) {
          LocalState.set('CURRENT_DOCUMENT', null);
        }

        NotificationManager.success(
          TAPi18n.__('notifications.soft_remove_document_success.message'),
          TAPi18n.__('notifications.soft_remove_document_success.title')
        );
      }
    });
  },

  removeSelectedDocuments(context, tableName) {
    const {Meteor, NotificationManager, TAPi18n, SelectedCtrl, _, LocalState} = context;
    const selectedIds = SelectedCtrl.getSelected(tableName);

    Meteor.call('documents.softRemove', selectedIds, (err) => {
      if (err) {
        NotificationManager.error(
          TAPi18n.__('notifications.soft_remove_document_failed.message'),
          TAPi18n.__('notifications.soft_remove_document_failed.title')
        );
      } else {
        SelectedCtrl.reset(tableName);

        if (_.contains(selectedIds, LocalState.get('CURRENT_DOCUMENT'))) {
          LocalState.set('CURRENT_DOCUMENT', null);
        }

        NotificationManager.success(
          TAPi18n.__('notifications.soft_remove_document_success.message'),
          TAPi18n.__('notifications.soft_remove_document_success.title')
        );
      }
    });
  },

  clearState({LocalState, SelectedCtrl}) {
    LocalState.set('TABLE_SORT_DOCUMENTS', { title: 1 });
    SelectedCtrl.reset('documents');
  }

};

export default actions;

////////////////////////////////////////////////////////////////////////////////
// Document Table Actions
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

export default {

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
    LocalState.set('NEW_DOCUMENT_MODAL', true);
  },

  openDocument({LocalState, Collections, FlowRouter}, _id) {
    const doc = Collections.Documents.findOne({_id});
    LocalState.set('CURRENT_DOCUMENT', doc);
    FlowRouter.go('Document', { _id });
  },

  toggleSelected({SelectedCtrl}, id, e) {
    e.stopPropagation();
    e.preventDefault();

    if (SelectedCtrl.isSelected('documents', id)) {
      SelectedCtrl.remove('documents', id);
    } else {
      SelectedCtrl.add('documents', id);
    }
  },

  toggleSort({LocalState}, field) {
    let curSort = LocalState.get('TABLE_SORT');

    if (curSort && curSort[field]) {
      curSort[field] *= -1;
    } else {
      const sortObj = {};
      sortObj[field] = 1;
      curSort = sortObj;
    }
    LocalState.set('TABLE_SORT', curSort);
  },

  getSort({LocalState}, field) {
    const sort = LocalState.get('TABLE_SORT') || { title: 1 };
    return sort[field];
  },

  isSelected({SelectedCtrl}, id) {
    return SelectedCtrl.isSelected('documents', id);
  },

  selectAll({SelectedCtrl}, ids) {
    SelectedCtrl.addAll('documents', ids);
  },

  deselectAll({SelectedCtrl}, ids) {
    SelectedCtrl.removeAll('documents', ids);
  },

  hasAllSelected({SelectedCtrl}, len) {
    const selected = SelectedCtrl.getSelected('documents').length;
    return selected > 0 && selected === len;
  },

  exportDocument(context, id, e) {
    e.stopPropagation();
    const {Helpers} = context;
    Helpers.exportDocument(context, id);
  },

  importDocument(context, e) {
    e.stopPropagation();
    const {Helpers} = context;
    Helpers.importDocument(context);
  },

  removeDocument({Meteor, NotificationManager, TAPi18n}, id, e) {
    e.stopPropagation();

    Meteor.call('documents.remove', id, (err) => {
      if (err) {
        NotificationManager.error(
          TAPi18n.__('notifications.soft_remove_document_failed.message'),
          TAPi18n.__('notifications.soft_remove_document_failed.title')
        );
      } else {
        NotificationManager.success(
          TAPi18n.__('notifications.soft_remove_document_success.message'),
          TAPi18n.__('notifications.soft_remove_document_success.title')
        );
      }
    });
  },

  clearState({LocalState, SelectedCtrl}) {
    LocalState.set('TABLE_SORT', { title: 1 });
    SelectedCtrl.reset('documents');
  }

};

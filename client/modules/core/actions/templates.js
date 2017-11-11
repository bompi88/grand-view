// //////////////////////////////////////////////////////////////////////////////
// Template Actions
// //////////////////////////////////////////////////////////////////////////////
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
// //////////////////////////////////////////////////////////////////////////////

export default {

  formatDateRelative({ moment }, time) {
    return moment && moment(time).calendar();
  },

  isDisabledOnManyAndNone({ SelectedCtrl }, tableName) {
    return SelectedCtrl.getSelected(tableName).length !== 1;
  },

  isDisabledOnNone({ SelectedCtrl }, tableName) {
    return SelectedCtrl.getSelected(tableName).length === 0;
  },

  createNewTemplate({ LocalState }) {
    LocalState.set('NEW_TEMPLATE_MODAL_VISIBLE', true);
  },

  openTemplate({ LocalState, Collections, FlowRouter }, _id) {
    LocalState.set('CURRENT_DOCUMENT', _id);
    LocalState.set('TREE_VIEW_STATE', null);
    FlowRouter.go('WorkArea');
  },

  openSelectedTemplate({ LocalState, Collections, FlowRouter, SelectedCtrl }, tableName) {
    const _id = SelectedCtrl.getSelected(tableName)[0];
    LocalState.set('CURRENT_DOCUMENT', _id);
    FlowRouter.go('WorkArea');
  },

  toggleSelected({ SelectedCtrl }, id, tableName, e) {
    e.stopPropagation();
    e.preventDefault();

    if (SelectedCtrl.isSelected(tableName, id)) {
      SelectedCtrl.remove(tableName, id);
    } else {
      SelectedCtrl.add(tableName, id);
    }
  },

  toggleSort({ LocalState }, field, tableName) {
    let curSort = LocalState.get(`TABLE_SORT_${tableName.toUpperCase()}`);

    if (curSort && curSort[field]) {
      curSort[field] *= -1;
    } else {
      const sortObj = {};
      sortObj[field] = 1;
      curSort = sortObj;
    }
    LocalState.set(`TABLE_SORT_${tableName.toUpperCase()}`, curSort);
  },

  getSort({ LocalState }, field, tableName) {
    const sort = LocalState.get(`TABLE_SORT_${tableName.toUpperCase()}`) || { title: 1 };
    return sort[field];
  },

  isSelected({ SelectedCtrl }, id, tableName) {
    return SelectedCtrl.isSelected(tableName, id);
  },

  selectAll({ SelectedCtrl }, ids, tableName) {
    SelectedCtrl.addAll(tableName, ids);
  },

  deselectAll({ SelectedCtrl }, ids, tableName) {
    SelectedCtrl.removeAll(tableName, ids);
  },

  hasAllSelected({ SelectedCtrl }, len, tableName) {
    const selected = SelectedCtrl.getSelected(tableName).length;
    return selected > 0 && selected === len;
  },

  exportTemplate(context, id, e) {
    e.stopPropagation();
    const { Helpers } = context;
    Helpers.exportDocument(context, id, true);
  },

  exportSelectedTemplates(context, tableName) {
    const { Helpers, SelectedCtrl } = context;
    const selectedIds = SelectedCtrl.getSelected(tableName);
    Helpers.exportDocument(context, selectedIds, true);
  },

  importTemplates(context, e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    const { Helpers } = context;
    Helpers.importDocuments(context, true);
  },

  removeTemplate({ Meteor, NotificationManager, TAPi18n, SelectedCtrl, LocalState }, id, e) {
    e.stopPropagation();

    Meteor.call('documents.softRemove', id, (err) => {
      if (err) {
        NotificationManager.error(
          TAPi18n.__('notifications.soft_remove_template_failed.message'),
          TAPi18n.__('notifications.soft_remove_template_failed.title'),
        );
      } else {
        SelectedCtrl.remove('templates', id);

        if (id === LocalState.get('CURRENT_DOCUMENT')) {
          LocalState.set('CURRENT_DOCUMENT', null);
        }

        NotificationManager.success(
          TAPi18n.__('notifications.soft_remove_template_success.message'),
          TAPi18n.__('notifications.soft_remove_template_success.title'),
        );
      }
    });
  },

  removeSelectedTemplates(context, tableName) {
    const { Meteor, NotificationManager, TAPi18n, SelectedCtrl, _, LocalState } = context;
    const selectedIds = SelectedCtrl.getSelected(tableName);

    Meteor.call('documents.softRemove', selectedIds, (err) => {
      if (err) {
        NotificationManager.error(
          TAPi18n.__('notifications.soft_remove_template_failed.message'),
          TAPi18n.__('notifications.soft_remove_template_failed.title'),
        );
      } else {
        SelectedCtrl.reset(tableName);

        if (_.contains(selectedIds, LocalState.get('CURRENT_DOCUMENT'))) {
          LocalState.set('CURRENT_DOCUMENT', null);
        }

        NotificationManager.success(
          TAPi18n.__('notifications.soft_remove_template_success.message'),
          TAPi18n.__('notifications.soft_remove_template_success.title'),
        );
      }
    });
  },

  clearState({ LocalState, SelectedCtrl }) {
    LocalState.set('TABLE_SORT_TEMPLATES', { title: 1 });
    SelectedCtrl.reset('templates');
  },

};

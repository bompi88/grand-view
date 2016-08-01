////////////////////////////////////////////////////////////////////////////////
// Template Actions
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

  createNewTemplate({LocalState}) {
    LocalState.set('NEW_TEMPLATE_MODAL_VISIBLE', true);
  },

  openTemplate({LocalState, Collections, FlowRouter}, _id) {
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

  exportTemplate(context, id, e) {
    e.stopPropagation();
    const {Helpers} = context;
    Helpers.exportDocument(context, id, true);
  },

  importTemplate(context, e) {
    e.stopPropagation();
    const {Helpers} = context;
    Helpers.importDocument(context, true);
  },

  removeTemplate({Meteor, NotificationManager, TAPi18n}, id, e) {
    e.stopPropagation();

    Meteor.call('documents.softRemove', id, (err) => {
      if (err) {
        NotificationManager.error(
          TAPi18n.__('notifications.soft_remove_template_failed.message'),
          TAPi18n.__('notifications.soft_remove_template_failed.title')
        );
      } else {
        NotificationManager.success(
          TAPi18n.__('notifications.soft_remove_template_success.message'),
          TAPi18n.__('notifications.soft_remove_template_success.title')
        );
      }
    });
  },

  clearState({LocalState, SelectedCtrl}) {
    LocalState.set('TABLE_SORT_TEMPLATES', { title: 1 });
    SelectedCtrl.reset('templates');
  }

};

// //////////////////////////////////////////////////////////////////////////////
// Trash Actions
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

  isDisabledOnNone({ SelectedCtrl }) {
    return SelectedCtrl.getSelected('trash_documents').length === 0 &&
      SelectedCtrl.getSelected('trash_templates').length === 0;
  },

  isDisabledNoDocs({ Collections }) {
    return Collections.Documents.find({ removed: true }).fetch().length === 0;
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

  remove({ Meteor, NotificationManager, TAPi18n, _, SelectedCtrl, bootbox, Collections }, _id) {
    const { title } = Collections.Documents.findOne({ _id });
    const confirmationPrompt = {
      title: 'Bekreftelse på slettingen',
      message: `Er du sikker på at du vil slette prosjektet <b>${title}</b>?`,
      buttons: {
        cancel: {
          label: 'Nei',
        },
        confirm: {
          label: 'Ja',
          callback(result) {
            if (result) {
              // Remove the document
              Meteor.call('documents.remove', _id, (err) => {
                if (err) {
                  NotificationManager.error(
                    TAPi18n.__('notifications.permanent_remove_failed.message'),
                    TAPi18n.__('notifications.permanent_remove_failed.title'),
                  );
                } else {
                  SelectedCtrl.resetAll();
                  NotificationManager.success(
                    TAPi18n.__('notifications.permanent_remove_success.message'),
                    TAPi18n.__('notifications.permanent_remove_success.title'),
                  );
                }
              });
            }
          },
        },
      },
    };
    bootbox.dialog(confirmationPrompt);
  },

  removeSelected({ Meteor, NotificationManager, TAPi18n, _, SelectedCtrl, bootbox, Collections }) {
    const selectedDocumentIds = SelectedCtrl.getSelected('trash_documents') || [];
    const selectedTemplateIds = SelectedCtrl.getSelected('trash_templates') || [];

    const selected = _.union(selectedDocumentIds, selectedTemplateIds);

    let message = 'Er du sikker på at du vil slette de valgte elementene under?';

    const documentNames = Collections.Documents.find({
      _id: { $in: selectedDocumentIds },
    }).map(doc => `<li>${doc.title}</li>`);

    const templateNames = Collections.Documents.find({
      _id: { $in: selectedTemplateIds },
    }).map(doc => `<li>${doc.title}</li>`);

    if (documentNames.length) {
      message += `<h5><b>Dokumenter:</b></h5><ol>${documentNames.join('')}</ol>`;
    }

    if (templateNames.length) {
      message += `<h5><b>Maler:</b></h5><ol>${templateNames.join('')}</ol>`;
    }

    const confirmationPrompt = {
      title: 'Bekreftelse på slettingen',
      message,
      buttons: {
        cancel: {
          label: 'Nei',
        },
        confirm: {
          label: 'Ja',
          callback(result) {
            if (result) {
              // Remove the document
              Meteor.call('documents.remove', selected, (err) => {
                if (err) {
                  NotificationManager.error(
                    TAPi18n.__('notifications.permanent_remove_failed.message'),
                    TAPi18n.__('notifications.permanent_remove_failed.title'),
                  );
                } else {
                  SelectedCtrl.resetAll();
                  NotificationManager.success(
                    TAPi18n.__('notifications.permanent_remove_success.message'),
                    TAPi18n.__('notifications.permanent_remove_success.title'),
                  );
                }
              });
            }
          },
        },
      },
    };
    bootbox.dialog(confirmationPrompt);
  },

  restore({ Meteor, NotificationManager, TAPi18n, _, SelectedCtrl }, _id) {
    Meteor.call('documents.restore', _id, (err) => {
      if (err) {
        NotificationManager.error(
          TAPi18n.__('notifications.restore_failed.message'),
          TAPi18n.__('notifications.restore_failed.title'),
        );
      } else {
        SelectedCtrl.resetAll();
        NotificationManager.success(
          TAPi18n.__('notifications.restore_success.message'),
          TAPi18n.__('notifications.restore_success.title'),
        );
        SelectedCtrl.resetAll();
      }
    });
  },

  restoreSelected({ Meteor, NotificationManager, TAPi18n, _, SelectedCtrl }) {
    const selected = _.union(SelectedCtrl.getSelected('trash_documents'),
      SelectedCtrl.getSelected('trash_templates'));
    Meteor.call('documents.restore', selected, (err) => {
      if (err) {
        NotificationManager.error(
          TAPi18n.__('notifications.restore_failed.message'),
          TAPi18n.__('notifications.restore_failed.title'),
        );
      } else {
        SelectedCtrl.resetAll();
        NotificationManager.success(
          TAPi18n.__('notifications.restore_success.message'),
          TAPi18n.__('notifications.restore_success.title'),
        );
        SelectedCtrl.resetAll();
      }
    });
  },

  emptyTrash({ Meteor, NotificationManager, TAPi18n, SelectedCtrl, bootbox, Collections }) {
    let message = 'Er du sikker på at du vil tømme papirkurven? Da vil følgende elementer bli slettet:';

    const documentNames = Collections.Documents.find({
      removed: true,
      isTemplate: false,
    }).map(doc => `<li>${doc.title}</li>`);

    const templateNames = Collections.Documents.find({
      removed: true,
      isTemplate: true,
    }).map(doc => `<li>${doc.title}</li>`);

    if (documentNames.length) {
      message += `<h5><b>Dokumenter:</b></h5><ol>${documentNames.join('')}</ol>`;
    }

    if (templateNames.length) {
      message += `<h5><b>Maler:</b></h5><ol>${templateNames.join('')}</ol>`;
    }
    const confirmationPrompt = {
      title: 'Bekreftelse på tømming av papirkurv',
      message,
      buttons: {
        cancel: {
          label: 'Nei',
        },
        confirm: {
          label: 'Ja',
          callback(result) {
            if (result) {
              // Remove the document
              Meteor.call('documents.emptyTrash', (err) => {
                if (err) {
                  NotificationManager.error(
                    TAPi18n.__('notifications.empty_trash_failed.message'),
                    TAPi18n.__('notifications.empty_trash_failed.title'),
                  );
                } else {
                  SelectedCtrl.resetAll();
                  NotificationManager.success(
                    TAPi18n.__('notifications.empty_trash_success.message'),
                    TAPi18n.__('notifications.empty_trash_success.title'),
                  );
                }
              });
            }
          },
        },
      },
    };
    bootbox.dialog(confirmationPrompt);
  },

  clearState({ LocalState, SelectedCtrl }) {
    LocalState.set('TABLE_SORT_TRASH_DOCUMENTS', { title: 1 });
    LocalState.set('TABLE_SORT_TRASH_TEMPLATES', { title: 1 });
    SelectedCtrl.reset('trash_documents');
    SelectedCtrl.reset('trash_templates');
  },

};

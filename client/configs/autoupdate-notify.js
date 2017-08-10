const { ipcRenderer } = _require('electron');

export default function ({ NotificationManager }) {
  ipcRenderer.on('message', function(event, text) {
    NotificationManager.success(
      text,
      'Auto update',
    );
  });
}

const builder = require('electron-builder');
const Platform = builder.Platform;

builder.build({
  config: {
    asarUnpack: [
      '**/programs/server/assets/app/*',
      'resources/mongod',
      'resources/mongod.exe'
    ],
    appId: 'no.conceptntnu.grandview',
    electronVersion: '1.6.10',
    npmRebuild: true,
    asar: true,
    files: [
      '**/*',
      '**/.*'
    ],
    mac: {
      category: 'public.app-category.productivity',
      icon: '.assets/osx/grandview.icns',
      "target": [
        "zip",
        "dmg"
      ]
    },
    dmg: {
      title: 'GrandView',
      icon: '.assets/osx/grandview.icns',
      background: '.assets/osx/installer.png',
      iconSize: 80,
      contents: [
        {
          x: 438,
          y: 344,
          type: 'link',
          path: '/Applications'
        },
        {
          x: 192,
          y: 344,
          type: 'file'
        }
      ]
    },
    win: {
      icon: '.assets/win/grandview.ico'
    },
    nsis: {
      perMachine: true
    },
    linux: {
      icon: '.assets/linux',
      target: [
        "deb",
        "AppImage"
      ]
    },
    directories: {
      app: '.app',
      output: '.dist'
    },
    publish: [{
      provider: 'github',
      owner: 'bompi88',
      repo: 'grand-view',
      private: false
    }],
    afterPack() {
      console.log('Test if app starts');

      // return new Promise(function(resolve, reject) {
      //   reject();
      // }); 
    }
  }
})
.then(() => {
  // handle result
})
.catch((error) => {
  // handle error
})

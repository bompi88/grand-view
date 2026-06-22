const builder = require('electron-builder');
const Arch = builder.Arch;
const Platform = builder.Platform;

const args = require('minimist')(process.argv.slice(2));

const { arch, platform } = args;

const selectedArch = arch === 'x64' ? Arch.x64 : Arch.ia32;

let target;

if (platform === 'darwin') {
  target = Platform.MAC.createTarget(null, selectedArch);
} else if (platform === 'linux') {
  target = Platform.LINUX.createTarget(null, selectedArch);
} else {
  target = Platform.WINDOWS.createTarget(['nsis-web'], Arch.x64, Arch.ia32);
}

builder.build({
  targets: target,
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
    nsisWeb: {
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
    afterPack() {
      console.log('Test if app starts');
      // return new Promise(function(resolve, reject) {
      //   const testRun = cp.spawn('./test_build');
      //   testRun.on('exit', (code) => {
      //     code === 1 ? reject(new Error('App not starting.')) : resolve();
      //   });
      // });

      return Promise.resolve();
    }
  },
  publish: "always"
})
.then(() => {
  console.log('finnished')
  // handle result
})
.catch((error) => {
  console.log(error);
  // handle error
})

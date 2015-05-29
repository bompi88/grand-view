# Grand View

[ABOUT GRANDVIEW HERE]

## Development
First clone the repo:
``` bash
$ git clone --recursive git@github.com:andybb/grand-view.git
```

### Desktop app
You have to install all node dependencies, so execute:
``` bash
$ npm install
```

After this, run the setup script to install some necessary prerequisites:
```bash
$ node ./script/setup.js
```

Then you can either run it in dev mode:
```bash
$ node ./script/run.js
```

or build for distribution:
```bash
$ node ./script/dist.js
```

### Regular Meteor app
As usual (inside the `meteor` folder) run:
``` bash
$ meteor
```


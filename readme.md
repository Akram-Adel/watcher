# Watcher
Watcher links a node package and a package user together using [Watchman](https://facebook.github.io/watchman/). a change in the linked package gets automatically copied to the node_module folder of the package user.

This is useful when symlinks don't work and you want to link changed files from the project you are working on to the node_modules of this project in a root project you specify.

## Install
First, you need to install [Watchman](https://facebook.github.io/watchman/docs/install.html) if you haven't done this already.

Watcher isn't hosted on the npm registry yet, so you have to clone the repo to a local folder
```sh
git clone https://github.com/Akram-Adel/watcher.git
cd watcher
npm i
```

Build the script then add it to your global packages
```sh
npx tsc
sudo npm i -g .
```

Now you are good to go. \
You can use the script from anywhere to link the `project` directory you are working on to the `node_module` of that project in the `root` directory like so:
```sh
# watcher --project=absolute/path/to/your/project --root=absolute/path/to/your/root
watcher --project=~/Documents/Login --root=~/Documents/Main
```

## Update
If you cloned this repo before and now want to update to the latest version, then all you need to do is to pull the latest changes to your cloned repo and update your global packages:
```sh
# With the terminal opened in your watcher clone
git pull origin main
npm run update
```

## Aliase configurations
It is tedious to have to specify the full path of the `project` or `root` you are working on every time you use the script. luckily, there is an `aliase` property you can add to the `configs.json` to keep a short *aliase* for the full path
```json
{
  "aliase": {
    "login": "/Users/akram-adel/Documents/Login",
    "main": "/Users/akram-adel/Documents/Main"
  }
}
```
Then you will need to update your package for changes to take effect
```sh
npm run update
```
Now you can run the script without specifying the full path, just use the aliase name instead:
```sh
watcher --project=login --root=main
```

## Default-Root configurations
In some cases, you might be working on multiple projects that a single `root` is using, in this case, you can use `defaultRoot` for this. Just add it to your config file and the script will default to it when you don't specify a `--root` input
```json
{
  "defaultRoot": "/Users/akram-adel/Documents/Main"
}
```
Then you will need to update your package for changes to take effect
```sh
npm run update
```
Now usage simply becomes:
```sh
watcher --project=login
```

## Links configurations
Sometimes you may be working on a `root` that has multiple `project`s linked to it. Instead of creating multiple instances of `Watcher` for every `project` to handle its changes, `links` are here to facilitate just that.
In your config file add `links` property with values as follows:
```json
{
  "links": {
      "my-link-name": {
        "root": "absolute/path/to/your/root",
        "projects": [
          "absolute/path/to/your/project1",
          "absolute/path/to/your/project2",
        ]
      }
    }
}
```
Then you will need to update your package for changes to take effect
```sh
npm run update
```
Finally, tell `Watcher` to run your link:
```sh
watcher --link=my-link-name
```
`Watcher` will issue a subscription for every `project` specified in `links.my-link-name.projects`, and every change done in any `project` will get automatically copied to the correct node_module folder of the `root`.

## Ignoring files
In some cases, you might be working in a file or directory and you don't want changes in those files to reflect in the root project. An example of that might be the `__Tests__` directory. \
`configs.json` accepts a `fileIgnorePattern` property of an array type of strings. Any changed file you are working on gets tested against these strings in the array using `RegExp(pattern).test()` to determine whether the file should be ignored or copied to the root project
```json
{
  "fileIgnorePattern": ["__Tests__"],
}
```
Then you will need to update your package for changes to take effect
```sh
npm run update
```

## Debugging
After running the script and linking the project you are working on with the root app, any changes you make in the project files that `watchman` detects will get printed in the terminal that is running the script, these changes will be printed in 4 different colors depending on the type of change you make: \
![#e5e510](https://via.placeholder.com/15/e5e510/000000?text=+) `Yellow:` indicating that the file you changed exists in the root project \
![#0dbc79](https://via.placeholder.com/15/0dbc79/000000?text=+) `Green:` indicating that the file you changed is new \
![#cd3131](https://via.placeholder.com/15/cd3131/000000?text=+) `Red:` indicating that you deleted a file which in turn removes that same file from the root folder \
![#bc3fbc](https://via.placeholder.com/15/bc3fbc/000000?text=+) `Purple:` indicating that your edited file matched one of the strings in the `fileIgnorePattern` so this effect will be ignored and won't reflect in the root project

## Contributing
### Before committing
- make sure `npx jest` passes and keep code coverage at 100%
- note that committing will trigger a `tsc` build and will update your package `sudo npm update -g .`
### Creating a pull request
- Please adhere to the style and formatting of the code
- Write tests for new functionality
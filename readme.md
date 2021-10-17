# Watcher
Watcher links two directories together using [Watchman](https://facebook.github.io/watchman/). a change in the first directory gets copied to the second directory \
This is a custom script for a project I'm working on with plans to make it more of a general solution

## Install
First, you need to install [Watchman](https://facebook.github.io/watchman/docs/install.html) if you haven't done this already. \
Watcher isn't hosted on the npm registry yet, so you have to clone the repo to a local folder
```sh
git clone https://github.com/Akram-Adel/watcher.git
cd watcher
npm i
```

Open the `configs.json` file in your favorite editor and change the `root` to point to the `node_modules` folder of your root project like so:
```json
{
  "root": "/Users/akram-adel/Documents/YOUR-ROOT-PROJECT/node_modules/SUB-NAME-IF-NEEDED",
}
```
**Note:** *If your project folder name is different than it's package name (e.g. folder name is `Login` and package name is `Project-Login`), then a `SUB-NAME` of `Project-` has to be added to the `root` configuration for the script to work properly. The script appends the project name (e.g. `Login`) to the end of the `root` string you provided. \
In the future, we will change the script to read the project name directly from the `package.json` file to avoid this hassle*

Build the script then add it to your global packages
```sh
npx tsc
sudo npm i -g .
```

Now you are good to go. \
You can use the script from anywhere to link the project you are working on to the `node_module` of that project in the `root` app directory like so:
```sh
# watcher absolute/path/of/your/project, e.g.
watcher ~/Documents/Project-Login
```

## Project configurations
It is tedious to have to specify the full path of the project you are working on every time you use the script. luckily, there is a property you can add to the `configs.json` that will make it a little bit easier, that is the `project` property. \
If you have all the repos in the same location like so:
```
|- Documents
  |- Project-Main
  |- Project-OnBoarding
  |- Project-Login
  |- ...
```
Then you can specify a `project` property in the `configs.json` that points to the location of the repos minus the project name like so:
```json
{
  "project": "/Users/akram-adel/Documents/Project-",
}
```
Now you can use the script without specifying the full path of the project, you just have to give a `--project` flag and the name of the project you are working on and the script will take care of the rest. \
*Under the hood, the script takes the name of the project you provided and appends it to the `project` string. So you can put any value you want in the `project` configuration as long as it will correctly resolve to your project*
```sh
# watcher --project=nameOfTheProject
watcher --project=login
```
**Note:** *In the future, we will change the script to include name aliases of all the projects of interest so that you are not limited to having the repos in the same directory*

## Ignoring files
In some cases, you might be working in a file or directory and you don't want changes in those files to reflect in the root project. An example of that might be the `__Tests__` directory. \
`configs.json` accepts a `fileIgnorePattern` property of type array of strings. Any changed file you are working on gets tested against these strings in the array using `RegExp(pattern).test()` to determine whether the file should be ignored or copied to the root project
```json
{
  "fileIgnorePattern": ["__Tests__"],
}
```

## Debugging
After running the script and linking the project you are working on with the root app, any changes you make in the project files that `watchman` detects will get printed in the terminal that is running the script, these changes will be printed in 4 different colors depending on the type of change you make: \
![#e5e510](https://via.placeholder.com/15/e5e510/000000?text=+) `Yellow:` indicating that the file you changed exists in the root project \
![#0dbc79](https://via.placeholder.com/15/0dbc79/000000?text=+) `Green:` indicating that the file you changed is a new file \
![#cd3131](https://via.placeholder.com/15/cd3131/000000?text=+) `Red:` indicating that you deleted a file which in turn removes that same file from the root folder \
![#bc3fbc](https://via.placeholder.com/15/bc3fbc/000000?text=+) `Purple:` indicating that your edited file matched one of the strings in the `fileIgnorePattern` so this effect will be ignored and won't reflect in the root project

## Contributing
### Before committing
- make sure `npx jest` passes and keep code coverage at 100%
- note that committing will trigger a `tsc` build and will update your package `sudo npm update -g .`
### Creating a pull request
- Please adhere to the style and formatting of the code
- Write tests for new functionality

## TODO
- [x] Read projectName from project's package.json file
- [ ] Replace `root` and `project` with an `aliase` object
- [ ] Change usage to `watcher --project=<projectName> --root=<rootName>` with `defaultRoot` accepted in the config file
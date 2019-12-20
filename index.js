const path = require('path');
const {
    getConfigHome
} = require('platform-folders');
const fs = require('fs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const Connection = require('mongodb-connection-model/lib/model');
const shell = require('./lib/shell');

const COMPASS = {
    STABLE_FOLDER: 'MongoDB Compass',
    BETA_FOLDER: 'MongoDB Compass Beta',
    DEV_FOLDER: 'MongoDB Compass Dev'
};
const COMPASS_CONNECTIONS_FOLDER = 'Connections';

const compassConfigPath = path.join(getConfigHome(), COMPASS.STABLE_FOLDER);
const connectionsPath = path.join(compassConfigPath, COMPASS_CONNECTIONS_FOLDER);

const STAR = process.platform === 'win32' ? '!' : '★';
const COLOR_BAR = process.platform === 'win32' ? '|' : '🁢';

const shellOnClose = () => console.log(`Bye bye ${chalk.yellow.bold(STAR)}`);

async function checkFolders() {
    try {
        await fs.promises.access(compassConfigPath);
        await fs.promises.access(connectionsPath);
        return true;
    } catch (e) {
        return false;
    }
}

async function loadFavs(connectionsPath) {
    const favs = [];
    const dir = await fs.promises.opendir(connectionsPath);
    for await (const file of dir) {
        const connectionFilePath = path.join(connectionsPath, file.name);
        const fileContent = await fs.promises.readFile(connectionFilePath, 'utf8');
        const parsedFileContent = JSON.parse(fileContent);
        if (parsedFileContent.isFavorite) {
            favs.push(parsedFileContent);
        }
    }
    return favs;
}

async function go() {
    if (process.argv.length > 2) {
        //If some arguments are passed in, just hand over to
        //the shell as the user is probably not looking for
        //favorites this time
        return shell.startShellWithArgs(process.argv.slice(2), shellOnClose);
    }
    
    if (!await checkFolders()) {
        console.log(chalk.yellow.bold('MongoDB Compass is not installed or the version installed is outdated.'));
        console.log(`To manage your favorites and share them with the shell, please install the most recent`);
        console.log(`version of Compass from ${chalk.blue('https://www.mongodb.com/download-center/compass')}`);
        return;
    }

    const favs = await loadFavs(connectionsPath).catch(console.error);
    const {
        fav
    } = await inquirer
        .prompt([{
            type: 'list',
            name: 'fav',
            message: 'What do you want to connect to?',
            choices: favs.map(fav => {
                const name = fav.color ?
                    `${chalk.hex(fav.color).bold(COLOR_BAR)} ${fav.name}` :
                    `${chalk.hidden(COLOR_BAR)} ${fav.name}`;
                return {
                    name,
                    value: fav
                };
            })
        }]);
    const conn = new Connection(fav);
    const uri = conn.driverUrl.replace(/undefined/i, '');
    shell.startShellForFav(fav.name, uri, shellOnClose);
}

module.exports = go;
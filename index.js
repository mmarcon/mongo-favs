//Monkey-patching console.log to
//avoid warning printed out by
//mongodb-connection-model when
//it looks for electron
console._log = console.log;
console.log = () => {};

const path = require('path');
const {
    getConfigHome
} = require('platform-folders');
const fs = require('fs');
const chalk = require('chalk');
const {
    spawn
} = require('child_process');
const inquirer = require('inquirer');
const Connection = require('mongodb-connection-model');

const COMPASS = {
    STABLE_FOLDER: 'MongoDB Compass',
    BETA_FOLDER: 'MongoDB Compass Beta',
    DEV_FOLDER: 'MongoDB Compass Dev'
};
const COMPASS_CONNECTIONS_FOLDER = 'Connections';
const SHELL = 'mongo';

const compassConfigPath = path.join(getConfigHome(), COMPASS.DEV_FOLDER);
const connectionsPath = path.join(compassConfigPath, COMPASS_CONNECTIONS_FOLDER);

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

function startShellForFav(name, uri) {
    const shell = spawn(SHELL, [uri], {
        stdio: 'inherit'
    });
    shell.on('close', (code) => {
        console._log(`Bye bye ${chalk.yellow.bold('★')}`);
    });
}

function startShellWithArgs(args) {
    const shell = spawn(SHELL, args, {
        stdio: 'inherit'
    });
    shell.on('close', (code) => {
        console._log(`Bye bye ${chalk.yellow.bold('★')}`);
    });
}

async function go() {
    if (process.argv.length > 2) {
        //If some arguments are passed in, just hand over to
        //the shell as the user is probably not looking for
        //favorites this time
        return startShellWithArgs(process.argv.slice(2));
    }
    
    if (!await checkFolders()) {
        console._log(chalk.yellow.bold('MongoDB Compass is not installed or the version installed is outdated.'));
        console._log(`To manage your favorites and share them with ${'`' + SHELL + '`'} please install the most recent`);
        console._log(`version of Compass from ${chalk.blue('https://www.mongodb.com/download-center/compass')}`);
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
                    `${chalk.hex(fav.color).bold('🁢')} ${fav.name}` :
                    `${chalk.hidden('🁢')} ${fav.name}`;
                return {
                    name,
                    value: fav
                };
            })
        }]);
    const conn = new Connection(fav);
    const uri = conn.driverUrl.replace(/undefined/i, '');
    startShellForFav(fav.name, uri);
}

module.exports = go;
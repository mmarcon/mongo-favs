const {
    spawn
} = require('child_process');

const SHELL = 'mongo';

function startShellForFav(name, uri, onClose) {
    const shell = spawn(SHELL, [uri], {
        stdio: 'inherit'
    });
    shell.on('close', onClose);
}

function startShellWithArgs(args, onClose) {
    const shell = spawn(SHELL, args, {
        stdio: 'inherit'
    });
    shell.on('close', onClose);
}

module.exports = {
    startShellForFav,
    startShellWithArgs
};
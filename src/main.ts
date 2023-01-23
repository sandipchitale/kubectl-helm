"use strict";

import minimist from 'minimist';
import * as path from 'path'
import * as fs from 'fs'
import * as child_process from 'child_process';

// console.debug(process.argv);
let rest = process.argv.slice(2);
// console.debug(rest);
let optsAndCommands = minimist(rest);
// console.debug(JSON.stringify(optsAndCommands, null, '  '));

if (optsAndCommands._.length === 3
    && optsAndCommands._[0] === 'get'
    && optsAndCommands._[1] === 'templates'
) {
    console.log(`Will run custom ${['helm', ...rest].join(' ')}`);
} else {
    child_process.execSync(`${['helm', ...rest].join(' ')}`, {
        stdio: 'inherit'

    });
}
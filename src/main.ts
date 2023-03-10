"use strict";

import minimist from 'minimist';
import * as path from 'path'
import * as fs from 'fs'
import * as zlib from 'zlib';
import * as child_process from 'child_process';


(async () => {
    let rest = process.argv.slice(2);
    let optsAndCommands = minimist(rest);
    if (optsAndCommands._.length === 3
        && optsAndCommands._[0] === 'get'
        && optsAndCommands._[1] === 'templates') {

        const namespace = optsAndCommands.namespace;

        const releaseName = optsAndCommands._[2];

        // revsion not specified, get the latest revision
        let revision = optsAndCommands.revision; // start with default
        if (!revision) {
            const helmList = child_process.execSync(`helm list ${namespace ? `-n ${namespace}` : ''} -o json`, {
                encoding: 'utf8'
            });
            try {
                const helmListJSON = JSON.parse(helmList) as any[];
                helmListJSON.forEach((release: any) => {
                    if (release.name === releaseName) {
                        revision = release.revision;
                    }
                });
                // use default revision 1
            } catch (e) {
                // use default revision 1
            }
        }

        const secretName = `sh.helm.release.v1.${releaseName}.v${revision}`;
        try {
            const secretBuffer = child_process.execSync(`kubectl get secret ${secretName} -o go-template="{{.data.release | base64decode }}" ${namespace ? `-n ${namespace}` : ''}`, {
                encoding: 'utf8'
            });
            if (secretBuffer) {
                zlib.gunzip(Buffer.from(secretBuffer, 'base64'), async (e, inflated) => {
                    if (e) {
                        console.error(e);
                        return;
                    } else {
                        try {
                            let templates = '';
                            const helmGetAllJSON: any = JSON.parse(inflated.toString('utf8'));
                            helmGetAllJSON.chart.templates.forEach((template: any) => {
                                const templateString = Buffer.from(template.data, 'base64').toString('utf-8');
                                templates += `\n---\n# Template: ${template.name}\n${templateString}`;
                                template.data = templateString;
                            });
                            templates = templates.split('\\n').join('\n');
                            console.log(`# Templates for release: ${releaseName} revision: ${revision} ${namespace ? ` in namespace ${namespace}` : ' in current namespace'}\n${templates}`);
                        } catch (e) {
                        }
                    }
                });
            } else {
                console.error(`Could not find secret ${secretName}`);
                return;
            }
        } catch (e) {
            console.error(e);
            return;
        }
    } else {
        const getTemplatesUsage = `The Kubernetes package manager custome commands:\n\nget templates RELEASE_NAME [--revision REVISION] [--namespace NAMESPACE]]\n`;
        if ((optsAndCommands._.length === 0)) { // no argumenst at all, show help for custom command
            console.info(getTemplatesUsage);
            child_process.execSync(`${['helm', ...rest].join(' ')}`, {
                stdio: 'inherit'
            });
        } else if (optsAndCommands._.length === 2 && optsAndCommands._[0] === 'get' && optsAndCommands._[1] === 'templates') {
            console.info(getTemplatesUsage);
        }
    }
})();

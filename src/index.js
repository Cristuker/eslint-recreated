#!/usr/bin/env node
import { parseArgs } from 'node:util';
import chalk from 'chalk';
import fs from 'node:fs';
import * as espree from 'espree';
import Reporter from './reporter.js';
import path from 'node:path';
import SyntaxTreeProcessor from './syntaxTreeProcessor.js';

function getFilePathFromCLI() {
    try {
        const { values: { file } } = parseArgs({
            options: {
                file: {
                    type: 'string',
                    alias: 'f'
                }
            }
        });
        if (!file) throw new Error();

        return file;
    } catch (error) {
        console.error(chalk.red('Error: Please provida a valid file path as an argument using -f or --file'))
        process.exit(1);
    }

}

const filePath = getFilePathFromCLI();
const code = fs.readFileSync(filePath, 'utf-8');
const outputFilePath = path.join(process.cwd(), `${path.basename(filePath, '.js')}.linted.js`);
const ast = espree.parse(code, { ecmaVersion: 2020, loc: true, sourceType: 'module' });
const syntaxTreeProcessor = new SyntaxTreeProcessor(filePath);
const errors = syntaxTreeProcessor.process(ast)
Reporter.report({
    errors,
    ast,
    outputFilePath
})
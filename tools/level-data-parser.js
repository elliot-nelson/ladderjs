'use strict';

const fs = require('fs');
const glob = require('glob');
const util = require('util');

const LevelDataParser = {
    parse(levelDirectory, outputFile) {
        let levels = this.readLevels(levelDirectory);
        this.writeOutputFile(levels, outputFile);
    },

    writeOutputFile(levels, outputFile) {
        let lines = fs.readFileSync(outputFile, 'utf8').split('\n');
        let prefix = lines.findIndex(value => value.match(/<generated>/));
        let suffix = lines.findIndex(value => value.match(/<\/generated>/));

        let generated = util.inspect(levels, { compact: true, maxArrayLength: Infinity, depth: Infinity });
        generated = lines.slice(0, prefix + 1).join('\n') + '\n' + generated + '\n' + lines.slice(suffix).join('\n');

        fs.writeFileSync(outputFile, generated, 'utf8');
    },

    readLevels(directory) {
        let files = glob.sync(directory);
        return files.map(file => this.readLevel(file));
    },

    readLevel(file) {
        let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
        let level = {};
        let inLayout = false;

        for (let line of lines) {
            if (inLayout) {
                level.layout.push(line);
            } else {
                let match = line.match(/(.+?): *(.*)/);
                if (!match) throw new Error(`${file} Unexpected line: ${line}`);
                let [key, value] = match.slice(1);
                if (key === 'Name') {
                    level.name = value;
                } else if (key === 'Time') {
                    level.time = parseInt(value, 10);
                } else if (key === 'Rocks') {
                    level.rocks = parseInt(value, 10);
                } else if (key === 'Layout') {
                    level.layout = [];
                    inLayout = true;
                } else {
                    throw new Error(`${file} Unexpected key ${key}, expected one of: Name, Time, Rocks, Layout`);
                }
            }
        }

        if (!level.name) throw new Error(`${file} Missing key: Name`);
        if (!level.time) throw new Error(`${file} Missing key: Time`);
        if (!level.rocks) throw new Error(`${file} Missing key: Rocks`);
        if (!level.layout) throw new Error(`${file} Missing key: Layout`);

        return level;
    }
};

module.exports = LevelDataParser;

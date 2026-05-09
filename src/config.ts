import * as core from '@actions/core';

export interface Config {
  server: string;
  username: string;
  password: string;
  localDir: string;
  serverDir: string;
  exclude: string[];
  dryRun: boolean;
  deleteRemoved: boolean;
}

export function getConfig(): Config {
  const exclude = core.getInput('exclude')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return {
    server:        core.getInput('server', { required: true }),
    username:      core.getInput('username', { required: true }),
    password:      core.getInput('password', { required: true }),
    localDir:      core.getInput('local-dir') || './',
    serverDir:     core.getInput('server-dir') || './',
    exclude,
    dryRun:        core.getInput('dry-run') === 'true',
    deleteRemoved: core.getInput('delete') === 'true',
  };
}
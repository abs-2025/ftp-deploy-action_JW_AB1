import * as fs from 'fs';
import * as path from 'path';

export interface FileState {
  [filePath: string]: string;
}

export const STATE_FILE = '.deploy-state.json';

export function loadLocalState(localDir: string): FileState {
  const statePath = path.join(localDir, STATE_FILE);
  if (!fs.existsSync(statePath)) {
    return {};
  }
  const content = fs.readFileSync(statePath, 'utf-8');
  return JSON.parse(content);
}

export function saveLocalState(localDir: string, state: FileState): void {
  const statePath = path.join(localDir, STATE_FILE);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}
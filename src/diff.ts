import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { glob } from 'glob';
import { minimatch } from 'minimatch';
import { FileState } from './state';

export interface DiffResult {
  toUpload: string[];
  toDelete: string[];
  unchanged: string[];
}

export function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

export async function getLocalFiles(
  localDir: string,
  exclude: string[]
): Promise<FileState> {
  const files = await glob('**/*', {
    cwd: localDir,
    nodir: true,
    dot: true,
  });

  const result: FileState = {};

  for (const file of files) {
    const shouldExclude = exclude.some(pattern =>
      minimatch(file, pattern, { dot: true })
    );

    if (!shouldExclude) {
      const fullPath = path.join(localDir, file);
      result[file] = hashFile(fullPath);
    }
  }

  return result;
}

export function diffFiles(
  localFiles: FileState,
  serverState: FileState
): DiffResult {
  const toUpload: string[] = [];
  const toDelete: string[] = [];
  const unchanged: string[] = [];

  for (const [file, hash] of Object.entries(localFiles)) {
    if (serverState[file] !== hash) {
      toUpload.push(file);
    } else {
      unchanged.push(file);
    }
  }

  for (const file of Object.keys(serverState)) {
    if (!localFiles[file]) {
      toDelete.push(file);
    }
  }

  return { toUpload, toDelete, unchanged };
}



import * as ftp from 'basic-ftp';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from './logger';
import { Config } from './config';

export async function createFtpClient(config: Config): Promise<ftp.Client> {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  await client.access({
    host: config.server,
    user: config.username,
    password: config.password,
    secure: false,
  });

  logger.info(`Connected to ${config.server}`);
  return client;
}

export async function uploadFiles(
  client: ftp.Client,
  files: string[],
  localDir: string,
  serverDir: string,
  dryRun: boolean
): Promise<void> {
  for (const file of files) {
    const localPath = path.join(localDir, file);
    const serverPath = path.join(serverDir, file);
    const serverFolder = path.dirname(serverPath);

    if (dryRun) {
      logger.info(`[DRY RUN] Would upload: ${file}`);
      continue;
    }

    await client.ensureDir(serverFolder);
    await client.uploadFrom(localPath, serverPath);
    logger.success(`Uploaded: ${file}`);
  }
}

export async function deleteFiles(
  client: ftp.Client,
  files: string[],
  serverDir: string,
  dryRun: boolean
): Promise<void> {
  for (const file of files) {
    const serverPath = path.join(serverDir, file);

    if (dryRun) {
      logger.info(`[DRY RUN] Would delete: ${file}`);
      continue;
    }

    await client.remove(serverPath);
    logger.delete(`Deleted: ${file}`);
  }
}
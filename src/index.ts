import { getConfig } from './config';
import { logger } from './logger';
import { getLocalFiles, diffFiles } from './diff';
import { loadLocalState, saveLocalState, STATE_FILE } from './state';
import { createFtpClient, uploadFiles, deleteFiles } from './ftp';

async function run(): Promise<void> {
  const config = getConfig();

  logger.info(`Starting FTP deploy to ${config.server}`);
  logger.info(`Local dir: ${config.localDir}`);
  logger.info(`Server dir: ${config.serverDir}`);

  if (config.dryRun) {
    logger.warn('DRY RUN mode — no files will be uploaded');
  }

  const localFiles = await getLocalFiles(config.localDir, config.exclude);
  const serverState = loadLocalState(config.localDir);
  const diff = diffFiles(localFiles, serverState);

  logger.info(`Files to upload:  ${diff.toUpload.length}`);
  logger.info(`Files to delete:  ${diff.toDelete.length}`);
  logger.info(`Files unchanged:  ${diff.unchanged.length}`);

  if (diff.toUpload.length === 0 && diff.toDelete.length === 0) {
    logger.info('Nothing to deploy — everything is up to date!');
    return;
  }

  const client = await createFtpClient(config);

  try {
    await uploadFiles(client, diff.toUpload, config.localDir, config.serverDir, config.dryRun);

    if (config.deleteRemoved) {
      await deleteFiles(client, diff.toDelete, config.serverDir, config.dryRun);
    }

    if (!config.dryRun) {
      saveLocalState(config.localDir, localFiles);
      logger.success('State file updated');
    }

    logger.success('Deploy complete!');
  } catch (error) {
    logger.error(`Deploy failed: ${error}`);
    process.exit(1);
  } finally {
    client.close();
  }
}

run();
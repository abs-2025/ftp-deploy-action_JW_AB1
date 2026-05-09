"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const logger_1 = require("./logger");
const diff_1 = require("./diff");
const state_1 = require("./state");
const ftp_1 = require("./ftp");
async function run() {
    const config = (0, config_1.getConfig)();
    logger_1.logger.info(`Starting FTP deploy to ${config.server}`);
    logger_1.logger.info(`Local dir: ${config.localDir}`);
    logger_1.logger.info(`Server dir: ${config.serverDir}`);
    if (config.dryRun) {
        logger_1.logger.warn('DRY RUN mode — no files will be uploaded');
    }
    const localFiles = await (0, diff_1.getLocalFiles)(config.localDir, config.exclude);
    const serverState = (0, state_1.loadLocalState)(config.localDir);
    const diff = (0, diff_1.diffFiles)(localFiles, serverState);
    logger_1.logger.info(`Files to upload:  ${diff.toUpload.length}`);
    logger_1.logger.info(`Files to delete:  ${diff.toDelete.length}`);
    logger_1.logger.info(`Files unchanged:  ${diff.unchanged.length}`);
    if (diff.toUpload.length === 0 && diff.toDelete.length === 0) {
        logger_1.logger.info('Nothing to deploy — everything is up to date!');
        return;
    }
    const client = await (0, ftp_1.createFtpClient)(config);
    try {
        await (0, ftp_1.uploadFiles)(client, diff.toUpload, config.localDir, config.serverDir, config.dryRun);
        if (config.deleteRemoved) {
            await (0, ftp_1.deleteFiles)(client, diff.toDelete, config.serverDir, config.dryRun);
        }
        if (!config.dryRun) {
            (0, state_1.saveLocalState)(config.localDir, localFiles);
            logger_1.logger.success('State file updated');
        }
        logger_1.logger.success('Deploy complete!');
    }
    catch (error) {
        logger_1.logger.error(`Deploy failed: ${error}`);
        process.exit(1);
    }
    finally {
        client.close();
    }
}
run();

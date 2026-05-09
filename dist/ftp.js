"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFtpClient = createFtpClient;
exports.uploadFiles = uploadFiles;
exports.deleteFiles = deleteFiles;
const ftp = __importStar(require("basic-ftp"));
const path = __importStar(require("path"));
const logger_1 = require("./logger");
async function createFtpClient(config) {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    await client.access({
        host: config.server,
        user: config.username,
        password: config.password,
        secure: false,
    });
    logger_1.logger.info(`Connected to ${config.server}`);
    return client;
}
async function uploadFiles(client, files, localDir, serverDir, dryRun) {
    for (const file of files) {
        const localPath = path.join(localDir, file);
        const serverPath = path.join(serverDir, file);
        const serverFolder = path.dirname(serverPath);
        if (dryRun) {
            logger_1.logger.info(`[DRY RUN] Would upload: ${file}`);
            continue;
        }
        await client.ensureDir(serverFolder);
        await client.uploadFrom(localPath, serverPath);
        logger_1.logger.success(`Uploaded: ${file}`);
    }
}
async function deleteFiles(client, files, serverDir, dryRun) {
    for (const file of files) {
        const serverPath = path.join(serverDir, file);
        if (dryRun) {
            logger_1.logger.info(`[DRY RUN] Would delete: ${file}`);
            continue;
        }
        await client.remove(serverPath);
        logger_1.logger.delete(`Deleted: ${file}`);
    }
}

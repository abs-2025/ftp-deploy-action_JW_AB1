import * as core from '@actions/core';

export const logger = {
  info:    (msg: string) => core.info(`ℹ️  ${msg}`),
  success: (msg: string) => core.info(`✅  ${msg}`),
  skip:    (msg: string) => core.info(`⏭️  ${msg}`),
  delete:  (msg: string) => core.info(`🗑️  ${msg}`),
  error:   (msg: string) => core.error(`❌  ${msg}`),
  warn:    (msg: string) => core.warning(`⚠️  ${msg}`),
};
import fs from 'fs';
import { promisify } from 'util';

export const writeFile = promisify(fs.writeFile);
export const readFile = promisify(fs.readFile);
export const mkdir = promisify(fs.mkdir);

const fstat = (filepath: string) => {
  try {
    return fs.statSync(filepath);
  } catch (e) {
    return null;
  }
};

export const fileExists = (filepath: string): boolean =>
  fstat(filepath)?.isFile() ?? false;

export const directoryExists = (filepath: string): boolean =>
  fstat(filepath)?.isDirectory() ?? false;

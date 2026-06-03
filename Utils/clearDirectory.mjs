import fs from "fs";
import path from "path";

/**
 * Deletes all files in a folder or files matching a prefix.
 * @param {string} folderPath - Relative path to folder
 * @param {string|null} filePrefix - Optional prefix for files to delete
 */
const clearFolder = async (folderPath, filePrefix = null) => {
  try {
    const fullPath = path.join(process.cwd(), folderPath); // <-- project root

    if (!fs.existsSync(fullPath)) {
      console.log(`${fullPath} does not exist. Creating it.`);
      fs.mkdirSync(fullPath, { recursive: true });
      return;
    }

    const files = fs.readdirSync(fullPath);

    files.forEach((file) => {
      if (!filePrefix || file.startsWith(filePrefix)) {
        const filePath = path.join(fullPath, file);
        if (fs.lstatSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
          console.log(`${filePath} ==> File Deleted`);
        }
      }
    });

    console.log(`${fullPath} ==> Cleanup complete!`);
  } catch (err) {
    console.error(`Error clearing folder ${folderPath}:`, err);
  }
};

clearFolder("Screenshots");
clearFolder("Data", "test-doc-");
clearFolder("Data/Download");
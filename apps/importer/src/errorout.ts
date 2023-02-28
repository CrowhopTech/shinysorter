import * as fs from 'fs';
import * as path from 'path';

export const errorsFile = "import_errors.txt";

var importErrors = new Map<string, string>();

function writeErrors(baseDir: string) {
    var output = "";
    importErrors.forEach((err: string, file: string) => {
        if (err == "") {
            return;
        }
        const absolutePath = path.join(baseDir, file);
        console.debug(`Checking if path '${absolutePath}' still exists for errors`);
        const exists = fs.existsSync(absolutePath);
        if (!exists) {
            console.debug(`File ${absolutePath} did not exist, clearing errors`);
            importErrors.delete(file);
            return;
        }

        output += `${file}: ${err}\n`;
    });
    fs.writeFileSync(path.join(baseDir, errorsFile), output, {
        mode: 0o644
    });
}

function setErrorForFile(filename: string, fileErr: string): boolean {
    const previousValue = importErrors.has(filename) ? importErrors.get(filename) : "";
    importErrors.set(filename, fileErr);
    return fileErr != previousValue;
}

function clearErrorForFile(filename: string): boolean {
    return importErrors.delete(filename);
}

export function setErrorForFileAndWrite(baseDir: string, filename: string, fileErr: string) {
    if (setErrorForFile(filename, fileErr)) {
        // Don't always write for a set, check if something changed first
        writeErrors(baseDir);
    }
}

export function clearErrorForFileAndWrite(baseDir: string, filename: string) {
    clearErrorForFile(filename);
    writeErrors(baseDir); // Always write on a clear, this isn't too expensive
}

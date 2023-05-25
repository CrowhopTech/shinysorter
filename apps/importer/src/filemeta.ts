import md5File from "md5-file";
import { fileTypeFromFile } from 'file-type';
import { AllFuzzyHashes } from "./imagehasher";

export type FileMetadata = {
    md5sum: string;
    mimeType: string;

    ahash?: string;
    phash?: string;
    dhash?: string;
};
export async function getFileMetadata(path: string): Promise<FileMetadata> {
    return new Promise<FileMetadata>(async (resolve, reject) => {
        const getMimeType = async () => {
            const fileType = await fileTypeFromFile(path);
            if (!fileType) {
                return "";
            }
            return fileType.mime;
        };

        let mimeType: string;
        try {
            mimeType = await getMimeType();
        } catch (e) {
            reject(e);
            return;
        }

        let md5sum: string;

        try {
            md5sum = await md5File(path);
        } catch (e) {
            reject(e);
            return;
        }

        let ahash: string | undefined, dhash: string | undefined, phash: string | undefined;
        try {
            let hashes = await AllFuzzyHashes(path, mimeType != undefined && mimeType.startsWith("video"));
            ahash = hashes.aHash;
            dhash = hashes.dHash;
            phash = hashes.pHash;
        } catch (e) {
            reject(e);
            return;
        }

        resolve({ md5sum, mimeType, ahash, dhash, phash });
    });
}
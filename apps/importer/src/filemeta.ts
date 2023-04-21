import md5File from "md5-file";
import { fileTypeFromFile } from 'file-type';
import { Magic, MAGIC_MIME_ENCODING, MAGIC_MIME_TYPE } from "mmmagic";

export type FileMetadata = { md5sum: string, mimeType: string; };
export async function getFileMetadata(path: string): Promise<FileMetadata> {
    console.log("Starting getFileMetadata for " + path);
    return new Promise<FileMetadata>(async (resolve, reject) => {
        const magic = new Magic(MAGIC_MIME_TYPE | MAGIC_MIME_ENCODING);
        console.log("Created magic");
        // const getMimeType = () => new Promise<string>((resolveInner, rejectInner) => {
        //     console.log("Starting mimeType promise");
        //     magic.detectFile(path, (err, result) => {
        //         console.log("detectFile callback");
        //         if (err) {
        //             rejectInner(`Failed to get MIME type for file '${path}': ${err}`);
        //             return;
        //         }
        //         if (result as string) {
        //             resolveInner(result as string);
        //             return;
        //         }
        //         resolveInner('unknown');
        //     });
        // });
        const getMimeType = async () => {
            const fileType = await fileTypeFromFile(path);
            if (!fileType) {
                return "";
            }
            return fileType.mime;
        };
        console.log("Created mimeType promise");

        let mimeType: string;
        try {
            mimeType = await getMimeType();
        } catch (e) {
            reject(e);
            return;
        }

        console.log("Got mimeType result");

        let md5sum: string;

        try {
            md5sum = await md5File(path);
        } catch (e) {
            reject(e);
            return;
        }

        // Promise.all([
        //     md5File(path),
        //     getMimeType()
        // ]).then(([md5sum, mimeType]) => {
        console.log("Got md5sum and mimeType promises");
        resolve({ md5sum, mimeType });
        // }).catch(reject);
    });
}
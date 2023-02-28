import md5File from "md5-file";
import { Magic, MAGIC_MIME_ENCODING, MAGIC_MIME_TYPE } from "mmmagic";

export type FileMetadata = { md5sum: string, mimeType: string; };
export async function getFileMetadata(path: string): Promise<FileMetadata> {
    return new Promise<FileMetadata>((resolve, reject) => {
        const magic = new Magic(MAGIC_MIME_TYPE | MAGIC_MIME_ENCODING);
        const mimeType = () => new Promise<string>((resolveInner, rejectInner) => {
            magic.detectFile(path, (err, result) => {
                if (err) {
                    rejectInner(`Failed to get MIME type for file '${path}': ${err}`);
                    return;
                }
                if (result as string) {
                    resolveInner(result as string);
                    return;
                }
                resolveInner('unknown');
            });
        });
        Promise.all([
            md5File(path),
            mimeType()
        ]).then(([md5sum, mimeType]) => {
            resolve({ md5sum, mimeType });
        }).catch(reject);
    });
}
import { execSync } from 'child_process';
import { rm, readFileSync } from 'fs';
import { basename } from 'path';
import { transform } from './dct';
import { Database } from './schema';

type FileEntry = Database['public']['Tables']['files']['Row'];
type FilePatch = Database['public']['Tables']['files']['Update'];
type FileCreate = Database['public']['Tables']['files']['Insert'];

export type Pixel = { r: number, g: number, b: number, a: number; };

function baseFfmpegCommand(inputPath: string, isVideo: boolean): string[] {
    // -i: Input file (can be either an image or a video. If video, specify the starting frame)
    // -ss: Seek to the specified time (in seconds) in the input file
    // -vframes: Number of frames to extract
    // -pix_fmt: The format to dump pixels in
    const args = ["ffmpeg", "-y", "-i", `'${inputPath}'`, "-vframes", "1", "-pix_fmt", "rgba"];
    if (isVideo) {
        // TODO: what's a better way to fuzzy hash videos?
        args.push("-ss", "00:00:00");
    }
    return args;
}

function generateFfmpegCommand(inputPath: string, isVideo: boolean, outputPath: string, otherArgs: string[] = []): string {
    const args = baseFfmpegCommand(inputPath, isVideo);
    args.push(...otherArgs);
    args.push(`'${outputPath}'`);
    return args.join(" ");
}

function getFileContents(imagePath: string, isVideo: boolean, ffmpegExtraArgs: string[] = []): Promise<Pixel[]> {
    return new Promise<Pixel[]>(async (resolve, reject) => {
        const pixels: Pixel[] = [];
        const contentDumpFile = `/tmp/${basename(imagePath)}-contents.rgb`;
        let readDumpFileContents: Buffer;
        try {
            // Dump the contents of the file to a temporary file
            execSync(generateFfmpegCommand(imagePath, isVideo, contentDumpFile, ffmpegExtraArgs));

            // Read the output of the file
            readDumpFileContents = readFileSync(contentDumpFile);
        } finally {
            // Clean up the temporary file, no matter what (finally), and even if the file does not exist (force)
            rm(contentDumpFile, { force: true }, reject);
        }

        // Parse the file to Pixel data
        for (let i = 0; i < readDumpFileContents.length; i += 4) {
            const chunk = readDumpFileContents.subarray(i, i + 4);
            pixels.push({
                r: chunk[0],
                g: chunk[1],
                b: chunk[2],
                a: chunk[3],
            });
        }
        resolve(pixels);
    });
}

function getGrayscaleFileContents(imagePath: string, isVideo: boolean, width: number, height: number, otherArgs: string[] = []): Promise<{ grayscaleContents: number[], average: number; }> {
    return new Promise<{ grayscaleContents: number[], average: number; }>(async (resolve, reject) => {
        const imgPixels = await getFileContents(imagePath, isVideo, ["-vf", `scale=${width}:${height},hue=s=0`, ...otherArgs]);
        let imageData: number[] = [];
        let imageAvg: number = 0;
        for (let i = 0; i < imgPixels.length; i++) {
            const pixAvg = (imgPixels[i].r + imgPixels[i].g + imgPixels[i].b) / 3;
            imageData.push(pixAvg);
            imageAvg += pixAvg;
        }
        imageAvg /= imgPixels.length;

        if (imgPixels.length !== width * height) {
            reject(`Image is not ${width}x${height} pixels`);
        }
        resolve({ grayscaleContents: imageData, average: imageAvg });
    });
}

export type FuzzyHashFunction = (filePath: string, isVideo: boolean) => Promise<string>;

export const AHash: FuzzyHashFunction = async (filePath: string, isVideo: boolean) => new Promise<string>(async (resolve, reject) => {
    const { grayscaleContents, average: totalAvg } = await getGrayscaleFileContents(filePath, isVideo, 8, 8);
    const bitString = grayscaleContents.map((pix) => pix > totalAvg ? "1" : "0").join("");
    resolve(parseInt(bitString, 2).  // Parses the bitstring into a binary number
        toString(16).                // Converts to hex
        padStart(16, "0"));          // Ensure it's of a constant length (if the first character(s) are 0, they are dropped)
});

export const DHash: FuzzyHashFunction = async (filePath: string, isVideo: boolean) => new Promise<string>(async (resolve, reject) => {
    const { grayscaleContents } = await getGrayscaleFileContents(filePath, isVideo, 9, 8);

    let returnData: string[] = [];
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const idx = x * 9 + y;
            if (grayscaleContents[idx] < grayscaleContents[idx + 1]) {
                returnData.push("1");
            } else {
                returnData.push("0");
            }
        }
    }

    const bitString = returnData.join("");
    resolve(parseInt(bitString, 2).  // Parses the bitstring into a binary number
        toString(16).                // Converts to hex
        padStart(16, "0"));          // Ensure it's of a constant length (if the first character(s) are 0, they are dropped)
});

export const PHash: FuzzyHashFunction = async (filePath: string, isVideo: boolean) => new Promise<string>(async (resolve, reject) => {
    const { grayscaleContents } = await getGrayscaleFileContents(filePath, isVideo, 32, 32);

    // Convert the grayscale contents to the Discrete Cosine Transform of itself
    transform(grayscaleContents);

    // Filter down to the top 8x8
    let top8x8: number[] = [];
    for (let x = 0; x < 8; x++) {
        top8x8.push(...grayscaleContents.slice(x * 32, x * 32 + 8));
    }
    const avg = top8x8.slice(1).reduce((acc, val) => acc + val, 0) / 64;
    const bitString = top8x8.map((val) => val > avg ? "1" : "0").join("");
    resolve(parseInt(bitString, 2).  // Parses the bitstring into a binary number
        toString(16).                // Converts to hex
        padStart(16, "0"));          // Ensure it's of a constant length (if the first character(s) are 0, they are dropped)
});

export const AllFuzzyHashes = async (filePath: string, isVideo: boolean): Promise<{ aHash: string, dHash: string, pHash: string; }> => new Promise<{ aHash: string, dHash: string, pHash: string; }>((resolve, reject) => {
    Promise.all([
        AHash(filePath, isVideo),
        DHash(filePath, isVideo),
        PHash(filePath, isVideo),
    ]).then((values) => {
        resolve({
            aHash: values[0],
            dHash: values[1],
            pHash: values[2],
        });
    });
});

function splitHashIntoInt2s(hash: string): number[] {
    if (hash.length != 16) {
        return [];
    }

    const returnData: number[] = [];
    for (let i = 0; i < hash.length; i += 4) {
        returnData.push(parseInt(hash.substring(i, i + 4), 16));
    }
    return returnData;
}

export function PopulateFileMetaWithFuzzyHashes<T extends FileCreate | FilePatch>(file: T, aHash?: string, pHash?: string, dHash?: string): T {
    if (aHash) {
        let spl = splitHashIntoInt2s(aHash);
        if (spl.length > 0) {
            file.ahashb12 = spl[0];
            file.ahashb34 = spl[1];
            file.ahashb56 = spl[2];
            file.ahashb78 = spl[3];
        }
    }
    if (pHash) {
        let spl = splitHashIntoInt2s(pHash);
        if (spl.length > 0) {
            file.phashb12 = spl[0];
            file.phashb34 = spl[1];
            file.phashb56 = spl[2];
            file.phashb78 = spl[3];
        }
    }
    if (dHash) {
        let spl = splitHashIntoInt2s(dHash);
        if (spl.length > 0) {
            file.dhashb12 = spl[0];
            file.dhashb34 = spl[1];
            file.dhashb56 = spl[2];
            file.dhashb78 = spl[3];
        }
    }
    return file;
}
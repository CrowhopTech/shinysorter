import { getKubeConfig, execCommandInPod, getPodBySelector, scaleAllDeployments } from './kubeutil';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { Readable } from 'stream';

export async function restore(releaseName: string, sourcePath: string, options, _) {
    const kubeConfig = getKubeConfig(options.kubeconfig);
    const defaultNS = kubeConfig.getContextObject(kubeConfig.currentContext).namespace;
    const ns = options.namespace ?? defaultNS;
    let msg = `Restoring release '${releaseName}' in namespace '${ns}' from file '${sourcePath}'`;
    if (options.kubeconfig) {
        msg += ` using kubeconfig '${options.kubeconfig}'`;
    }

    console.log(msg);

    // Basically do the opposite of in backup.ts

    try {
        // Outline:
        // 1. Scale all deployments down to zero
        // 2. Create a temp directory to store our files in after we uncompress them
        // 3. Copy all the files from the existing storage directory to a backup directory ("stub-backup"?)
        // 4. Copy all files from the extracted storage directory to the existing storage directory
        // 5. Use the postgres pod to restore the database (pg_restore reading from stdin)
        // 6. Scale the deployments back up

        scaleAllDeployments(ns, 0, kubeConfig);

        // TODO: Wait for all pods to be destroyed

        // Remove all previous /tmp directories
        const tmpDirs = await fs.readdir(os.tmpdir());
        tmpDirs.filter((dir) => dir.startsWith('shinysorter-backup-')).forEach(async (dir) => {
            await fs.rm(path.join(os.tmpdir(), dir), { recursive: true });
        });

        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shinysorter-backup-'));
        const tarOutput = execSync(`tar -xzf ${sourcePath} -C ${tmpDir} .`);
        if (tarOutput.length > 0) {
            console.info("tar output:");
            console.info(tarOutput.toString());
        }

        // Move /supabase-storage/* to /supabase-storage/backup-<timestamp>
        const backupPath = path.join('/supabase-storage', `backup-${Date.now()}`);
        await fs.mkdir(backupPath);
        const existingStorageFiles = await fs.readdir('/supabase-storage');
        existingStorageFiles.filter((file) => !file.includes("backup-")).forEach(async (file) => {
            await fs.rename(`/supabase-storage/${file}`, `${backupPath}/${file}`);
        });

        const storagePath = path.join(tmpDir, 'storage');
        // Move files from storagePath to /supabase-storage
        const newStorageFiles = await fs.readdir(storagePath);
        newStorageFiles.filter((file) => !file.includes("backup-")).forEach(async (file) => {
            // I need to use `mv` as this is going across filesystems
            const mvOutput = execSync(`mv ${storagePath}/${file} /supabase-storage/${file}`);
            if (mvOutput.length > 0) {
                console.info("mv output:");
                console.info(mvOutput.toString());
            }
        });

        // Apply xattrs
        const setfattrOutput = execSync(`setfattr --restore=${tmpDir}/storage-attrs`);
        if (setfattrOutput.length > 0) {
            console.info("setfattr output:");
            console.info(setfattrOutput.toString());
        }

        // Restore the database
        const postgresPod = await getPodBySelector(ns, kubeConfig, 'app=supabase-postgres');
        if (postgresPod === undefined) {
            throw new Error('Could not find postgres pod');
        }

        const sqlDumpPath = path.join(tmpDir, 'sql-dump.sql');
        const sqlDumpFile = await fs.open(sqlDumpPath, 'r');
        const sqlDump = await sqlDumpFile.readFile();
        console.log(sqlDump);
        console.log(sqlDumpPath);
        await execCommandInPod(ns, kubeConfig, postgresPod, 'postgres', ['sh', '-c', 'cat /dev/stdin > /tmp/restore.sql'], true, Readable.from(sqlDump.toString()));

        // TODO: instead of failing on stderr, let us review the errors and see if we want to proceed, rollback, or something else
        const { stdout, stderr } = await execCommandInPod(ns, kubeConfig, postgresPod, 'postgres', ['psql', '-Upostgres', '-dpostgres', '-f/tmp/restore.sql'], true);
        if (stdout.length > 0) {
            console.info("pg_restore output:");
            stdout.split('\n').forEach((line) => console.log(`pg_restore: ${line}`));
            console.log("-----");
        }
        if (stderr.length > 0) {
            console.info("pg_restore STDERR:");
            console.info(stderr);
        }
        await sqlDumpFile.close();

        // throw new Error("fuck you");

        // Scale up all resources that matter (tbd)
        scaleAllDeployments(ns, 1, kubeConfig);
    } catch (err) {
        console.error(err);
    }
}
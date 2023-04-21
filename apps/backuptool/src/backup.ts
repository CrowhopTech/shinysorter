import { getKubeConfig, execCommandInPod, getPodBySelector, scaleAllDeployments } from './kubeutil';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

export async function backup(releaseName: string, destinationPath: string, options: { namespace?: string; kubeconfig?: string; }, _: any) {
    const kubeConfig = getKubeConfig(options.kubeconfig);
    const defaultNS = kubeConfig.getContextObject(kubeConfig.currentContext).namespace;
    const ns = options.namespace ?? defaultNS;

    let msg = `Backing up release '${releaseName}' in namespace '${ns}' to file '${destinationPath}'`;
    if (options.kubeconfig) {
        msg += ` using kubeconfig '${options.kubeconfig}'`;
    }
    console.log(msg);

    try {
        // Outline:
        // 1. Scale all deployments down to zero
        // 2. Create a temp directory to store our files in before we compress them
        // 3. Create a symlink from the storage directory (mounted in the backup tool pod) to the temp directory
        // 4. Dump the SQL contents of the database to a file by exec'ing into the postgres pod
        // 5. Run tar to compress the temp directory into a file
        // 6. Scale the deployments back up

        scaleAllDeployments(ns, 0, kubeConfig);

        // TODO: Wait for all pods to be destroyed

        // Remove all previous /tmp directories
        const tmpDirs = await fs.readdir(os.tmpdir());
        tmpDirs.filter((dir) => dir.startsWith('shinysorter-backup-')).forEach(async (dir) => {
            await fs.rm(path.join(os.tmpdir(), dir), { recursive: true });
        });

        // Inside the temp dir, we need to a) dump the SQL contents, and b) create a symlink to the storage directory
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shinysorter-backup-'));
        const sqlDumpPath = path.join(tmpDir, 'sql-dump.sql');
        const storagePath = path.join(tmpDir, 'storage');
        await fs.symlink('/supabase-storage', storagePath);

        const postgresPod = await getPodBySelector(ns, kubeConfig, 'app=supabase-postgres');
        if (postgresPod === undefined) {
            throw new Error('Could not find postgres pod');
        }

        const { stdout } = await execCommandInPod(ns, kubeConfig, postgresPod, 'postgres',
            ['pg_dump', 'postgres',
                '-Upostgres',
                '--schema=(storage|public)',
                '--on-conflict-do-nothing',
                '--inserts',
                '--no-privileges',
                '--data-only'], true);

        const sqlDumpFile = await fs.open(sqlDumpPath, 'w');
        await sqlDumpFile.write(stdout);
        await sqlDumpFile.close();

        const getfattrOutput = execSync(`sh -c 'getfattr -R /supabase-storage --absolute-names -d > ${tmpDir}/storage-attrs'`);
        if (getfattrOutput.length > 0) {
            console.info("getfattr output:");
            console.info(getfattrOutput.toString());
        }

        // tar flags:
        // * --dereference: follow symlinks so we get the actual files from the storage directory, not just the symlink
        // * --xattrs: include extended attributes (e.g. the ACLs on the storage directory)
        // * -C: change directory to the root of the filesystem (and then we strip the leading slash from the temp directory)
        const tarOutput = execSync(`tar --dereference -czf ${destinationPath} -C ${tmpDir} .`);
        if (tarOutput.length > 0) {
            console.info("tar output:");
            console.info(tarOutput.toString());
        }

        // Scale up all resources that matter (tbd)
        scaleAllDeployments(ns, 1, kubeConfig);

        console.log("Backup complete!\n\n");
        console.log("***DON'T FORGET TO COPY OUT THE BACKUP FILE!!!*** Pods are not persistent, this file will be lost if the pod scales!");

        let commandParts = [
            "kubectl",
            "cp",
            `${os.hostname()}:${destinationPath}`,
            `${path.basename(destinationPath)}`,
        ];
        if ("POD_NS" in process.env) {
            commandParts.push(`-n`, `${process.env.POD_NS}`);
        }
        console.log(`Easy command to copy the file out (run this on your PC): ${commandParts.join(" ")}`);
    } catch (err) {
        console.error(err);
    }
}
import { KubeConfig, Exec, CoreV1Api, AppsV1Api } from '@kubernetes/client-node';
import stream, { Readable } from 'stream';

export function getKubeConfig(path?: string): KubeConfig {
    const kubeConfig = new KubeConfig();
    if (path) {
        kubeConfig.loadFromFile(path);
    } else {
        kubeConfig.loadFromDefault();
    }

    return kubeConfig;
}

export async function execCommandInPod(namespace: string, kubeConfig: KubeConfig, podName: string, containerName: string, command: string[], failOnStderr: boolean = false, stdin?: Readable): Promise<{ stdout: string, stderr: string; }> {
    const execClient = new Exec(kubeConfig);
    var stdout = "";
    var stderr = "";
    var stdoutWritable = new stream.Writable({
        write: function (chunk, encoding, next) {
            stdout += chunk.toString();
            next();
        }
    });
    var stderrWritable = new stream.Writable({
        write: function (chunk, encoding, next) {
            stderr += chunk.toString();
            next();
        }
    });
    const res = await execClient.exec(namespace, podName, containerName, command, stdoutWritable, stderrWritable, stdin, false);
    await new Promise<void>((resolve, reject) => {
        res.onclose = (event) => {
            if (event.code !== 1000) {
                reject(`Command '${command.join(" ")}' in pod '${podName}' in namespace '${namespace}' failed with exit code ${event.code}: stdout='${stdout}', stderr='${stderr}'`);
            }
            if (failOnStderr && stderr.trim() != "") {
                reject(`Command '${command.join(" ")}' in pod '${podName}' in namespace '${namespace}' failed with stderr: '${stderr}'`);
            }
            resolve();
        };
    });
    return { stdout, stderr };
}

export async function getPodBySelector(namespace: string, kubeConfig: KubeConfig, selector: string): Promise<string | undefined> {
    const k8sCoreV1Api = kubeConfig.makeApiClient(CoreV1Api);
    const pods = await k8sCoreV1Api.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, selector);
    if (pods.body.items.length === 0) {
        return undefined;
    }
    return pods.body.items[0].metadata.name;
}

// TODO: Handle errors better, return more information around it
export async function scaleAllDeployments(namespace: string, newScale: number, kubeConfig: KubeConfig) {
    const k8sAppsV1Api = kubeConfig.makeApiClient(AppsV1Api);
    const deployments = await k8sAppsV1Api.listNamespacedDeployment(namespace);
    deployments.body.items.filter((item) => !item.metadata.name.includes("backuptool")).forEach(async (item) => {
        await k8sAppsV1Api.patchNamespacedDeploymentScale(item.metadata.name, namespace, [{ op: 'replace', path: '/spec/replicas', value: newScale }], undefined, undefined, undefined, undefined, undefined, { headers: { 'Content-Type': 'application/json-patch+json' } });
    });
}

// TODO: Handle errors better, return more information around it
export async function scaleAllStatefulSets(namespace: string, newScale: number, kubeConfig: KubeConfig) {
    const k8sAppsV1Api = kubeConfig.makeApiClient(AppsV1Api);
    const deployments = await k8sAppsV1Api.listNamespacedStatefulSet(namespace);
    deployments.body.items.forEach(async (item) => {
        await k8sAppsV1Api.patchNamespacedStatefulSetScale(item.metadata.name, namespace, [{ op: 'replace', path: '/spec/replicas', value: newScale }], undefined, undefined, undefined, undefined, undefined, { headers: { 'Content-Type': 'application/json-patch+json' } });
    });
}
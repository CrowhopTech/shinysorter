import { Command } from 'commander';
import { backup } from './backup';
import { restore } from './restore';

const program = new Command();

program
    .command('backup')
    .description('Backup a release')
    .arguments('<releaseName> <destinationPath>')
    .option('-n, --namespace [namespace]', 'The namespace of the release. If not provided, defaults to the current namespace in the Kubeconfig')
    .option('-k, --kubeconfig [kubeconfig]', 'The path to the Kubeconfig file. If not provided, defaults to the current Kubeconfig/in-cluster Kubeconfig')
    .action(backup);

program
    .command('restore')
    .description('Restore a release')
    .arguments('<releaseName> <sourcePath>')
    .option('-n, --namespace [namespace]', 'The namespace of the release. If not provided, defaults to the current namespace in the Kubeconfig')
    .option('-k, --kubeconfig [kubeconfig]', 'The path to the Kubeconfig file. If not provided, defaults to the current Kubeconfig/in-cluster Kubeconfig')
    .action(restore);

program.parse(process.argv);


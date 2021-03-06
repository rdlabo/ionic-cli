import { OptionFilters, filterCommandLineOptions, filterCommandLineOptionsByGroup, unparseArgs } from '@ionic/cli-framework';

import { CommandLineInputs, CommandLineOptions, CommandMetadata, CommandMetadataOption } from '../../../definitions';
import { OptionGroup } from '../../../constants';

/**
 * Filter and gather arguments from command line to be passed to Cordova
 */
export function filterArgumentsForCordova(metadata: CommandMetadata, options: CommandLineOptions): string[] {
  const m = { ...metadata };

  if (!m.options) {
    m.options = [];
  }

  const globalCordovaOpts: CommandMetadataOption[] = [
    {
      name: 'verbose',
      summary: '',
      type: Boolean,
      groups: [OptionGroup.Cordova],
    },
  ];

  m.options.push(...globalCordovaOpts);

  const results = filterCommandLineOptionsByGroup(m, options, OptionGroup.Cordova);

  results['target'] = results['cordova-target'];
  delete results['cordova-target'];

  const args = unparseArgs(results, { useEquals: false, allowCamelCase: true });
  const i = args.indexOf('--');

  if (i >= 0) {
    args.splice(i, 1); // join separated args onto main args, use them verbatim
  }

  return [m.name, ...args];
}

export function generateBuildOptions(metadata: CommandMetadata, inputs: CommandLineInputs, options: CommandLineOptions): CommandLineOptions {
  const [ platform ] = inputs;
  const includesAppScriptsGroup = OptionFilters.includesGroups(OptionGroup.AppScripts);
  const excludesCordovaGroup = OptionFilters.excludesGroups(OptionGroup.Cordova);
  const results = filterCommandLineOptions(metadata, options, o => excludesCordovaGroup(o) || includesAppScriptsGroup(o));

  return {
    ...results,
    externalAddressRequired: true,
    nobrowser: true,
    engine: 'cordova',
    platform,
  };
}

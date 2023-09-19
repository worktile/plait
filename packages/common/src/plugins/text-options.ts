import { WithPluginOptions } from '@plait/core';
import { TextPlugin } from '@plait/text';

export interface WithTextOptions extends WithPluginOptions {
    textPlugins?: TextPlugin[];
}

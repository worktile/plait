import { WithPluginOptions } from '@plait/core';
import { TextPlugin } from '@plait/text';

export interface WithMindOptions extends WithPluginOptions {
    emojiPadding: number;
    spaceBetweenEmojis: number;
    textPlugins?: TextPlugin[];
}

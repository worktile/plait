import { ComponentType, WithPluginOptions } from '@plait/core';
import { TextPlugin } from '@plait/text';
import { MindImageBaseComponent } from '../base';

export interface WithMindOptions extends WithPluginOptions {
    emojiPadding: number;
    spaceBetweenEmojis: number;
    imageComponentType?: ComponentType<MindImageBaseComponent>;
}

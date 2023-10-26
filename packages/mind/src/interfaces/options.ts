import { ImageBaseComponent } from '@plait/common';
import { ComponentType, WithPluginOptions } from '@plait/core';

export interface WithMindOptions extends WithPluginOptions {
    emojiPadding: number;
    spaceBetweenEmojis: number;
    imageComponentType?: ComponentType<ImageBaseComponent>;
}

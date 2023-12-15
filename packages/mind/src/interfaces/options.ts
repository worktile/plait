import { ComponentType, WithPluginOptions } from '@plait/core';
import { MindEmojiBaseComponent } from '../base/emoji-base.component';

export interface WithMindOptions extends WithPluginOptions {
    emojiPadding: number;
    spaceBetweenEmojis: number;
    emojiComponentType?: ComponentType<MindEmojiBaseComponent>;
}

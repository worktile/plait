import { EmojiData, EmojiItem } from '../interfaces/element-data';
import { PlaitBoard } from '@plait/core';
import { MindElement } from '../interfaces';

export abstract class MindEmojiBaseComponent {
    fontSize: number = 14;

    emojiItem!: EmojiItem;

    board!: PlaitBoard;

    element!: MindElement<EmojiData>;

    abstract nativeElement(): HTMLElement;

    // TODO
    // @HostListener('pointerdown')
    // handlePointerDown() {
    //     const currentOptions = (this.board as PlaitOptionsBoard).getPluginOptions(PlaitPluginKey.withSelection);
    //     (this.board as PlaitOptionsBoard).setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, {
    //         isDisabledSelect: true
    //     });
    //     setTimeout(() => {
    //         (this.board as PlaitOptionsBoard).setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, { ...currentOptions });
    //     }, 0);
    // }

    initialize(): void {
        this.nativeElement().style.fontSize = `${this.fontSize}px`;
        this.nativeElement().classList.add('mind-node-emoji');
    }
}

import { PlaitBoard, WithPluginOptions } from '@plait/core';
import { Editor, Operation, Element as SlateElement } from 'slate';
import { RenderComponentRef } from '../core/render-component';

export interface PlaitTextBoard {
    renderText: (container: Element | DocumentFragment, props: TextProps) => TextComponentRef;
}

export const withText = <T extends PlaitBoard = PlaitBoard>(board: T) => {
    const newBoard = board as T & PlaitTextBoard;

    newBoard.renderText = (container: Element | DocumentFragment, props: TextProps) => {
        throw new Error('No implementation for renderText method.');
    };
    return newBoard;
};

export type TextComponentRef = RenderComponentRef<TextProps>;

export interface TextProps {
    board: PlaitBoard;
    text: SlateElement;
    textPlugins?: TextPlugin[];
    readonly?: boolean;
    onChange?: (data: TextChangeData) => void;
    afterInit?: (data: Editor) => void;
    onComposition?: (data: CompositionEvent) => void;
    onExitEdit?: () => void;
}

export type TextChangeData = { newText: SlateElement; operations: Operation[] };

export interface WithTextPluginOptions extends WithPluginOptions {
    textPlugins?: TextPlugin[];
}

export type TextPlugin = (editor: Editor) => Editor;

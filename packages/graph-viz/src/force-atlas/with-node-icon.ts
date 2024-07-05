import { PlaitBoard } from '@plait/core';
import { ForceAtlasNodeElement } from '../interfaces/element';
import { RenderComponentRef } from '@plait/common';
import { NodeIconItem } from './types';

export interface ForceAtlasNodeIconBoard {
    renderNodeIcon: (container: Element | DocumentFragment, props: NodeIconProps) => RenderComponentRef<NodeIconProps>;
}

export const withNodeIcon = <T extends PlaitBoard = PlaitBoard>(board: T) => {
    const newBoard = board as T & ForceAtlasNodeIconBoard;

    newBoard.renderNodeIcon = (container: Element | DocumentFragment, props: NodeIconProps) => {
        throw new Error('No implementation for renderLabeIcon method.');
    };
    return newBoard;
};

export interface NodeIconProps {
    board: PlaitBoard;
    iconItem: NodeIconItem;
    element: ForceAtlasNodeElement;
    fontSize: number;
    color: string;
}

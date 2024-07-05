import { PlaitBoard, PlaitOptionsBoard, PlaitPlugin } from '@plait/core';
import { AngularBoard } from '@plait/angular-board';
import { IconComponent } from './icon.component';
import { ForceAtlasNodeIconBoard, NodeIconProps } from '@plait/graph-viz';

export const withForceAtlasExtend: PlaitPlugin = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & ForceAtlasNodeIconBoard & AngularBoard;

    newBoard.renderNodeIcon = (container: Element | DocumentFragment, props: NodeIconProps) => {
        const { ref } = newBoard.renderComponent(IconComponent, container, props);
        return ref;
    };

    return board;
};

import { PlaitMindBoard } from '@plait/mind';
import { PlaitBoard, PlaitOptionsBoard } from '@plait/core';
import { WithCommonPluginKey, WithCommonPluginOptions } from '@plait/common';
import { PlaitImageComponent } from '../editor/image/image.component';

export const withCommonPlugin = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;

    (board as PlaitOptionsBoard).setPluginOptions<WithCommonPluginOptions>(WithCommonPluginKey, {
        imageComponentType: PlaitImageComponent
    });

    return newBoard;
};

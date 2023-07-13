import {
    PlaitBoard,
    getHitElements,
    isMainPointer,
    toPoint,
    transformPoint,
    PlaitOptionsBoard,
    WithPluginOptions,
    PlaitPluginKey,
    PlaitElement,
    hotkeys,
    clearSelectedElement
} from '@plait/core';
import { MindElement } from '../interfaces';
import { MindNodeComponent, MindTransforms, PlaitMindBoard, getImageForeignRectangle, isHitImage } from '../public-api';
import { ImageData } from '../interfaces/element-data';

export const withMindImage = (board: PlaitBoard) => {
    let selectedImageElement: MindElement<ImageData> | null = null;

    const { keydown, mousedown } = board;

    board.mousedown = (event: MouseEvent) => {
        if (!isMainPointer(event)) {
            mousedown(event);
            return;
        }
        const point = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const range = { anchor: point, focus: point };
        const hitElements = getHitElements(board, { ranges: [range] });
        const hasImage = hitElements.length && MindElement.hasImage(hitElements[0] as MindElement);
        const hitImage = hasImage && isHitImage(board, hitElements[0] as MindElement<ImageData>, range);

        if (hitImage) {
            const currentOptions = (board as PlaitOptionsBoard).getPluginOptions(PlaitPluginKey.withSelection);
            (board as PlaitOptionsBoard).setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, {
                isDisabledSelect: true
            });
            setTimeout(() => {
                (board as PlaitOptionsBoard).setPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection, { ...currentOptions });
            }, 0);

            selectedImageElement = hitElements[0] as MindElement<ImageData>;
            const component = PlaitElement.getComponent(selectedImageElement) as MindNodeComponent;
            component.imageDrawer.drawActive(selectedImageElement);
            clearSelectedElement(board);
        } else {
            if (selectedImageElement) {
                const component = PlaitElement.getComponent(selectedImageElement) as MindNodeComponent;
                component && component.imageDrawer.destroyActive();
            }
            selectedImageElement = null;
        }

        mousedown(event);
    };

    board.keydown = (event: KeyboardEvent) => {
        if (selectedImageElement && (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event))) {
            MindTransforms.removeImage(board, selectedImageElement);
            selectedImageElement = null;
            return;
        }

        keydown(event);
    };

    return board;
};

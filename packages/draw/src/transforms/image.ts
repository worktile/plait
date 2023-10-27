import { CommonImageItem } from '@plait/common';
import { BOARD_TO_HOST, PlaitBoard, Point, Transforms, idCreator, toPoint, transformPoint } from '@plait/core';

export const insertImage = (board: PlaitBoard, imageItem: CommonImageItem, startPoint?: Point) => {
    const { width, height, url } = imageItem;
    const host = BOARD_TO_HOST.get(board);
    const viewportWidth = PlaitBoard.getComponent(board).nativeElement.clientWidth;
    const viewportHeight = PlaitBoard.getComponent(board).nativeElement.clientHeight;
    const point = transformPoint(board, toPoint(viewportWidth / 2, viewportHeight / 2, host!));
    const points: Point[] = startPoint
        ? [startPoint, [startPoint[0] + width, startPoint[1] + height]]
        : [
              [point[0] - width / 2, point[1] - height / 2],
              [point[0] + width / 2, point[1] + height / 2]
          ];
    const imageElement = {
        id: idCreator(),
        type: 'image',
        points,
        url
    };
    Transforms.insertNode(board, imageElement, [board.children.length]);
    Transforms.addSelectionWithTemporaryElements(board, [imageElement]);
};

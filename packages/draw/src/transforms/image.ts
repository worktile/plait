import { CommonImageItem } from '@plait/common';
import { PlaitBoard, Point, Transforms, idCreator, toHostPoint, toViewBoxPoint } from '@plait/core';

export const insertImage = (board: PlaitBoard, imageItem: CommonImageItem, startPoint?: Point) => {
    const { width, height, url } = imageItem;
    const viewportWidth = PlaitBoard.getBoardContainer(board).clientWidth;
    const viewportHeight = PlaitBoard.getBoardContainer(board).clientHeight;
    const point = toViewBoxPoint(board, toHostPoint(board, viewportWidth / 2, viewportHeight / 2));
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

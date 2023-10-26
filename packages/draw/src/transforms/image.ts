import { BOARD_TO_HOST, PlaitBoard, Point, Transforms, idCreator, toPoint, transformPoint } from '@plait/core';

export const insertImage = (board: PlaitBoard, width: number, height: number, url: string) => {
    const host = BOARD_TO_HOST.get(board);
    const viewportWidth = PlaitBoard.getComponent(board).nativeElement.clientWidth;
    const viewportHeight = PlaitBoard.getComponent(board).nativeElement.clientHeight;
    const point = transformPoint(board, toPoint(viewportWidth / 2, viewportHeight / 2, host!));
    Transforms.insertNode(
        board,
        {
            id: idCreator(),
            type: 'image',
            points: [
                [point[0] - width / 2, point[1] - height / 2],
                [point[0] + width / 2, point[1] + height / 2]
            ],
            width,
            height,
            url
        },
        [board.children.length]
    );
};

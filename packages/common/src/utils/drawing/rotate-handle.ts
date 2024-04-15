import { PlaitBoard, RectangleClient, createG, setStrokeLinecap } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { ROTATE_HANDLE_DISTANCE_TO_ELEMENT, ROTATE_HANDLE_SIZE } from '../../constants';

const rotateHandleRadius = 6;

export const drawRotateHandle = (board: PlaitBoard, rectangle: RectangleClient) => {
    const options: Options = { stroke: '#333', strokeWidth: 1, fillStyle: 'solid' };
    const handleCenterPoint = [
        rectangle.x - ROTATE_HANDLE_DISTANCE_TO_ELEMENT - ROTATE_HANDLE_SIZE / 2,
        rectangle.y + rectangle.height + ROTATE_HANDLE_DISTANCE_TO_ELEMENT + ROTATE_HANDLE_SIZE / 2
    ];
    const rs = PlaitBoard.getRoughSVG(board);
    const handleG = createG();
    const line = rs.path(
        `M ${handleCenterPoint[0] + rotateHandleRadius} ${handleCenterPoint[1]} A ${rotateHandleRadius} ${rotateHandleRadius}, 0, 1, 0, ${
            handleCenterPoint[0]
        } ${handleCenterPoint[1] + rotateHandleRadius}`,
        options
    );
    const arrow = rs.polygon(
        [
            [handleCenterPoint[0], handleCenterPoint[1] + rotateHandleRadius - 2],
            [handleCenterPoint[0], handleCenterPoint[1] + rotateHandleRadius + 2],
            [handleCenterPoint[0] + 4.5, handleCenterPoint[1] + rotateHandleRadius]
        ],
        { ...options, fill: '#333' }
    );
    setStrokeLinecap(arrow, 'round');
    handleG.append(line, arrow);
    return handleG;
};

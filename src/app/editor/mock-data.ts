import { PlaitMind } from '@plait/mind';
import { PlaitGeometry, GeometryShape, PlaitLine, LineShape, LineMarkerType } from '@plait/draw';
import { Alignment } from '@plait/text';
import { Element } from 'slate';

export const mockData: (PlaitMind | PlaitGeometry | PlaitLine)[] = [
    {
        id: '233',
        type: 'line',
        shape: LineShape.elbow,
        autoSize: false,
        source: {
            marker: LineMarkerType.none,
            boundId: '666',
            connection: [1, 0.5]
        },
        target: {
            marker: LineMarkerType.arrow,
            boundId: '777',
            connection: [0, 0.5]
        },
        opacity: 1,
        strokeColor: '#333333',
        strokeWidth: 2,
        points: [
            [980, 850],
            [1240, 900]
        ]
    },
    {
        id: '666',
        type: 'geometry',
        shape: GeometryShape.rectangle,
        angle: 0,
        opacity: 1,
        text: { children: [{ text: '几何图形' }], align: Alignment.center } as Element,
        textHeight: 20,
        strokeColor: '#333333',
        strokeWidth: 2,
        points: [
            [50, 50],
            [150, 159]
        ]
    },
    {
        id: '777',
        type: 'geometry',
        shape: GeometryShape.rectangle,
        angle: 0,
        autoSize: false,
        opacity: 1,
        text: { children: [{ text: '几何图形' }] },
        textHeight: 20,
        points: [
            [200, 200],
            [250, 250]
        ]
    }
];

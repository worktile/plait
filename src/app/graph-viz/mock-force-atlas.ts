import { ForceAtlasElement } from '@plait/graph-viz';

export const mockForceAtlasData: ForceAtlasElement[] = [
    {
        id: '1',
        type: 'force-atlas',
        children: [
            {
                id: '1',
                label: '页面A',
                icon: '1',
                isActive: true
            },
            {
                id: '2',
                label: '页面B',
                icon: '1'
            },
            {
                id: '3',
                label: '页面C',
                icon: '1'
            },
            {
                id: '4',
                label: '页面D',
                icon: '1'
            },
            {
                id: '1-1',
                source: '1',
                target: '2'
            },
            {
                id: '1-2',
                source: '2',
                target: '3'
            },
            {
                id: '1-3',
                source: '3',
                target: '1'
            },
            {
                id: '1-4',
                source: '1',
                target: '4'
            },
            {
                id: '1-5',
                source: '4',
                target: '1'
            },
            {
                id: '1-6',
                source: '1',
                target: '1'
            }
        ]
    }
];

import { ForceAtlasElement } from '@plait/graph-viz';

export const mockForceAtlasData: ForceAtlasElement[] = [
    {
        id: '1',
        nodes: [
            {
                id: '1',
                label: '页面A',
                icon: '',
                isActive: true
            },
            {
                id: '2',
                label: '页面B',
                icon: ''
            },
            {
                id: '3',
                label: '页面C',
                icon: ''
            },
            {
                id: '4',
                label: '页面D',
                icon: ''
            }
        ],
        edges: [
            {
                source: '1',
                target: '2'
            },
            {
                source: '2',
                target: '3'
            },
            {
                source: '3',
                target: '1'
            },
            {
                source: '1',
                target: '4'
            },
            {
                source: '4',
                target: '1'
            }
        ]
    }
];

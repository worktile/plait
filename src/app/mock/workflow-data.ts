import { WorkflowElement } from '@plait/workflow';
export const mockWorkflowData: WorkflowElement[] = [
    {
        id: '1',
        value: { children: [{ text: '开始' }] },
        type: 'origin',
        points: [[248, 153]]
    },
    {
        id: '1001',
        value: { children: [{ text: '要做' }] },
        type: 'todo',
        points: [[400, 268.5]],
        width: 120,
        height: 38
    },
    {
        id: '1002',
        value: { children: [{ text: '进行中' }] },
        type: 'in_progess',
        points: [[600, 268.5]],
        width: 120,
        height: 38
    },
    {
        id: '1003',
        value: { children: [{ text: '已完成' }] },
        type: 'done',
        points: [[800, 268.5]],
        width: 120,
        height: 38
    },
    {
        id: '002',
        value: { children: [{ text: '任何状态' }] },
        type: 'global',
        to: { id: '1002', port: 5 },
        points: []
    },
    {
        id: '003',
        value: { children: [{ text: '连线3' }] },
        type: 'directed',
        from: {
            id: '1001',
            port: 3
        },
        to: {
            id: '1002',
            port: 0
        },
        points: []
    },
    {
        id: '004',
        value: { children: [{ text: '连线3' }] },
        type: 'directed',
        from: {
            id: '1002',
            port: 1
        },
        to: {
            id: '1003',
            port: 3
        },
        conditions: [
            {
                operation: 'all'
            }
        ],
        points: []
    }
];

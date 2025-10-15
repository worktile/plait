import { Tool } from '@modelcontextprotocol/sdk/types';

// Draft
export const detailedTools: Tool[] = [
    // create
    {
        name: 'create_geometry',
        description: 'Create a new element on the Plait board',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['geometry']
                },
                points: {
                    type: 'array',
                    items: {
                        type: 'array',
                        items: { type: 'number' },
                        minItems: 2,
                        maxItems: 2
                    },
                    minItems: 2,
                    maxItems: 2,
                    description: '元素位置坐标，格式为 [[x1, y1], [x2, y2]]'
                },
                shape: {
                    type: 'string',
                    enum: [
                        // ① BasicShapes
                        'rectangle',
                        'ellipse',
                        'diamond',
                        'roundRectangle',
                        'parallelogram',
                        'text',
                        'triangle',
                        'leftArrow',
                        'trapezoid',
                        'rightArrow',
                        'cross',
                        'star',
                        'pentagon',
                        'hexagon',
                        'octagon',
                        'pentagonArrow',
                        'processArrow',
                        'twoWayArrow',
                        'comment',
                        'roundComment',
                        'cloud'

                        // // ② FlowchartSymbols
                        // 'process',
                        // 'decision',
                        // 'data',
                        // 'connector',
                        // 'terminal',
                        // 'database',
                        // 'hardDisk',
                        // 'internalStorage',
                        // 'manualInput',
                        // 'preparation',
                        // 'manualLoop',
                        // 'merge',
                        // 'delay',
                        // 'storedData',
                        // 'or',
                        // 'summingJunction',
                        // 'predefinedProcess',
                        // 'offPage',
                        // 'document',
                        // 'multiDocument',
                        // 'noteCurlyLeft',
                        // 'noteCurlyRight',
                        // 'noteSquare',
                        // 'display',

                        // // ③ UMLSymbols
                        // 'actor',
                        // 'useCase',
                        // 'container',
                        // 'note',
                        // 'package',
                        // 'combinedFragment',
                        // 'class',
                        // 'interface',
                        // 'activation',
                        // 'object',
                        // 'deletion',
                        // 'activityClass',
                        // 'simpleClass',
                        // 'component',
                        // 'componentBox',
                        // 'template',
                        // 'port',
                        // 'branchMerge',
                        // 'assembly',
                        // 'requiredInterface',
                        // 'providedInterface',
                    ],
                    description: '形状'
                },
                angle: {
                    type: 'number',
                    description: '元素角度，0-360度'
                },
                fill: {
                    type: 'string',
                    pattern: '^#[0-9A-Fa-f]{6}$'
                },
                strokeColor: {
                    type: 'string',
                    pattern: '^#[0-9A-Fa-f]{6}$'
                },
                strokeWidth: {
                    type: 'number',
                    minimum: 1,
                    description: '边框宽度，默认 2'
                },
                strokeStyle: {
                    type: 'string',
                    enum: ['solid', 'dashed', 'dotted']
                },
                opacity: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1
                }
            },
            required: ['type', 'points', 'shape', 'opacity', 'strokeWidth', 'text', 'angle']
        }
    },
    {
        name: 'create_vector_line',
        description: 'Create a new vector line on the Plait board',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['vector-line']
                },
                shape: {
                    type: 'string',
                    enum: ['straight', 'curve']
                },
                points: {
                    type: 'array',
                    items: {
                        type: 'array',
                        items: { type: 'number' },
                        minItems: 2,
                        maxItems: 2
                    },
                    minItems: 2,
                    maxItems: 2
                },
                fill: {
                    type: 'string',
                    pattern: '^#[0-9A-Fa-f]{6}$'
                },
                strokeColor: {
                    type: 'string',
                    pattern: '^#[0-9A-Fa-f]{6}$'
                },
                strokeWidth: {
                    type: 'number',
                    minimum: 1,
                    description: '边框宽度，默认 2'
                },
                strokeStyle: {
                    type: 'string',
                    enum: ['solid', 'dashed', 'dotted']
                },
                opacity: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1
                }
            },
            required: ['type', 'points', 'shape', 'opacity', 'strokeWidth']
        }
    },
    {
        name: 'create_arrow_line',
        description: 'Create a new arrow line on the Plait board',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['arrow-line']
                },
                shape: {
                    type: 'string',
                    enum: ['straight', 'curve', 'elbow']
                },
                points: {
                    type: 'array',
                    items: {
                        type: 'array',
                        items: { type: 'number' },
                        minItems: 2,
                        maxItems: 2
                    },
                    minItems: 2,
                    maxItems: 2
                },
                source: {
                    type: 'object',
                    properties: {
                        boundId: { type: 'string', description: '线的起始位置连着的元素的id，如果起点没有连着其它元素，则不填' },
                        connection: {
                            type: 'array',
                            items: { type: 'number' },
                            minItems: 2,
                            maxItems: 2,
                            description: '连接点，格式为 [x, y]（可选）'
                        },
                        marker: {
                            type: 'string',
                            enum: [
                                'arrow',
                                'none',
                                'open-triangle',
                                'solid-triangle',
                                'sharp-arrow',
                                'one-side-up',
                                'one-side-down',
                                'hollow-triangle',
                                'single-slash'
                            ],
                            description: '箭头类型，默认 none'
                        }
                    },
                    description: '线的起点，当 type 为 arrow-line 时必填'
                },
                target: {
                    type: 'object',
                    properties: {
                        boundId: { type: 'string', description: '线的终点连着的元素的id，如果终点没有连着其它元素，则不填' },
                        connection: {
                            type: 'array',
                            items: { type: 'number' },
                            minItems: 2,
                            maxItems: 2,
                            description: '连接点，格式为 [x, y]（可选）'
                        },
                        marker: {
                            type: 'string',
                            enum: [
                                'arrow',
                                'none',
                                'open-triangle',
                                'solid-triangle',
                                'sharp-arrow',
                                'one-side-up',
                                'one-side-down',
                                'hollow-triangle',
                                'single-slash'
                            ],
                            description: '箭头类型，默认arrow'
                        }
                    },
                    description: '线的终点，当 type 为 arrow-line 时必填'
                },
                texts: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            text: {
                                type: 'object',
                                properties: {
                                    type: {
                                        type: 'string',
                                        enum: ['paragraph'],
                                        description: '文本类型'
                                    },
                                    children: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                text: {
                                                    type: 'string',
                                                    description: '文本内容'
                                                }
                                            },
                                            required: ['text']
                                        },
                                        description: '文本数组'
                                    },
                                    align: {
                                        type: 'string',
                                        enum: ['left', 'center', 'right'],
                                        description: '对齐方式'
                                    }
                                },
                                required: ['type', 'children', 'align'],
                                description: '文本。需要满足 type 为 geometry 且 shape 为 text。'
                            },
                            position: { type: 'number', description: 'Percentage of positioning based on line length.（可选）' }
                        }
                    },
                    description: '文本（可选）。当 type 为 arrow-line 时可设置该属性。'
                },
                strokeColor: {
                    type: 'string',
                    pattern: '^#[0-9A-Fa-f]{6}$'
                },
                strokeWidth: {
                    type: 'number',
                    minimum: 1,
                    description: '边框宽度，默认 2'
                },
                strokeStyle: {
                    type: 'string',
                    enum: ['solid', 'dashed', 'dotted']
                },
                opacity: {
                    type: 'number',
                    minimum: 0,
                    maximum: 1
                }
            },
            required: ['type', 'points', 'shape', 'opacity', 'strokeWidth', 'source', 'target', 'texts']
        }
    }
    // update
];

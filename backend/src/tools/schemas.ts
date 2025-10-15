export const PlaitDefaultSchema = {
    type: {
        type: 'string',
        enum: [
            // PlaitGroup
            // 'group',

            // Geometry
            'geometry',

            // PlaitArrowLine
            'arrow-line',

            // PlaitVectorLine
            'vector-line'

            // PlaitCommonImage
            // 'image',

            // PlaitTable
            // 'table',
            // 'swimlane',

            // MindElement
            // 'mind_child',
            // 'mind',
            // 'mindmap'
        ],
        description: 'Plait 支持的类型，默认值 geometry。必填'
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
        description: '元素位置坐标，格式为 [[x1, y1], [x2, y2]]。必填'
    },
    angle: {
        type: 'number',
        description: '元素角度，0-360度'
    },
    // groupId: { type: 'string', description: '组ID（可选）' },
    children: {
        type: 'array',
        description: '子元素数组，数组中每个子元素都是一个完整的 PlaitElement（可选）'
    }
};

export const TextSchema = {
    text: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                enum: ['paragraph'],
                description: '文本类型。必填'
            },
            children: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: '文本内容，默认空字符串'
                        }
                    }
                },
                description: '文本数组。必填'
            },
            align: {
                type: 'string',
                enum: ['left', 'center', 'right'],
                description: '对齐方式。必填'
            }
        },
        description: '文本。需要满足 type 为 geometry 且 shape 为 text。'
    }
};

// Geometry、PlaitVectorLine
export const PlaitGeometrySchema = {
    shape: {
        type: 'string',
        enum: [
            // Geometry （GeometryShapes = BasicShapes | FlowchartSymbols | UMLSymbols）
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
            'cloud',
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

            // PlaitArrowLine、PlaitVectorLine
            'straight',
            'curve',
            'elbow'

            // // Mind
            // 'round-rectangle',
            // 'underline'
        ],
        description:
            "当元素的类型为 geometry 时，shape 字段值只能选 'rectangle','ellipse','diamond','roundRectangle','parallelogram','text','triangle','leftArrow','trapezoid','rightArrow','cross','star','pentagon','hexagon','octagon','pentagonArrow','processArrow','twoWayArrow','comment','roundComment','cloud' 其中之一。当元素的类型为 vector-line 时，shape 字段值只能选 'straight','curve' 其中之一。当元素的类型为 arrow-line 时，shape 字段值只能选 'straight','curve','elbow' 其中之一。"
    },
    ...TextSchema,
    fill: {
        type: 'string',
        pattern: '^#[0-9A-Fa-f]{6}$',
        description: '填充颜色，十六进制格式如 #E3F2FD'
    },
    strokeColor: {
        type: 'string',
        pattern: '^#[0-9A-Fa-f]{6}$',
        description: '边框颜色，十六进制格式如 #1976D2'
    },
    strokeWidth: {
        type: 'number',
        minimum: 1,
        maximum: 10,
        description: '边框宽度，默认 2'
    },
    strokeStyle: {
        type: 'string',
        enum: ['solid', 'dashed', 'dotted'],
        description: '边框样式，默认 solid'
    },
    opacity: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: '元素透明度，0-1'
    }
};

// PlaitArrowLine、ForceAtlasEdgeElement;
export const PlaitArrowLineSchema = {
    source: {
        type: 'object',
        properties: {
            boundId: { type: 'string', description: '线条的起点连着的元素的id，如果起点没有连着其它元素，则不填' },
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
                description: '箭头类型，默认 arrow'
            }
        },
        description: '线的终点，当 type 为 arrow-line 时必填'
    },
    texts: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                ...TextSchema,
                position: { type: 'number', description: 'Percentage of positioning based on line length.（可选）' }
            }
        },
        description: '文本（可选）。当 type 为 arrow-line 时可设置该属性。'
    }
};

export const PlaitTableSchema = {
    rows: {
        type: 'array',
        items: {
            type: 'object',
            properties: { id: { type: 'string', description: '行ID（可选）' }, height: { type: 'number', description: '行高度（可选）' } }
        },
        description: '行（可选）。当 type 为 table 时可设置该属性。'
    },
    columns: {
        type: 'array',
        items: {
            type: 'object',
            properties: { id: { type: 'string', description: '列ID（可选）' }, width: { type: 'number', description: '列宽度（可选）' } }
        },
        description: '列（可选）。当 type 为 table 时可设置该属性。'
    },
    cells: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string', description: '单元格ID（可选）' },
                rowId: { type: 'string', description: '行ID（可选）' },
                columnId: { type: 'string', description: '列ID（可选）' },
                colspan: { type: 'number', description: '列跨度（可选）' },
                rowspan: { type: 'number', description: '行跨度（可选）' },
                ...TextSchema,
                fill: { type: 'string', description: '填充颜色，十六进制格式如 #E3F2FD（可选）' }
            },
            description: '单元格（可选）。当 type 为 table 时可设置该属性。'
        }
    },
    header: { type: 'boolean', description: '是否显示表头，默认 false（可选）。当 type 为 swimlane 时可设置该属性。' }
};

export const PlaitMindSchema = {
    rightNodeCount: { type: 'number', description: '右节点数量（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。' },
    manualWidth: { type: 'number', description: '手动宽度（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。' },
    branchColor: {
        type: 'string',
        description: '分支颜色，十六进制格式如 #1976D2（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。'
    },
    branchWidth: { type: 'number', description: '分支宽度，默认 2（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。' },
    branchShape: {
        type: 'string',
        enum: ['bight', 'polyline'],
        description: '分支样式（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。'
    },
    layout: {
        type: 'string',
        enum: [
            'right',
            'left',
            'standard',
            'upward',
            'downward',
            'right-bottom-indented',
            'right-top-indented',
            'left-top-indented',
            'left-bottom-indented'
        ],
        description: '布局类型（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。'
    },
    isCollapsed: { type: 'boolean', description: '是否折叠，默认 false（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。' },
    start: { type: 'number', description: '开始位置（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。' },
    end: { type: 'number', description: '结束位置（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。' }
};

export const PlaitElementSchemas = {
    ...PlaitDefaultSchema,
    ...PlaitGeometrySchema,
    ...PlaitArrowLineSchema
    // ...PlaitTableSchema,
    // ...PlaitMindSchema
};

export const requiredProperties = ['type', 'points', 'shape', 'opacity', 'strokeWidth'];

// 由于 MCP Tool 的 inputSchema 是一个对象，无法根据 type 来判断必填字段，所以需要通过 prompt 来辅助模型理解。
export const toolAuxiliaryPrompt = `
注意：支持绘制三种类型的元素，分别是：geometry, vector-line, arrow-line。

shape 字段有要求：
当元素的类型为 geometry 时，shape 字段值只能选 'rectangle','ellipse','diamond','roundRectangle','parallelogram','text','triangle','leftArrow','trapezoid','rightArrow','cross','star','pentagon','hexagon','octagon','pentagonArrow','processArrow','twoWayArrow','comment','roundComment','cloud' 其中之一。当绘制的是文字时，shape 值才会是 text。
当元素的类型为 vector-line 时，shape 字段值只能选 'straight','curve' 其中之一。
当元素的类型为 arrow-line 时，shape 字段值只能选 'straight','curve','elbow' 其中之一。


type 不同，必填字段也不同：
当元素的类型为 geometry 时，必填字段为 ${requiredProperties.join(', ')}, text, angle。
当元素的类型为 vector-line 时，必填字段为 ${requiredProperties.join(', ')}.
当元素的类型为 arrow-line 时，必填字段为 ${requiredProperties.join(', ')}, source, target, texts。

根据用户的语言猜测需要的参数，不要让用户提供具体参数值。
`;

export enum MarkTypes {
    bold = 'bold',
    italic = 'italic',
    underline = 'underlined',
    strike = 'strike',
    color = 'color',
    fontSize = 'font-size'
}

export const DEFAULT_FONT_SIZE = 14;

export const DEFAULT_TEXT_COLOR = '#333333';

export const MarkProps: MarkTypes[] = [
    MarkTypes.bold,
    MarkTypes.color,
    MarkTypes.italic,
    MarkTypes.strike,
    MarkTypes.underline,
    MarkTypes.fontSize
];

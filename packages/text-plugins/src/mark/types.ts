export enum MarkTypes {
    bold = 'bold',
    italic = 'italic',
    underline = 'underlined',
    strike = 'strike',
    color = 'color',
    fontSize = 'font-size'
}

export const MarkProps: MarkTypes[] = [
    MarkTypes.bold,
    MarkTypes.color,
    MarkTypes.italic,
    MarkTypes.strike,
    MarkTypes.underline,
    MarkTypes.fontSize
];

export enum FontSizes {
    'fontSize12' = '12',
    'fontSize13' = '13',
    'fontSize14' = '14',
    'fontSize15' = '15',
    'fontSize16' = '16',
    'fontSize18' = '18',
    'fontSize20' = '20',
    'fontSize24' = '24',
    'fontSize28' = '28',
    'fontSize32' = '32',
    'fontSize40' = '40',
    'fontSize48' = '48'
}

export const HOTKEYS = {
    'mod+b': MarkTypes.bold,
    'mod+i': MarkTypes.italic,
    'mod+u': MarkTypes.underline,
    'mod+shift+x': MarkTypes.strike
};

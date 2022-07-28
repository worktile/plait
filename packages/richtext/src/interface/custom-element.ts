import { Text } from 'slate';

export type LinkElement = { type: 'link'; url: string; children: [Text] };

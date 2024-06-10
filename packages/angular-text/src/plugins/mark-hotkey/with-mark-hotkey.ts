import { AngularEditor } from 'slate-angular';
import { MarkEditor, markShortcuts, withMark } from '@plait/text-plugins';

export const withMarkHotkey = <T extends AngularEditor & MarkEditor>(editor: T): T => {
    const e = editor;

    const { onKeydown } = e;

    e.onKeydown = (event: KeyboardEvent) => {
        markShortcuts(editor, event);
        onKeydown(event);
    };

    return withMark(e);
};

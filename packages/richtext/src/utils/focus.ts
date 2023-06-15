import { EDITOR_TO_ELEMENT, IS_FOCUSED } from './weak-maps';
import { Location, Transforms } from 'slate';
import { AngularEditor } from 'slate-angular';

export function setFullSelectionAndFocus(editor: AngularEditor, location: Location) {
    Transforms.select(editor, location);
    const isFocused = IS_FOCUSED.get(editor);
    const editable = EDITOR_TO_ELEMENT.get(editor);
    if (!isFocused && editable) {
        editable.focus({ preventScroll: true });
    }
}

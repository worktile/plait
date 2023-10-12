import { Component } from '@angular/core';
import { Editor } from 'slate';
import { PlaitRichtextComponent } from '../../../packages/text/src/richtext/richtext.component';

@Component({
    selector: 'app-basic-richtext',
    templateUrl: './richtext.component.html',
    standalone: true,
    imports: [PlaitRichtextComponent]
})
export class BasicRichtextComponent {
    value = {
        children: [{ text: '富文本' }]
    };
    onChange(event: Editor) {
        console.log(event);
    }
}

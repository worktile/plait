import { Component } from '@angular/core';
import { Editor } from 'slate';
import { PlaitTextComponent } from '../../../packages/angular-text/src/text/text.component';
import { TextChangeData } from '@plait/common';

@Component({
    selector: 'app-basic-richtext',
    templateUrl: './richtext.component.html',
    standalone: true,
    imports: [PlaitTextComponent]
})
export class BasicRichtextComponent {
    value = {
        children: [{ text: '富文本' }]
    };

    onChangeHandle = (data: TextChangeData) => {
        console.log(data);
    };
}

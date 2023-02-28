import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BasicBoardEditorComponent } from './editor/editor.component';
import { BasicRichtextComponent } from './richtext/richtext.component';

const routes: Routes = [
    {
        path: '',
        component: BasicBoardEditorComponent
    },
    {
        path: 'richtext',
        component: BasicRichtextComponent
    }
];
@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            useHash: false,
            relativeLinkResolution: 'legacy'
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}

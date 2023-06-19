import { NgModule } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterModule } from '@angular/router';
import { DocgeniTemplateModule, RootComponent, RouterResetService } from '@docgeni/template';

import { EXAMPLE_MODULES } from './content/example-modules';
import { DOCGENI_SITE_PROVIDERS } from './content/index';

import { MindModule } from '@plait/mind';
import { FlowModule } from '@plait/flow';
import { PlaitModule } from '@plait/core';
import { RichtextModule } from '@plait/richtext';

import { BasicRichtextComponent } from './richtext/richtext.component';
import { BasicFlowComponent } from './flow/flow.component';
import { AppZoomToolbarComponent } from './components/zoom-toolbar/zoom-toolbar.component';
import { AppMainToolbarComponent } from './components/main-toolbar/main-toolbar.component';
import { AppSettingPanelComponent } from './components/setting-panel/setting-panel.component';
import { BasicBoardEditorComponent } from './editor/editor.component';
import { AppColorPickerComponent } from './components/color-picker/color-picker.component';
import { examplesRoute } from './examples-route';

const COMPONENTS = [
    AppZoomToolbarComponent,
    AppMainToolbarComponent,
    AppSettingPanelComponent,
    BasicRichtextComponent,
    BasicFlowComponent,
    BasicBoardEditorComponent,
    AppColorPickerComponent
];

const MODULES = [RichtextModule, PlaitModule, FlowModule, MindModule];

@NgModule({
    declarations: [...COMPONENTS],
    imports: [BrowserModule, BrowserAnimationsModule, DocgeniTemplateModule, RouterModule.forRoot([]), ...MODULES, ...EXAMPLE_MODULES],
    providers: [...DOCGENI_SITE_PROVIDERS],
    bootstrap: [RootComponent]
})
export class AppModule {
    constructor(sanitizer: DomSanitizer, routerResetService: RouterResetService, router: Router) {
        const originResetRoutes = routerResetService.resetRoutes.bind(routerResetService);
        routerResetService.resetRoutes = () => {
            originResetRoutes();
            // 添加示例路由
            const rootRoute = router.config.find(item => {
                return item.path === '';
            });
            rootRoute!.children?.unshift(examplesRoute);
            router.resetConfig(router.config);
        };
    }
}

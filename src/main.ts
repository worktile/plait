import { enableProdMode, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { FormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { SlateModule } from 'slate-angular';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [provideZoneChangeDetection(), importProvidersFrom(BrowserModule, FormsModule, AppRoutingModule, SlateModule)]
}).catch((err) => console.error(err));

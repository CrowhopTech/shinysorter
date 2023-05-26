import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../environments/environment';

export const AppConfigEnvVars = {
    supabaseAddress: "SUPABASE_ADDRESS",
    supabaseKey: "SUPABASE_KEY",
    queryServerAddress: "QUERY_SERVER_ADDRESS",
};
export class AppConfig {
    supabaseAddress: string = "";
    supabaseKey: string = "";
    queryServerAddress: string = "";
}

export const TOKEN = new InjectionToken<AppConfig>('AppService');

@Injectable({
    providedIn: 'root'
})
export class AppService {
    // SOURCE: https://medium.com/bb-tutorials-and-thoughts/angular-how-to-read-environment-info-at-runtime-for-ci-cd-9a788478aa9b
    // A genius article on passing in env variables at runtime, by serving it as a static file from the same pod serving nginx
    // You can then inject it using a configmap!
    constructor(private http: HttpClient, @Inject(TOKEN) cfg?: AppConfig) {
        if (cfg) {
            this.configSettings = cfg;
        }
    }

    private configUrl(): string {
        return `assets/app.config.json`;
    }

    public setConfigForTest(cfg: AppConfig) {
        this.configSettings = cfg;
    }

    private configSettings: AppConfig | null = null;

    public get settings() {
        return this.configSettings;
    }

    public load(): Promise<any> {
        if (this.configSettings != undefined) {
            return Promise.resolve(true);
        }

        return new Promise((resolve, reject) => {
            this.http.get(this.configUrl()).pipe(map((response: Object) => response as AppConfig)).subscribe((response: AppConfig) => {
                this.configSettings = response;
                resolve(true);
            });
        });
    }

}
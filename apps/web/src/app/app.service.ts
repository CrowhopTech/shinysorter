import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

export class AppConfig {
    supabaseAddress: string = "";
    supabaseKey: string = "";
    queryServerAddress: string = "";
}

@Injectable({
    providedIn: 'root'
})
export class AppService {
    // SOURCE: https://medium.com/bb-tutorials-and-thoughts/angular-how-to-read-environment-info-at-runtime-for-ci-cd-9a788478aa9b
    // A genius article on passing in env variables at runtime, by serving it as a static file from the same pod serving nginx
    // You can then inject it using a configmap!
    constructor(private http: HttpClient) { }

    configUrl = `assets/app.config.json`;
    private configSettings: AppConfig | null = null;

    public get settings() {
        return this.configSettings;
    }

    public load(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(this.configUrl).pipe(map((response: Object) => response as AppConfig)).subscribe((response: AppConfig) => {
                this.configSettings = response;
                resolve(true);
            });
        });
    }

}
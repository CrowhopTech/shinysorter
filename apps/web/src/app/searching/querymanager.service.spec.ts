import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { QueryManagerService } from './querymanager.service';
import { AppConfig, TOKEN } from '../app.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('QueryManagerService', () => {
  let service: QueryManagerService;
  let appConfig = new AppConfig();
  appConfig.supabaseAddress = "http://localhost:8080";
  appConfig.supabaseKey = "asdfasdf";
  appConfig.queryServerAddress = "http://localhost:8081";

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule,
        RouterModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: TOKEN, useValue: appConfig }
      ]
    });
    service = TestBed.inject(QueryManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

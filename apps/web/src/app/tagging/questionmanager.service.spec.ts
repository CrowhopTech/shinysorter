import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { QuestionManagerService } from './questionmanager.service';
import { AppConfig, TOKEN } from '../app.service';

describe('QuestionmanagerService', () => {
  let service: QuestionManagerService;
  let appConfig = new AppConfig();
  appConfig.supabaseAddress = "http://localhost:8080";
  appConfig.supabaseKey = "asdfasdf";
  appConfig.queryServerAddress = "http://localhost:8081";

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule,
        RouterTestingModule,
        HttpClientModule
      ],
      providers: [
        { provide: TOKEN, useValue: appConfig }
      ]
    });
    service = TestBed.inject(QuestionManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

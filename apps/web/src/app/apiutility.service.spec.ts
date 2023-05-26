import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { APIUtilityService } from './apiutility.service';
import { AppConfig, TOKEN } from './app.service';

describe('APIUtilityService', () => {
  let service: APIUtilityService;
  let appConfig = new AppConfig();
  appConfig.supabaseAddress = "http://localhost:8080";
  appConfig.supabaseKey = "asdfasdf";
  appConfig.queryServerAddress = "http://localhost:8081";

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        { provide: TOKEN, useValue: appConfig }
      ]
    });
    service = TestBed.inject(APIUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

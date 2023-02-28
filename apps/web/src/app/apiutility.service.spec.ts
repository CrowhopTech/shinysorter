import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { APIUtilityService } from './apiutility.service';

describe('APIUtilityService', () => {
  let service: APIUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ]
    });
    service = TestBed.inject(APIUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

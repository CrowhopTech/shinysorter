import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { QueryManagerService } from './querymanager.service';

describe('QueryManagerService', () => {
  let service: QueryManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule,
        RouterModule
      ]
    });
    service = TestBed.inject(QueryManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

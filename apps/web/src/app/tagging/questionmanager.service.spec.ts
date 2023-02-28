import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { QuestionManagerService } from './questionmanager.service';

describe('QuestionmanagerService', () => {
  let service: QuestionManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule,
        RouterTestingModule,
        HttpClientModule
      ]
    });
    service = TestBed.inject(QuestionManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

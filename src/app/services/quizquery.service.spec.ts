import { TestBed } from '@angular/core/testing';

import { QuizqueryService } from './quizquery.service';

describe('QuizqueryService', () => {
  let service: QuizqueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizqueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

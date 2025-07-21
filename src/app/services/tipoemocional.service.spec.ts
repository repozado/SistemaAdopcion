import { TestBed } from '@angular/core/testing';

import { TipoemocionalService } from './tipoemocional.service';

describe('TipoemocionalService', () => {
  let service: TipoemocionalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoemocionalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

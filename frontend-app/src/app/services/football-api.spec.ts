import { TestBed } from '@angular/core/testing';

import { FootballApi } from './football-api';

describe('FootballApi', () => {
  let service: FootballApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FootballApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

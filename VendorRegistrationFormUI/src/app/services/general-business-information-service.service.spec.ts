import { TestBed } from '@angular/core/testing';

import { GeneralBusinessInformationServiceService } from './general-business-information-service.service';

describe('GeneralBusinessInformationServiceService', () => {
  let service: GeneralBusinessInformationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneralBusinessInformationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

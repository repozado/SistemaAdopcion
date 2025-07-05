import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValuecardComponent } from './valuecard.component';

describe('ValuecardComponent', () => {
  let component: ValuecardComponent;
  let fixture: ComponentFixture<ValuecardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValuecardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValuecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

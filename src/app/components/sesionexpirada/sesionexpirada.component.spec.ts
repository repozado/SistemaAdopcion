import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SesionexpiradaComponent } from './sesionexpirada.component';

describe('SesionexpiradaComponent', () => {
  let component: SesionexpiradaComponent;
  let fixture: ComponentFixture<SesionexpiradaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SesionexpiradaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SesionexpiradaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

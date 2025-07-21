import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisadopcionesComponent } from './misadopciones.component';

describe('MisadopcionesComponent', () => {
  let component: MisadopcionesComponent;
  let fixture: ComponentFixture<MisadopcionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisadopcionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisadopcionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

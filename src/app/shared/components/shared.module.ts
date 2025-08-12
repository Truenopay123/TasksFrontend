import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@NgModule({
  imports: [CommonModule, ButtonModule, RippleModule],
  exports: [CommonModule, ButtonModule, RippleModule] // Reexporta los módulos necesarios
})
export class SharedModule { }

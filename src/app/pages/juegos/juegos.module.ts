import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JuegosRoutingModule } from './juegos-routing.module';

@NgModule({
  imports: [CommonModule, RouterModule, JuegosRoutingModule],
})
export class JuegosModule {}

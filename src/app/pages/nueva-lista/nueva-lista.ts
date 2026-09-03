import { Component, output } from '@angular/core';
import { Button } from '../../components/button/button';
import { Input } from '../../components/input/input';

@Component({
  selector: 'app-nueva-lista',
  standalone: true,
  imports: [Button, Input],
  templateUrl: './nueva-lista.html',
  styleUrl: './nueva-lista.css',
})
export class NuevaLista {
  back = output<void>();
  create = output<{ name: string; description: string }>();

  name = '';
  description = '';
  nameTouched = false;

  get nameError(): string | null {
    return this.nameTouched && !this.name.trim() ? 'El nombre es obligatorio.' : null;
  }

  updateName(value: string): void {
    this.name = value;
  }

  createList(): void {
    this.nameTouched = true;
    if (!this.name.trim()) {
      return;
    }

    this.create.emit({ name: this.name, description: this.description });
  }
}

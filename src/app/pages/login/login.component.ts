import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';

type LoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form!: FormGroup<LoginForm>;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group<LoginForm>({
      email: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
    });
  }

  ingresar() {
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    console.log('Login intent:', { email, password });
  }
}

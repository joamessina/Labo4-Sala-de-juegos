import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

type RegisterForm = {
  displayName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  form!: FormGroup<RegisterForm>;
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group<RegisterForm>({
      displayName: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
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

  async submit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.errorMsg = '';
    const { displayName, email, password } = this.form.getRawValue();
    try {
      await this.auth.register(email, password, displayName);
      this.router.navigateByUrl('/');
    } catch (e: any) {
      const msg = (e?.message || '').toLowerCase();
      this.errorMsg = msg.includes('already registered')
        ? 'El usuario ya está registrado.'
        : e?.message ?? 'Error al registrar';
    } finally {
      this.loading = false;
    }
  }
}

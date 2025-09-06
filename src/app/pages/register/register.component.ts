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
  email: FormControl<string>;
  password: FormControl<string>;
  displayName: FormControl<string>;
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
      email: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)],
      }),
      displayName: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
    });
  }

  async submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    try {
      const { email, password, displayName } = this.form.getRawValue();
      await this.auth.register(email, password, displayName);
      this.successMsg =
        'Te enviamos un email para confirmar la cuenta (si está activado).';
      await this.auth.login(email, password);
      this.router.navigateByUrl('/login');
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al registrar';
    } finally {
      this.loading = false;
    }
  }
}

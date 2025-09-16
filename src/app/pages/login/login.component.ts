import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';

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
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
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

  async ingresar() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.errorMsg = '';
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.login(email, password);
      await this.auth.insertLoginLog(email);
      this.router.navigateByUrl('/');
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error de login';
    } finally {
      this.loading = false;
    }
  }

  completar(email: string, pass: string) {
    this.form.setValue({ email, password: pass });
  }
}

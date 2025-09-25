import { inject, Injectable } from '@angular/core';
import { Auth, getAuth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { doc, getFirestore, setDoc, Timestamp } from '@angular/fire/firestore';
import { onAuthStateChanged } from '@firebase/auth';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  auth = inject(Auth);
  user: any;
  user$ : Observable<any>;
  userSub = new Subject<any>();

  constructor() {
    this.user$ = this.userSub.asObservable();
    onAuthStateChanged(getAuth(),
      (user) => {
        if (user) {
          this.user = user
          this.userSub.next(user);
          console.log("usuario logueado");
        } else {
          this.user = null
          this.userSub.next(null);
          console.log("Se cerro sesion.");
        }
      },
      (error) => {
        console.log("error")
      }
      // Handle errors (optional)this.mensajePersonalizadoFirebase(err.message)
    );
  }


  //inicia secion
  async login(email: string, password: string) {

    await signInWithEmailAndPassword(this.auth, email!, password!).then(async res => {
      this.user = res.user
      this.setUserInfo(this.user.email);
      console.log(res);

      }).catch(err => {
        console.log("No Logueadisimo");
      })
  }

  logout(noToast?: boolean) {
    signOut(getAuth())
      .then(() => {
        if (!noToast) {
          console.log("usuario deslogeado")
        }
        this.user = null
      })
      .catch(() => {
        console.log("error en el deslogueo")
      })
  }

  async setUserInfo(email: string)
  {
    let path = `logOns/${email}`;
    let date = new Date();
    setDoc(doc(getFirestore(),path),
    {
      email: email,
      date: Timestamp.fromDate(date)
    })
  }

  getUserLogged()
  {
    return this.user;
  }

}

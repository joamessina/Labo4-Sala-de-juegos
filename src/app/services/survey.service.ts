import { Injectable } from '@angular/core';
import { Survey } from '../models/survey';
import { doc, getFirestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  constructor() { }

  async setSurveyInfo(survey: Survey)
  {
    let path = `surveys/${survey.game}_${survey.name}${survey.surname}_${survey.phone}`;
    setDoc(doc(getFirestore(),path),
    {
      user: survey.user,
      game: survey.game,
      name: survey.name,
      surname: survey.surname,
      age: survey.age,
      phone: survey.phone,
      commentary: survey.commentary,
      valueRange: survey.valueRange,
      recommendCheck: survey.recommendCheck
    })
  }
}

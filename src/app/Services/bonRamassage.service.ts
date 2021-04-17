import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentification.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {host} from './host';
import {BonRamassage} from '../models/model.BonRamassage';

@Injectable()
export class BonRamassageService{

  private host = host;

  constructor(private authenticationService: AuthenticationService, private http: HttpClient){}

  ajouterBonRamassage(bonRamassage: BonRamassage){

    return this.http.post(this.host + '/bonRamassages', bonRamassage,{headers: new HttpHeaders({'Authorization': this.authenticationService.getToken()})});
  }

  getBonRamassage(nom: string){
    return this.http.get(this.host + '/bonRamassages/' + nom,{headers: new HttpHeaders({'Authorization': this.authenticationService.getToken()})});
  }

  modifierBonRamassage(bonRamassage: BonRamassage){
    return this.http.put(this.host + '/editBonRamassage/' + bonRamassage.nom, bonRamassage,{headers: new HttpHeaders({'Authorization': this.authenticationService.getToken()})});
  }

  supprimerBonRamassage(nom: string){
    return this.http.delete(this.host + '/deleteBonRamassage/' + nom,{headers: new HttpHeaders({'Authorization': this.authenticationService.getToken()})});
  }

}

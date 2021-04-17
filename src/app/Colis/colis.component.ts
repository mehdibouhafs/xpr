import {SelectionModel} from '@angular/cdk/collections';
import {AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthenticationService} from '../Services/authentification.service';
import {VilleService} from '../Services/ville.service';
import {ColisService} from '../Services/colis.service';
import {Produit} from '../models/model.produit';
import {Colis} from '../models/model.colis';
import {Utilisateur} from '../models/model.utilisateur';
import {LigneColis} from '../models/model.ligneColis';
import {Router} from '@angular/router';
import {Autorisation} from '../Services/autorisation';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Ville} from '../models/model.ville';
import {StatutColis} from '../models/model.statutColis';

import {Commentaire} from '../models/model.commentaire';
import {HistoriqueColis} from '../models/model.historiqueColis';







@Component({
  selector: 'app-colis',
  templateUrl: './colis.component.html',
  styleUrls: ['./colis.component.sass']
})
export class ColisComponent implements  OnInit, AfterViewInit {

    public isFilterCollapsed = true;
    filtredVille: Ville;
    filtredStatut: StatutColis;
    statuts: Array<StatutColis>;
    filtredPage: number;
    pages: Array<number>;
    currentColisHistorique: Array<HistoriqueColis>;
    currentColis: Colis;

    errorForm: boolean;
    errorMessage: string;

    errorDeleteForm: boolean;
    errorDeleteMessage: string;

    errorAddCommentaireForm: boolean;
    errorAddCommentaireMessage: string;

    currentColisCommentaire: Array<Commentaire>;

  showColis: boolean;
  writeColis: boolean;

  villes = new Array();

  selectedVille: any;

  coliss = new Array();

  mode: number;

  size: number;

  pageSize: number;

  filter: string;

    newCommentaire: string;


    pageSizeOptions: number[] = [10, 15, 25, 30];

    currentPage: number;

    selectColis: Colis;

  displayedColumns: string[] = ['select', 'dateCreation',	'statut', 'codeEnvoi',	'idIntern', 'destinataire',
    'telephone', 'villeDestination.nom', 'ligneColis[0].prix', 'ligneColis[0].produit.nom', 'outils'];

  dataSource = new MatTableDataSource<Colis>();
  selection = new SelectionModel<Colis>(true, []);
    @ViewChild('pagination', {static: true}) paginator: MatPaginator;

    @ViewChild(MatSort, {static: true}) sort: MatSort;


    @HostListener('matSortChange', ['$event'])
    sortChange(e) {
        // save cookie with table sort data here
        console.log('Sort' + JSON.stringify(e));

        const params = {};

        if (e.direction !== ''){
            params['sortColumn'] = e.active;
            params['sortOrder'] = e.sortOrder;

        }

        console.log('params ' + JSON.stringify(params));

        this.colisService.getColisFilter(params).subscribe(
            (data: any) => {
                this.coliss = data.content;
                this.size = data.totalElements;
                console.log('colis ' + JSON.stringify(this.coliss[0].villeDestination.nom));
                this.dataSource = new MatTableDataSource<Colis>(this.coliss);
                this.dataSource.sort = this.sort;
                this.ref.detectChanges();
            });





    }

    ngAfterViewInit() {

        this.dataSource.paginator = this.paginator;
    }

    onPaginateChange(event) {
        console.log('onPaginateChangeevent ');
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.chargerColis(null);
    }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Colis): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.numCommande + 1}`;
  }


  constructor(private ref: ChangeDetectorRef, private autorisation: Autorisation, private router: Router,
              private colisService: ColisService, private villeService: VilleService,
              private authenticationService: AuthenticationService, private modalService: NgbModal){

  }

  openLarge(content) {
    this.modalService.open(content, {
      size: 'lg'
    });
  }

  ngOnInit() {
      this.pageSize = 10;

      this.chargerVilles();
      this.chargerColis(null);
  }

  chargerVilles() {
    this.villeService.getVilles().subscribe(
        (data: any) => {
          this.villes = data;
        }
    );
  }

    getHistoriqueColis(numCommande: string) {
        this.colisService.getHistoriques(numCommande).subscribe(
            (data: any) => {
                this.currentColisHistorique = data;
            }
        );
    }

    getCommentairesColis(numCommande: string) {
        this.colisService.getCommentaires(numCommande).subscribe(
            (data: any) => {
                this.currentColisCommentaire = data;
            }
        );
    }

  chargerColis( params: any) {

    if (!params){
        params = {};
    }


    if (this.authenticationService.isProfileLivreur()) {
        params['livreur.email'] = this.authenticationService.getUserName();
    }

    if (this.authenticationService.isProfileClient()) {
        params['client.ice'] = this.authenticationService.getClientId();
    }

    this.colisService.getColisFilter(params).subscribe(
          (data: any) => {
              this.coliss = data.content;
              this.size = data.totalElements;
              console.log('colis ' + JSON.stringify(this.coliss[0].villeDestination.nom));
              this.dataSource = new MatTableDataSource<Colis>(this.coliss);
              this.dataSource.sort = this.sort;
              this.ref.detectChanges();
              this.errorForm = false;
              this.errorMessage = '';
          },
         (error: any) => {
              this.errorForm = true;
              this.errorMessage = error;
        });



  }

  ajouterColis(colisFormulaire){

    console.log('colisForm ' + JSON.stringify(colisFormulaire));

    const colis = new Colis();
    colis.creerPar = this.authenticationService.getCurrentUtilisateur();
    colis.adresse = colisFormulaire.adresse;
    colis.client = this.authenticationService.getCurrentClient();
    colis.dateCreation = new Date();
    colis.telephone = colisFormulaire.telephone;
    colis.nomComplet = colis.destinataire;

    const lc = new LigneColis();

    const produit = new Produit();
    produit.nom = colisFormulaire.produit;
    produit.idIntern = colisFormulaire.idIntern;
    produit.prixOriginale = 1000.00;
    produit.prixVente = 1500.00;

    lc.produit = produit;
    lc.qte = 1;
    lc.qteLivre = 0;
    lc.qteRetourne = 0;

    colis.ligneColis = new Array<LigneColis>();
    colis.ligneColis.push(lc);

    colis.remarque = colisFormulaire.remarque;
    this.colisService.ajouterColis (colis).subscribe(
        (data: Colis) => {
          this.chargerColis(null);
          this.modalService.dismissAll();
        },
        err => {
          console.log("error add colis ", err);
        }
    );
  }

  modifierColis(colis1: Colis){
    this.colisService.modifierColis(colis1).subscribe(
        (data: Colis) => {

        },
        err => {
          console.log("error add colis ", err);
        }
    );
  }

  supprimerColis(numCommande: string){
    this.colisService.supprimerColis(numCommande).subscribe(
        data => {

        },
        err => {
          console.log('error delete colis ', err);
        }
    );
  }

  showDetails(row) {
  }

  editItem(row) {

  }

  deleteItem(row) {

  }

  selectedElement(element, template: any) {
  }

  applyFilter(value: any) {
      this.filter = value.trim().toLocaleLowerCase(); // Remove whitespace
      console.log('filter ' + this.filter );
      this.chargerColis(null);
  }


    selectedColis(colis: Colis, template: TemplateRef<any>){
        this.selectColis = colis;
        this.getHistoriqueColis(colis.numCommande);

        this.getCommentairesColis(colis.numCommande);



        console.log(
            'this.selectColis ' + JSON.stringify(this.selectColis)
        )

        this.modalService.open(template, {
            size: 'lg'
        });
        this.ref.detectChanges();


    }

    showModalDeleteColis(colis: Colis, template: TemplateRef<any>){
        this.currentColis = colis;
        this.modalService.open(template, {
            size: 'lg'
        });
        this.ref.detectChanges();
    }


    deleteColis(numCommande: string , template: TemplateRef<any>){
        this.colisService.supprimerColis (numCommande).subscribe(
            (data: any) => {
                this.modalService.dismissAll();
                this.errorDeleteForm = false;
                this.errorDeleteMessage = '';
                this.chargerColis(null);
            },
            (error: any) => {
                this.errorDeleteForm = true;
                this.errorDeleteMessage = error;
        }
        );

        this.ref.detectChanges();
    }

    addCommentairesColis(numCommande: string){
       const commentaire = new Commentaire();
       commentaire.utilisateur = this.authenticationService.getCurrentUtilisateur();
       commentaire.createdDate = new Date();
       commentaire.colis = this.currentColis;

       this.colisService.addCommentaire(numCommande, commentaire).subscribe(
            (data: any) => {
                this.modalService.dismissAll();
                this.errorAddCommentaireForm = false;
                this.errorAddCommentaireMessage = '';
                this.getCommentairesColis(numCommande);
            },
            (error: any) => {
                this.errorAddCommentaireForm = true;
                this.errorAddCommentaireMessage = error;
            }
        );


    }

    ajouterMultipleColis(value){

    }
}

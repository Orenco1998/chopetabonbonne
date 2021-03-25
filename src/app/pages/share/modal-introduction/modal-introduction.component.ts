import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-modal-introduction",
  templateUrl: "./modal-introduction.component.html",
  styleUrls: ["./modal-introduction.component.scss"],
})
export class ModalIntroductionComponent implements OnInit {
  /**
   * Déclaration de variable
   */
  nameOfAWay = "";
  submit = false;

  /**
   * Contructeur d'objet
   * @param modalCtrl
   */
  constructor(private modalCtrl: ModalController) {}

  /**
   * Traitement à l'initialisation, de la fenêtre
   */
  ngOnInit() {}

  /**
   * Fermer la boite de dialogue en envoyant le message adéquat,
   * à la fnêtre qui la sollicitée
   * @param arg
   */
  dismiss(arg) {
    this.submit = true;

    if (this.nameOfAWay !== "") {
      // using the injected ModalController this page
      // can "dismiss" itself and optionally pass back data
      this.modalCtrl.dismiss({
        dismissed: true,
        out: arg,
        nameofaway: this.nameOfAWay,
      });
    } else {
      this.modalCtrl.dismiss();
    }
  }
}

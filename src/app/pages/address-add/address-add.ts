import { Component, Injector } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { BasePage } from "../base-page/base-page";
import { CustomerAddress } from "../../services/customer-address";
import { Zone } from "../../services/zone";
import { LocalStorage } from "../../services/local-storage";
import { FCM } from "cordova-plugin-fcm-with-dependecy-updated/ionic/ngx";

@Component({
  selector: "address-add",
  templateUrl: "./address-add.html",
  styleUrls: ["./address-add.scss"],
})
export class AddressAddPage extends BasePage {
  public form: FormGroup;
  public zones: Zone[] = [];
  public subzones: Zone[] = [];
  isValidFormSubmitted = null;
  constructor(
    injector: Injector,
    private zoneService: Zone,
    private customerAddressService: CustomerAddress,
    private localStorage: LocalStorage,
    private fcm: FCM
  ) {
    super(injector);
  }

  ngOnInit() {
    this.setupForm();
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  ionViewDidEnter() {
    this.loadZones();
  }

  setupForm() {
    this.form = new FormGroup({
      zone: new FormControl(null, Validators.required),
      subzone: new FormControl(null, Validators.required),
      city: new FormControl("Marseille", Validators.required),
      zipcode: new FormControl("", [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(5),
        Validators.pattern("^[0-9]*$"),
      ]),
      address: new FormControl("", Validators.required),
      name: new FormControl("", Validators.required),
      phone: new FormControl("", [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern("^[0-9]*$"),
      ]),
      isDefault: new FormControl(false),
    });
    console.log(this.form);
  }

  onDismiss(address: CustomerAddress = null) {
    this.modalCtrl.dismiss(address);
  }

  async loadZones() {
    try {
      this.zones = await this.zoneService.load({ type: "Parent" });
    } catch (error) {
      console.warn(error.message);
    }
  }

  async onZoneChanged() {
    try {
      this.form.controls.subzone.setValue(null);
      this.subzones = await this.zoneService.load({
        parent: this.form.value.zone,
      });
    } catch (error) {
      console.warn(error.message);
    }
  }

  async onSubmit() {
    this.isValidFormSubmitted = false;
    if (this.form.invalid) {
      console.log(this.form);
      return this.translate
        .get("INVALID_FORM")
        .subscribe((str) => this.showToast(str));
    }
    this.isValidFormSubmitted = true;
    try {
      await this.showLoadingView({ showOverlay: false });
      let myToken = await this.localStorage.getMyToken();

      const formData = Object.assign({}, this.form.value);

      formData.tokenMobile = myToken;

      if (myToken === null || myToken === undefined) {
        if (this.fcm !== undefined && this.fcm !== null) {
          try {
            myToken = await this.fcm.getToken();
          } catch (error) {
            console.log("error :::: fcm problem");
          }
        }
      }

      const address = await this.customerAddressService.create(formData);

      this.showContentView();
      this.onDismiss(address);
    } catch (error) {
      this.showContentView();
      this.translate
        .get("ERROR_NETWORK")
        .subscribe((str) => this.showToast(str));
    }
  }
}

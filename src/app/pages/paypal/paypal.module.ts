import { NgModule } from "@angular/core";
import { PaypalPage } from "./paypal";
import { SharedModule } from "../../shared.module";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { NgxStripeModule } from "@nomadreservations/ngx-stripe";

@NgModule({
  declarations: [PaypalPage],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, NgxStripeModule],
  entryComponents: [PaypalPage],
})
export class PaypalPageModule {}

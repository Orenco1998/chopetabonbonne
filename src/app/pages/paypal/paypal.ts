import { Component, Injector } from "@angular/core";
import {
  PayPal,
  PayPalConfiguration,
  PayPalPayment,
} from "@ionic-native/paypal/ngx";
import { BasePage } from "../base-page/base-page";

@Component({
  selector: "paypal",
  templateUrl: "./paypal.html",
  styleUrls: ["./paypal.scss"],
})
export class PaypalPage extends BasePage {
  constructor(injector: Injector, private payPal: PayPal) {
    super(injector);
  }
  paymentAmount: string = "3.33";
  currencys: string = "USD";
  currencyIcon: string = "$";
  onDismiss() {
    this.modalCtrl.dismiss();
  }
  enableMenuSwipe(): boolean {
    return false;
  }
  ionViewWillEnter() {
    this.payWithPaypal();
  }
  payWithPaypal() {
    console.log("Pay ????");
    this.payPal
      .init({
        PayPalEnvironmentProduction: "YOUR_PRODUCTION_CLIENT_ID",
        PayPalEnvironmentSandbox:
          "ATbDf36yLcoOb3jTMaqxOnVcUGFho4edh11NgBvatWOP9I1IL1uZonQTlNSnZuZeymwl5iwrdjEBoi5d",
      })
      .then(
        () => {
          // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
          this.payPal
            .prepareToRender(
              "PayPalEnvironmentSandbox",
              new PayPalConfiguration({
                // Only needed if you get an "Internal Service Error" after PayPal login!
                //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
              })
            )
            .then(
              () => {
                let payment = new PayPalPayment(
                  this.paymentAmount,
                  this.currencys,
                  "Description",
                  "sale"
                );
                this.payPal.renderSinglePaymentUI(payment).then(
                  (res) => {
                    console.log(res);
                    // Successfully paid
                    this.onDismiss();
                    // Example sandbox response
                    //
                    // {
                    //   "client": {
                    //     "environment": "sandbox",
                    //     "product_name": "PayPal iOS SDK",
                    //     "paypal_sdk_version": "2.16.0",
                    //     "platform": "iOS"
                    //   },
                    //   "response_type": "payment",
                    //   "response": {
                    //     "id": "PAY-1AB23456CD789012EF34GHIJ",
                    //     "state": "approved",
                    //     "create_time": "2016-10-03T13:33:33Z",
                    //     "intent": "sale"
                    //   }
                    // }
                  },
                  (error) => {
                    console.log("error line 81", error);
                    this.onDismiss();
                    // Error or render dialog closed without being successful
                  }
                );
              },
              (error) => {
                console.log("error line 87", error);
                this.onDismiss();
                // Error in configuration
              }
            );
        },
        (error) => {
          console.log("error line 93", error);
          this.onDismiss();
          // Error in initialization, maybe PayPal isn't supported or something else
        }
      );
  }
}

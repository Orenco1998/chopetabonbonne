// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  serverUrl: "https://admin.chopetabonbonne.com/api",
  appUrl: "https://admin.chopetabonbonne.com",
  appImageUrl: "https://admin.chopetabonbonne.com/assets/imgs/ionshop.png",
  appId: "sPeZcLKmlD",
  fbId: "2829332840656457",
  stripePublicKey: "pk_test_A40nEIAynX1odTMJRcjXUidH00esvTLsj4",
  androidHeaderColor: "#222428",
  defaultLang: "fr",
  googleClientId:
    "207102407610-4k77argf2eme9tpa4nukpopn3e1lspdk.apps.googleusercontent.com",
  currency: {
    code: "EUR",
    display: "symbol",
    digitsInfo: "1.2-2",
  },
  firebaseConfig: {
    apiKey: "AIzaSyC1JcY9h4OSFTqK9rACa_PwRwi1yyzaeVU",
    authDomain: "ionshop-d7e73.firebaseapp.com",
    projectId: "ionshop-d7e73",
    storageBucket: "ionshop-d7e73.appspot.com",
    messagingSenderId: "207102407610",
    appId: "1:207102407610:web:f74f612bfa8e8b2fa46383",
    measurementId: "G-HEBMHK74MC",
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

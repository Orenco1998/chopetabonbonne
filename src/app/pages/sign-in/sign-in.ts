import { Component, Injector, Input } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { BasePage } from "../base-page/base-page";
import { User } from "../../services/user";
import { Facebook, FacebookLoginResponse } from "@ionic-native/facebook/ngx";
import { ForgotPasswordPage } from "../forgot-password/forgot-password";
import { SocialAuthService, GoogleLoginProvider } from "angularx-social-login";
import { GooglePlus } from "@ionic-native/google-plus/ngx";
import { Subscription } from "rxjs";
import {
  SignInWithApple,
  ASAuthorizationAppleIDRequest,
} from "@ionic-native/sign-in-with-apple/ngx";
import { Device } from "@ionic-native/device/ngx";
import { environment } from "src/environments/environment";
import { AppConfigService } from "src/app/services/app-config";
import Utils from "src/app/utils/utils";
import { AngularFireAuth } from "@angular/fire/auth";
import firebase from "firebase";

@Component({
  selector: "page-sign-in",
  templateUrl: "./sign-in.html",
  styleUrls: ["./sign-in.scss"],
})
export class SignInPage extends BasePage {
  public form: FormGroup;

  @Input() showLoginForm: boolean;
  @Input() showSignUpForm: boolean;

  public isSignInViaFacebook: boolean = false;
  public isSignInViaGoogle: boolean = false;
  public isSignInViaApple: boolean = false;
  public isSignInViaUsername: boolean = false;

  public isAppleSignInAvailable: boolean = false;

  public isSignUpLoading: boolean = false;

  public showPass: boolean;

  public googleSubscription: Subscription;

  public isFacebookLoginEnabled: boolean;
  public isGoogleLoginEnabled: boolean;
  public isAppleLoginEnabled: boolean;

  public isLoadingConfig: boolean;

  constructor(
    injector: Injector,
    private fb: Facebook,
    private authService: SocialAuthService,
    private googlePlus: GooglePlus,
    private signInWithApple: SignInWithApple,
    private device: Device,
    private appConfigService: AppConfigService,
    private fireAuth: AngularFireAuth,
    private userService: User
  ) {
    super(injector);
  }

  ngOnInit() {
    const deviceVersion = parseInt(this.device.version);
    this.isAppleSignInAvailable =
      deviceVersion >= 13 && this.isCordova() && this.isIos();

    if (this.showLoginForm) {
      this.setupLoginForm();
    } else if (this.showSignUpForm) {
      this.setupSignUpForm();
    }

    this.googleSubscription = this.authService.authState.subscribe((user) => {
      if (user) {
        this.loggedIntoGoogle(user);
      }
    });

    this.loadAppConfig();
  }

  ngOnDestroy() {
    this.googleSubscription.unsubscribe();
  }

  enableMenuSwipe() {
    return false;
  }

  onDismiss() {
    this.modalCtrl.dismiss();
  }

  async loadAppConfig() {
    try {
      this.isLoadingConfig = true;
      const config = await this.appConfigService.load();
      this.isFacebookLoginEnabled = config?.auth?.isFacebookLoginEnabled;
      this.isGoogleLoginEnabled = config?.auth?.isGoogleLoginEnabled;
      this.isAppleLoginEnabled = config?.auth?.isAppleLoginEnabled;
      this.isLoadingConfig = false;
    } catch (error) {
      this.isLoadingConfig = false;
    }
  }

  onLoginButtonTouched() {
    this.showLoginForm = true;
    this.showSignUpForm = false;
    this.setupLoginForm();
  }

  onSignUpButtonTouched() {
    this.showLoginForm = false;
    this.showSignUpForm = true;
    this.setupSignUpForm();
  }

  setupLoginForm() {
    this.form = new FormGroup({
      username: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required),
    });
  }

  setupSignUpForm() {
    this.form = new FormGroup({
      name: new FormControl("", Validators.required),
      username: new FormControl("", Validators.required),
      email: new FormControl(""),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  onFacebookButtonTouched() {
    if (!this.isHybrid()) {
      this.userService
        .loginViaFacebook()
        .then((user: User) => this.loggedViaFacebook(user))
        .catch((e) => console.log("Error logging into Facebook", e));
    } else {
      this.fb
        .login(["email", "public_profile"])
        .then((res: FacebookLoginResponse) => this.loggedIntoFacebook(res))
        .catch((e) => console.log("Error logging into Facebooks", e));
    }
  }

  async loggedIntoFacebook(res: FacebookLoginResponse) {
    console.log("res", res);
    // const credential = firebase.auth.FacebookAuthProvider.credential(
    //   res.authResponse.accessToken
    // );
    // //Recup email
    // const userCredentials = await this.fireAuth.signInWithCredential(
    //   credential
    // );
    let expirationDate = new Date();
    expirationDate.setSeconds(
      expirationDate.getSeconds() + res.authResponse.expiresIn
    );

    const expirationDateFormatted = expirationDate.toISOString();

    const facebookAuthData = {
      id: res.authResponse.userID,
      access_token: res.authResponse.accessToken,
      expiration_date: expirationDateFormatted,
    };

    try {
      await this.showLoadingView({ showOverlay: false });
      this.isSignInViaFacebook = true;

      const user = await this.userService.loginWith("facebook", {
        authData: facebookAuthData,
      });

      this.loggedViaFacebook(user);
      console.log("user", user);
      this.isSignInViaFacebook = false;
    } catch (error) {
      this.loginViaFacebookFailure(error);
      this.isSignInViaFacebook = false;
    }
  }

  loginViaFacebookFailure(error: any) {
    console.log("Error logging into Facebook", error);
    let msg = error.toString();

    if (msg.lastIndexOf("already") > 0) {
      msg = msg.substr(msg.lastIndexOf(":") + 1);
      this.showToast(msg);
      return;
    }
    this.translate.get("ERROR_NETWORK").subscribe((str) => this.showToast(str));
    this.showContentView();
  }

  loggedViaFacebook(user: User) {
    this.showContentView();

    const transParams = { name: user.attributes.name };
    console.log("user", user);
    this.translate
      .get("LOGGED_IN_AS", transParams)
      .subscribe((str) => this.showToast(str));
    console.log("user", user);
    window.dispatchEvent(
      new CustomEvent("user:login", {
        detail: user,
      })
    );

    this.onDismiss();
  }

  async onGoogleButtonTouched() {
    if (this.isHybrid()) {
      try {
        const res = await this.googlePlus.login({
          webClientId: environment.googleClientId,
        });
        this.loggedIntoGoogle({
          id: res.userId,
          authToken: res.accessToken,
          idToken: res.idToken,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
    }
  }

  async loggedIntoGoogle(res: any) {
    console.log("Logged into Google", res);

    try {
      this.isSignInViaGoogle = true;

      const authData = {
        id: res.id,
        access_token: res.authToken,
        id_token: res.idToken,
      };

      const credential = res.authToken
        ? firebase.auth.GoogleAuthProvider.credential(
            res.idToken,
            res.authToken
          )
        : firebase.auth.GoogleAuthProvider.credential(res.idToken);
      //Recup email
      const userCredentials = await this.fireAuth.signInWithCredential(
        credential
      );

      const user = await this.userService.loginWith("google", {
        authData,
      });
      user.email = userCredentials.user.email;

      this.isSignInViaGoogle = false;

      const transParams = { name: user.name };

      this.translate
        .get("LOGGED_IN_AS", transParams)
        .subscribe((str) => this.showToast(str));

      this.onDismiss();

      window.dispatchEvent(
        new CustomEvent("user:login", {
          detail: user,
        })
      );
    } catch (err) {
      console.log("Error logging into Google", err);
      this.isSignInViaGoogle = false;
      let msg = err.toString();

      if (msg.lastIndexOf("already") > 0) {
        this.showToast("Cette adresse mail existe d??j??.");
        return;
      }
      this.translate
        .get("ERROR_NETWORK")
        .subscribe((str) => this.showToast("Probl??me de connexion"));
      this.showContentView();
    }
  }

  async onAppleButtonTouched() {
    try {
      this.isSignInViaApple = true;

      const res = await this.signInWithApple.signin({
        requestedScopes: [
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail,
        ],
      });

      const authData = {
        id: res.user,
        token: res.identityToken,
      };

      const extraData: any = {};

      if (res.fullName.givenName && res.fullName.familyName) {
        extraData.name = res.fullName.givenName + " " + res.fullName.familyName;
      }

      const user = await this.userService.loginWith(
        "apple",
        { authData },
        extraData
      );

      this.isSignInViaApple = false;

      const transParams = { name: user.name };

      this.translate
        .get("LOGGED_IN_AS", transParams)
        .subscribe((str) => this.showToast(str));

      this.onDismiss();

      window.dispatchEvent(
        new CustomEvent("user:login", {
          detail: user,
        })
      );
    } catch (error) {
      this.isSignInViaApple = false;
    }
  }

  async onLogin() {
    try {
      if (this.form.invalid) {
        const message = await this.getTrans("INVALID_FORM");
        return this.showToast(message);
      }

      await this.showLoadingView({ showOverlay: false });
      this.isSignInViaUsername = true;

      const formData = Object.assign({}, this.form.value);

      formData.username = formData.username.trim();
      formData.password = formData.password.trim();

      const user = await this.userService.signIn(formData);

      this.showContentView();
      this.isSignInViaUsername = false;

      const transParams = { name: user.name };
      this.translate
        .get("LOGGED_IN_AS", transParams)
        .subscribe((str) => this.showToast(str));

      this.onDismiss();

      window.dispatchEvent(
        new CustomEvent("user:login", {
          detail: user,
        })
      );
    } catch (err) {
      if (err.code === 101) {
        this.translate
          .get("INVALID_CREDENTIALS")
          .subscribe((str) => this.showToast(str));
      } else {
        this.translate
          .get("ERROR_NETWORK")
          .subscribe((str) => this.showToast(str));
      }

      this.showContentView();
      this.isSignInViaUsername = false;
    }
  }

  async onSignUp() {
    try {
      if (this.form.invalid) {
        const message = await this.getTrans("INVALID_FORM");
        return this.showToast(message);
      }

      const formData = Object.assign({}, this.form.value);

      formData.name = formData.name.trim();
      formData.username = formData.username.trim();
      formData.email = formData.email.trim();
      formData.password = formData.password.trim();

      if (formData.email === "") {
        delete formData.email;
      }

      await this.showLoadingView({ showOverlay: false });
      this.isSignUpLoading = true;

      let user = null;

      const currentUser = User.getCurrent();

      if (
        currentUser &&
        currentUser.attributes.authData &&
        currentUser.attributes.authData["anonymous"] !== undefined
      ) {
        currentUser.setUsername(formData.username);
        currentUser.setPassword(formData.password);
        delete formData.username;
        delete formData.password;

        user = await currentUser.signUp(formData);
      } else {
        user = new User();
        user.signUp(formData);
      }

      this.showContentView();
      this.isSignUpLoading = false;

      const transParams = { name: user.name };
      this.translate
        .get("LOGGED_IN_AS", transParams)
        .subscribe((str) => this.showToast(str));

      this.onDismiss();

      window.dispatchEvent(
        new CustomEvent("user:login", {
          detail: user,
        })
      );
    } catch (err) {
      this.showContentView();
      this.isSignUpLoading = false;

      if (err.code === 202) {
        this.translate
          .get("USERNAME_TAKEN")
          .subscribe((str) => this.showToast(str));
      } else if (err.code === 203) {
        this.translate
          .get("EMAIL_TAKEN")
          .subscribe((str) => this.showToast(str));
      } else if (err.code === 125) {
        this.translate
          .get("EMAIL_INVALID")
          .subscribe((str) => this.showToast(str));
      } else {
        this.translate
          .get("ERROR_NETWORK")
          .subscribe((str) => this.showToast(str));
      }
    }
  }

  async onForgotPasswordButtonTouched() {
    await this.showLoadingView({ showOverlay: true });

    const modal = await this.modalCtrl.create({
      component: ForgotPasswordPage,
    });

    await modal.present();

    this.showContentView();
  }
}

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { SharePage } from "./share.page";
import { TranslateModule } from "@ngx-translate/core";
import { ShareButtonModule } from "@ngx-share/button";
import { ModalIntroductionComponent } from "./modal-introduction/modal-introduction.component";

@NgModule({
  imports: [CommonModule, IonicModule, TranslateModule, ShareButtonModule],
  declarations: [SharePage, ModalIntroductionComponent],
  entryComponents: [SharePage, ModalIntroductionComponent],
})
export class SharePageModule {}

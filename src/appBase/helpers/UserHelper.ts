import { ApiHelper } from "./ApiHelper"
import { UserInterface, UserContextInterface, IPermission, PersonInterface, LoginUserChurchInterface } from "../interfaces";

export class UserHelper {
  static currentUserChurch: LoginUserChurchInterface;
  static userChurches: LoginUserChurchInterface[];
  static user: UserInterface;
  static churchChanged: boolean = false;
  static person: PersonInterface;

  static selectChurch = async (context?: UserContextInterface, churchId?: string, keyName?: string) => {
    let userChurch = null;

    if (churchId) {
      UserHelper.userChurches.forEach(uc => {
        if (uc.church.id === churchId) userChurch = uc;
      });
    }
    else if (keyName) UserHelper.userChurches.forEach(uc => { if (uc.church.subDomain === keyName) userChurch = uc; });
    else userChurch = UserHelper.userChurches[0];
    if (!userChurch) return;
    else {
      UserHelper.currentUserChurch = userChurch;
      UserHelper.setupApiHelper(UserHelper.currentUserChurch);
      // TODO - remove context code from here and perform the logic in the component itself.
      if (context) {
        if (context.userChurch !== null) UserHelper.churchChanged = true;
        context.setUserChurch(UserHelper.currentUserChurch);
      }
    }
  }

  static setupApiHelper(userChurch: LoginUserChurchInterface) {
    ApiHelper.setDefaultPermissions(userChurch.jwt);
    userChurch.apis.forEach(api => { ApiHelper.setPermissions(api.keyName, api.jwt, api.permissions); });
  }

  static setupApiHelperNoChurch(user: LoginUserChurchInterface) {
    ApiHelper.setDefaultPermissions(user.jwt);
  }

  static checkAccess({ api, contentType, action }: IPermission): boolean {
    const permissions = ApiHelper.getConfig(api).permisssions;

    let result = false;
    if (permissions !== undefined) {
      permissions.forEach(element => {
        if (element.contentType === contentType && element.action === action) result = true;
      });
    }
    return result;
  }

  static createAppUrl(appUrl: string, returnUrl: string) {
    const jwt = ApiHelper.getConfig("MembershipApi").jwt;

    return `${appUrl}/login/?jwt=${jwt}&returnUrl=${returnUrl}`;
  }
}

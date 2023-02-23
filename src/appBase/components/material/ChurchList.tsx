import React from "react";
import { LoginUserChurchInterface, UserContextInterface } from "../../interfaces";
import { UserHelper } from "../../helpers/UserHelper";
import { NavItem } from "./NavItem";

export interface Props { userChurches: LoginUserChurchInterface[], currentUserChurch: LoginUserChurchInterface, context: UserContextInterface }

export const ChurchList: React.FC<Props> = props => {

  if (props.userChurches.length < 2) return <></>;
  else {
    let result: JSX.Element[] = [];
    const userChurches = props.userChurches.filter(uc => uc.apis.length > 0)
    userChurches.forEach(uc => {
      const userChurch = uc;
      const churchName = uc.church.name;
      result.push(<NavItem key={userChurch.church.id} selected={(uc.church.id === props.currentUserChurch.church.id) && true} onClick={() => UserHelper.selectChurch(props.context, userChurch.church.id, null)} label={churchName} icon="church" />);
    });

    return <>{result}</>;
  }
};

import React from "react";
import { ApiHelper } from "../../helpers/ApiHelper";
import { UserHelper } from "../../helpers/UserHelper";
import { NavItem } from "./NavItem";
import { CommonEnvironmentHelper } from "../../helpers/CommonEnvironmentHelper";
import { LoginUserChurchInterface } from "../../interfaces";

export interface Props { appName: string; currentUserChurch: LoginUserChurchInterface; router?: any; }

export const AppList: React.FC<Props> = props => {
  const jwt = ApiHelper.getConfig("MembershipApi").jwt;
  const churchId = UserHelper.currentUserChurch.church.id;
  return (
    <>
      <NavItem url={`${CommonEnvironmentHelper.ChumsRoot}/login?jwt=${jwt}&churchId=${churchId}`} selected={props.appName === "CHUMS"} external={true} label="Chums" icon="logout" router={props.router} />
      <NavItem url={`${CommonEnvironmentHelper.StreamingLiveRoot.replace("{key}", props.currentUserChurch.church.subDomain)}/login?jwt=${jwt}&churchId=${churchId}`} selected={props.appName === "StreamingLive"} external={true} label="StreamingLive" icon="logout" router={props.router} />
      <NavItem url={`${CommonEnvironmentHelper.B1Root.replace("{key}", props.currentUserChurch.church.subDomain)}/login?jwt=${jwt}&churchId=${churchId}`} selected={props.appName === "B1.church"} external={true} label="B1.Church" icon="logout" router={props.router} />
      <NavItem url={`${CommonEnvironmentHelper.LessonsRoot}/login?jwt=${jwt}&churchId=${churchId}`} selected={props.appName === "Lessons.church"} external={true} label="Lessons.church" icon="logout" router={props.router} />
    </>
  );
}

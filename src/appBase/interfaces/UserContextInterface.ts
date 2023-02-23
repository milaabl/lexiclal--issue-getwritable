import { LoginUserChurchInterface, UserInterface } from "./Access";
import { PersonInterface } from "./Membership";

export interface UserContextInterface {
  user: UserInterface,
  setUser: (user: UserInterface) => void,
  person: PersonInterface,
  setPerson: (person: PersonInterface) => void,
  userChurch: LoginUserChurchInterface,
  setUserChurch: (userChurch: LoginUserChurchInterface) => void,
  userChurches: LoginUserChurchInterface[],
  setUserChurches: (userChurches: LoginUserChurchInterface[]) => void,
}

import React from "react";
import { SmallButton } from "../SmallButton";
import { PrivateMessageInterface, UserContextInterface } from "../../interfaces";
import { Notes } from "../notes/Notes";

interface Props {
  context: UserContextInterface;
  privateMessage: PrivateMessageInterface;
  onBack: () => void
}

export const PrivateMessageDetails: React.FC<Props> = (props) => (
  <>
    <div style={{ paddingLeft: 10, paddingRight: 10, paddingBottom: 10 }}>
      <span style={{ float: "right" }}>
        <SmallButton icon="chevron_left" text="Back" onClick={props.onBack} />
      </span>
      Chat with {props.privateMessage.person.name.display}
    </div>
    <Notes context={props.context} conversationId={props.privateMessage.conversationId} noDisplayBox={true} />
  </>
);


import React, { useState } from "react";
import { ApiHelper } from "../../helpers/ApiHelper";
import { Box, Stack } from "@mui/material";
import { SmallButton } from "../SmallButton";
import { PrivateMessageInterface, UserContextInterface } from "../../interfaces";
import { ArrayHelper, DateHelper, PersonHelper } from "../../helpers";
import { PrivateMessageDetails } from "./PrivateMessageDetails";
import { NewPrivateMessage } from "./NewPrivateMessage";

interface Props {
  context: UserContextInterface;
}

export const PrivateMessages: React.FC<Props> = (props) => {

  const [privateMessages, setPrivateMessages] = useState<PrivateMessageInterface[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<PrivateMessageInterface>(null);
  const [inAddMode, setInAddMode] = useState(false);

  const loadData = async () => {
    const pms: PrivateMessageInterface[] = await ApiHelper.get("/privateMessages", "MessagingApi");
    const peopleIds: string[] = [];
    pms.forEach(pm => {
      const personId = (pm.fromPersonId === props.context.person.id) ? pm.toPersonId : pm.fromPersonId;
      if (peopleIds.indexOf(personId) === -1) peopleIds.push(personId);
    });
    if (peopleIds.length > 0) {
      const people = await ApiHelper.get("/people/ids?ids=" + peopleIds.join(","), "MembershipApi");
      pms.forEach(pm => {
        const personId = (pm.fromPersonId === props.context.person.id) ? pm.toPersonId : pm.fromPersonId;
        pm.person = ArrayHelper.getOne(people, "id", personId);
      })
    }
    setPrivateMessages(pms);
  }

  React.useEffect(() => { loadData(); }, []); //eslint-disable-line

  const getMainLinks = () => {
    let result: JSX.Element[] = [];
    privateMessages.forEach(pm => {

      const person = pm.person;
      const message = pm.conversation.messages[0];
      const photoUrl = PersonHelper.getPhotoUrl(person);

      let datePosted = new Date(message.timeUpdated || message.timeSent);
      const displayDuration = DateHelper.getDisplayDuration(datePosted);
      const contents = message.content?.split("\n")[0];
      const privateMessage = pm;
      result.push(
        <div className="note" style={{ cursor: "pointer" }} onClick={(e) => { e.preventDefault(); setSelectedMessage(privateMessage) }}>
          <div className="postedBy">
            <img src={photoUrl} alt="avatar" />
          </div>
          <Box sx={{ width: "100%" }} className="note-contents">
            <Stack direction="row" justifyContent="space-between">
              <div>
                <b>{person.name?.display}</b> · <span className="text-grey">{displayDuration}</span>
                <p style={{ maxHeight: 20, overflowY: "hidden" }}>{contents}</p>
              </div>
            </Stack>
          </Box>
        </div>
      );
    })
    return result;
  }

  const handleBack = () => {
    setInAddMode(false);
    setSelectedMessage(null);
    loadData();
  }

  if (inAddMode) return <NewPrivateMessage context={props.context} onSelectMessage={(pm: PrivateMessageInterface) => { setSelectedMessage(pm); setInAddMode(false); }} onBack={handleBack} />
  if (selectedMessage) return <PrivateMessageDetails privateMessage={selectedMessage} context={props.context} onBack={handleBack} />
  else return (
    <>
      <span style={{ float: "right" }}>
        <SmallButton icon="add" onClick={() => { setInAddMode(true) }} />
      </span>

      {getMainLinks()}
    </>
  );
};

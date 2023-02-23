import React from "react";
import { Note } from "./Note";
import { AddNote } from "./AddNote";
import { DisplayBox, Loading } from "../";
import { ApiHelper, ArrayHelper } from "../../helpers";
import { MessageInterface, UserContextInterface } from "../../interfaces";

interface Props {
  //showEditNote: (messageId?: string) => void;
  conversationId: string;
  createConversation?: () => Promise<string>;
  noDisplayBox?: boolean;
  context: UserContextInterface;
}

export function Notes(props: Props) {

  const [messages, setMessages] = React.useState<MessageInterface[]>(null)
  const [editMessageId, setEditMessageId] = React.useState(null)

  const loadNotes = async () => {
    const messages: MessageInterface[] = (props.conversationId) ? await ApiHelper.get("/messages/conversation/" + props.conversationId, "MessagingApi") : [];
    if (messages.length > 0) {
      const peopleIds = ArrayHelper.getIds(messages, "personId");
      const people = await ApiHelper.get("/people/ids?ids=" + peopleIds.join(","), "MembershipApi");
      messages.forEach(n => {
        n.person = ArrayHelper.getOne(people, "id", n.personId);
      })
    }
    setMessages(messages);
    setEditMessageId(null);
  };

  const getNotes = () => {
    if (!messages) return <Loading />
    if (messages.length === 0) return <></>
    else {
      let noteArray: React.ReactNode[] = [];
      for (let i = 0; i < messages.length; i++) noteArray.push(<Note message={messages[i]} key={messages[i].id} showEditNote={setEditMessageId} />);
      return noteArray;
    }
  }

  React.useEffect(() => { loadNotes() }, [props.conversationId]); //eslint-disable-line

  let result = <>
    {getNotes()}
    {messages && (<AddNote context={props.context} conversationId={props.conversationId} onUpdate={loadNotes} createConversation={props.createConversation} messageId={editMessageId} />)}
  </>
  if (props.noDisplayBox) return result;
  else return (<DisplayBox id="notesBox" data-cy="notes-box" headerIcon="sticky_note_2" headerText="Notes">{result}</DisplayBox>);
};

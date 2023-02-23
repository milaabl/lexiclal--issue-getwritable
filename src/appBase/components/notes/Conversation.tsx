import { Box, Paper, Stack } from "@mui/material";
import React from "react";
import { ApiHelper, ArrayHelper, DateHelper, PersonHelper } from "../../helpers";
import { ConversationInterface, MessageInterface, UserContextInterface } from "../../interfaces";
import { AddNote } from "./AddNote";
import { Note } from "./Note";

interface Props {
  conversation: ConversationInterface;
  context: UserContextInterface;
}

export function Conversation(props: Props) {
  const [conversation, setConversation] = React.useState<ConversationInterface>(null)
  const [editMessageId, setEditMessageId] = React.useState(null)

  const loadNotes = async () => {
    const messages: MessageInterface[] = (conversation.id) ? await ApiHelper.get("/messages/conversation/" + conversation.id, "MessagingApi") : [];
    if (messages.length > 0) {
      const peopleIds = ArrayHelper.getIds(messages, "personId");
      const people = await ApiHelper.get("/people/ids?ids=" + peopleIds.join(","), "MembershipApi");
      messages.forEach(n => {
        n.person = ArrayHelper.getOne(people, "id", n.personId);
      })
    }
    const c = { ...conversation }
    c.messages = messages;
    setConversation(c);
    setEditMessageId(null);
  };

  React.useEffect(() => { setConversation(props.conversation) }, [props.conversation]); //eslint-disable-line

  if (conversation === null) return null;
  else {
    const message = conversation.messages[0];
    const photoUrl = PersonHelper.getPhotoUrl(message.person);
    let datePosted = new Date(message.timeUpdated || message.timeSent);
    const displayDuration = DateHelper.getDisplayDuration(datePosted);

    const isEdited = message.timeUpdated && message.timeUpdated !== message.timeSent && <>(edited)</>;
    const contents = message.content?.split("\n");

    const getNotes = () => {
      let noteArray: React.ReactNode[] = [];
      for (let i = 1; i < conversation.messages.length; i++) noteArray.push(<Note message={conversation.messages[i]} key={conversation.messages[i].id} showEditNote={setEditMessageId} />);
      return noteArray;
    }

    return (
      <Paper sx={{ padding: 1, marginBottom: 2 }}>
        <div className="conversation">
          <div className="postedBy">
            <img src={photoUrl} alt="avatar" />
          </div>
          <Box sx={{ width: "100%" }} className="conversationContents">
            <Stack direction="row" justifyContent="space-between">
              <div>
                <b>{message.person?.name?.display}</b> · <span className="text-grey">{displayDuration}{isEdited}</span>
                {contents.map((c, i) => c ? <p key={i}>{c}</p> : <br />)}
              </div>
            </Stack>
          </Box>
        </div>
        <div className="commentCount">
          <div>{(conversation.postCount === 1) ? "1 comment" : conversation.postCount + " comments"}</div>
          {(conversation.postCount > conversation.messages.length) ? <a href="about:blank" onClick={(e) => { e.preventDefault(); loadNotes(); }}>View all {conversation.postCount} comments</a> : <>&nbsp;</>}
        </div>
        <div className="messages">
          {getNotes()}
          <AddNote context={props.context} conversationId={props.conversation.id} onUpdate={loadNotes} createConversation={async () => (props.conversation.id)} messageId={editMessageId} />
        </div>

      </Paper>
    );
  }
};

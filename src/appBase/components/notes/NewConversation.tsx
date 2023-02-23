import { Icon, Paper, Stack, TextField } from "@mui/material";
import React from "react";
import { ApiHelper, PersonHelper } from "../../helpers";
import { ConversationInterface, MessageInterface, UserContextInterface } from "../../interfaces";
import { ErrorMessages } from "../ErrorMessages";
import { SmallButton } from "../SmallButton";

interface Props {
  contentType: string;
  contentId: string;
  groupId: string;
  visibility: "public" | "hidden";
  context: UserContextInterface;
  onUpdate: () => void;
}

export function NewConversation({ context, ...props }: Props) {
  const [message, setMessage] = React.useState<MessageInterface>({})
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setErrors([]);
    const m = { ...message } as MessageInterface;
    m.content = e.target.value;
    setMessage(m);
  }

  const validate = () => {
    const result = [];
    if (!message.content.trim()) result.push("Please enter a note.");
    setErrors(result);
    return result.length === 0;
  }

  async function handleSave() {
    if (validate()) {
      setIsSubmitting(true);

      const conv: ConversationInterface = { contentType: props.contentType, contentId: props.contentId, title: props.contentType + " " + props.contentId + " Conversation", groupId: props.groupId, visibility: props.visibility, allowAnonymousPosts: false }
      const result = await ApiHelper.post("/conversations", [conv], "MessagingApi");
      const cId = result[0].id;

      const m = { ...message };
      m.conversationId = cId;
      ApiHelper.post("/messages", [m], "MessagingApi")
        .then(() => {
          props.onUpdate();
          const m = { ...message } as MessageInterface;
          m.content = "";
          setMessage(m);
        })
        .finally(() => { setIsSubmitting(false); });

    }
  };

  const image = PersonHelper.getPhotoUrl(context?.person)

  return (
    <Paper sx={{ padding: 1, marginBottom: 2 }}>
      <ErrorMessages errors={errors} />

      <Stack direction="row" spacing={1.5} style={{ marginTop: 15 }} justifyContent="end">

        {image ? <img src={image} alt="user" style={{ width: 60, height: 45, borderRadius: 5, marginLeft: 8 }} /> : <Icon>person</Icon>}
        <Stack direction="column" spacing={2} style={{ width: "100%" }} justifyContent="end">
          <div><b>{context?.person?.name?.display}</b></div>
          <TextField fullWidth name="noteText" aria-label={"Start a conversation"} placeholder="Start a conversation" multiline style={{ marginTop: 0, border: "none" }} variant="standard" onChange={handleChange} value={message.content} />
        </Stack>
        <Stack direction="column" spacing={1} justifyContent="end">
          <SmallButton icon="send" onClick={handleSave} disabled={isSubmitting} />
        </Stack>
      </Stack>
    </Paper>
  );

};

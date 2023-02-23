import React, { useState, useEffect } from "react"
import { ApiHelper, PersonHelper } from "../../helpers"
import { MessageInterface, UserContextInterface } from "../../interfaces"
import { Icon, Stack, TextField } from "@mui/material"
import { ErrorMessages } from "../ErrorMessages"
import { SmallButton } from "../SmallButton"

type Props = {
  messageId?: string;
  onUpdate: () => void;
  createConversation: () => Promise<string>;
  conversationId?: string;
  context: UserContextInterface
};

export function AddNote({ context, ...props }: Props) {
  const [message, setMessage] = useState<MessageInterface>()
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const headerText = props.messageId ? "Edit note" : "Add a note"

  useEffect(() => {
    if (props.messageId) ApiHelper.get(`/messages/${props.messageId}`, "MessagingApi").then(n => setMessage(n));
    else setMessage({ conversationId: props.conversationId, content: "" });
    return () => {
      setMessage(null);
    };
  }, [props.messageId, props.conversationId])

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
      let cId = props.conversationId;
      if (!cId) cId = await props.createConversation();

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

  async function deleteNote() {
    await ApiHelper.delete(`/messages/${props.messageId}`, "MessagingApi")
    props.onUpdate()
  }

  const deleteFunction = props.messageId ? deleteNote : null;

  const image = PersonHelper.getPhotoUrl(context?.person)

  return (
    <>
      <ErrorMessages errors={errors} />

      <Stack direction="row" spacing={1.5} style={{ marginTop: 15 }} justifyContent="end">

        {image ? <img src={image} alt="user" style={{ width: 60, height: 45, borderRadius: 5, marginLeft: 8 }} /> : <Icon>person</Icon>}
        <Stack direction="column" spacing={2} style={{ width: "100%" }} justifyContent="end">
          <div><b>{context?.person?.name?.display}</b></div>
          <TextField fullWidth name="noteText" aria-label={headerText} placeholder="Add a note" multiline style={{ marginTop: 0, border: "none" }} variant="standard" onChange={handleChange} value={message?.content} />
        </Stack>
        <Stack direction="column" spacing={1} justifyContent="end">
          <SmallButton icon="send" onClick={handleSave} />
          {deleteFunction && <SmallButton icon="delete" onClick={deleteFunction} disabled={isSubmitting} />}
        </Stack>
      </Stack>
    </>
  );
}

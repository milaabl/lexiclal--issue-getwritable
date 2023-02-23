import { Button, TextField, TableRow, TableCell, Table, TableBody } from "@mui/material";
import React from "react";
import { ApiHelper, PersonHelper } from "../../helpers";
import { ConversationInterface, PersonInterface, PrivateMessageInterface, UserContextInterface } from "../../interfaces";
import { AddNote } from "../notes/AddNote";
import { SmallButton } from "../SmallButton";

interface Props {
  context: UserContextInterface;
  onSelectMessage: (pm: PrivateMessageInterface) => void
  onBack: () => void
}

export const NewPrivateMessage: React.FC<Props> = (props) => {

  const [searchText, setSearchText] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [selectedPerson, setSelectedPerson] = React.useState<PersonInterface>(null);

  const handleSubmit = (e: React.MouseEvent) => {
    if (e !== null) e.preventDefault();
    let term = escape(searchText.trim());
    ApiHelper.get("/people/search?term=" + term, "MembershipApi").then(data => setSearchResults(data));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.currentTarget.value);
    setSearchText(e.currentTarget.value);
  }

  /*
    const handleKeyDown = (e: React.KeyboardEvent<any>) => {
      //if (e.key === "Enter") { e.preventDefault(); handleSubmit(null); }
    }
  */

  const handlePersonSelected = async (person: PersonInterface) => {
    const existing: PrivateMessageInterface = await ApiHelper.get("/privateMessages/existing/" + person.id, "MessagingApi");
    if (existing.id) {
      existing.person = person;
      props.onSelectMessage(existing);
    }
    else setSelectedPerson(person);
  }

  const getPeople = () => {
    let result = [];
    for (let i = 0; i < searchResults.length; i++) {
      const p = searchResults[i];
      result.push(<TableRow key={p.id}>
        <TableCell><img src={PersonHelper.getPhotoUrl(p)} alt="avatar" /></TableCell>
        <TableCell><a href="about:blank" onClick={(e) => { e.preventDefault(); handlePersonSelected(p) }}>{p.name.display}</a></TableCell>
      </TableRow>);
    }
    return result;
  }

  const handleNoteAdded = () => {
    handlePersonSelected(selectedPerson);
  }

  const createConversation = async () => {
    const conv: ConversationInterface = { allowAnonymousPosts: false, contentType: "privateMessage", contentId: props.context.person.id, title: props.context.person.name.display + " Private Message", visibility: "hidden" }
    const result: ConversationInterface[] = await ApiHelper.post("/conversations", [conv], "MessagingApi");

    const pm: PrivateMessageInterface = {
      fromPersonId: props.context.person.id,
      toPersonId: selectedPerson.id,
      conversationId: result[0].id
    }
    const privateMessages: PrivateMessageInterface[] = await ApiHelper.post("/privateMessages", [pm], "MessagingApi");
    return privateMessages[0].conversationId;
  }

  if (!selectedPerson) return (
    <div style={{ paddingLeft: 10, paddingRight: 10 }}>
      <span style={{ float: "right" }}>
        <SmallButton icon="chevron_left" text="Back" onClick={props.onBack} />
      </span>
      <b>New Private Message</b>
      <div>Search for a person</div>

      <TextField fullWidth label="Name" id="searchText" data-cy="search-input" name="searchText" type="text" placeholder="Name" value={searchText} onChange={handleChange}
        InputProps={{ endAdornment: <Button variant="contained" id="searchButton" data-cy="search-button" onClick={handleSubmit}>Search</Button> }}
      />
      <br />
      <Table id="smallPeopleTable" size="small">
        <TableBody>{getPeople()}</TableBody>
      </Table>
    </div>
  );
  else {
    return (
      <div style={{ paddingLeft: 10, paddingRight: 10 }}>
        <span style={{ float: "right" }}>
          <SmallButton icon="chevron_left" text="Back" onClick={props.onBack} />
        </span>
        <b>New Private Message</b>
        <div>To: {selectedPerson.name.display}</div>
        <AddNote context={props.context} conversationId={null} onUpdate={handleNoteAdded} createConversation={createConversation} />
      </div>
    )
  }
}

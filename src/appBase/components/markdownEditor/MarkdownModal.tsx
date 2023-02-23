import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { MarkdownPreview } from "./MarkdownPreview";

interface Props {
  hideModal: (newValue: string) => void
  value?: string;
}

export const MarkdownModal: React.FC<Props> = (props) => {

  const [value, setValue] = useState("");

  React.useEffect(() => { setValue(props.value) }, [props.value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.preventDefault();
    setValue(e.target.value);
  }

  const getModalContent = () => {
    const guideLink = <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer" style={{ float: "right" }}>Markdown Guide</a>
    return (
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <TextField fullWidth multiline label={<>Content &nbsp; {guideLink}</>} name="modalMarkdown" className="modalMarkdown" InputProps={{ style: { height: "80vh" } }} value={value} onChange={handleChange} placeholder="" />
        </Grid>
        <Grid item xs={6}>
          <div style={{ border: "1px solid #BBB", borderRadius: 5, marginTop: 15, padding: 10, height: "80vh", overflowY: "scroll" }} id="markdownPreview">
            <div style={{ marginTop: -20, marginBottom: -10, position: "absolute" }}><span style={{ backgroundColor: "#FFFFFF", color: "#999", fontSize: 13 }}> &nbsp; Preview &nbsp; </span></div>
            <MarkdownPreview value={value} />
          </div>
        </Grid>
      </Grid>
    )
  }

  return (<Dialog open={true} onClose={() => { props.hideModal(value) }} fullScreen={true}>
    <DialogTitle>Markdown Editor</DialogTitle>
    <DialogContent>
      {getModalContent()}
    </DialogContent>
    <DialogActions sx={{ paddingX: "16px", paddingBottom: "12px" }}>
      <Button variant="outlined" onClick={(e) => { e.preventDefault(); props.hideModal(value) }}>Close</Button>
    </DialogActions>
  </Dialog>)
};

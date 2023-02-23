import { FileHelper, ApiHelper } from "../../helpers";
import { CommonEnvironmentHelper } from "../../helpers/CommonEnvironmentHelper";
import { } from "../../helpers";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import { ImageEditor } from "../ImageEditor";
import { TabPanel } from "../TabPanel";
import { StockPhotos } from "./StockPhotos";

interface Props {
  aspectRatio: number,
  onClose: () => void,
  onSelect: (img: string) => void
}

export const GalleryModal: React.FC<Props> = (props: Props) => {
  const [images, setImages] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = React.useState(0);
  const [aspectRatio, setAspectRatio] = React.useState(Math.round(props.aspectRatio * 100) / 100);
  const [editorPhotoUrl, setEditorPhotoUrl] = React.useState("");

  const handleTabChange = (el: any, newValue: any) => { setTabIndex(newValue); }

  const loadData = () => { ApiHelper.get("/gallery/" + aspectRatio.toString(), "ContentApi").then(data => setImages(data.images)); }

  const handleImageUpdated = async (dataUrl: string) => {
    const fileName = Math.floor(Date.now() / 1000).toString() + ".jpg"
    const blob = FileHelper.dataURLtoBlob(dataUrl);
    const file = new File([blob], "file_name");

    const params = { folder: aspectRatio.toString(), fileName };
    const presigned = await ApiHelper.post("/gallery/requestUpload", params, "ContentApi");
    const doUpload = presigned.key !== undefined;
    if (doUpload) await FileHelper.postPresignedFile(presigned, file, () => { });
    //return doUpload;
    setTabIndex(0);
    loadData();
  };

  React.useEffect(() => { if (aspectRatio !== props.aspectRatio) setAspectRatio(Math.round(props.aspectRatio * 100) / 100) }, [props.aspectRatio]); //eslint-disable-line
  React.useEffect(loadData, [aspectRatio]); //eslint-disable-line

  const getImages = () => {
    let result: JSX.Element[] = [];
    images.forEach(img => {
      result.push(<Grid item md={4} xs={12}>
        <a href="about:blank" onClick={(e) => { e.preventDefault(); props.onSelect(CommonEnvironmentHelper.ContentRoot + "/" + img) }}>
          <img src={CommonEnvironmentHelper.ContentRoot + "/" + img} className="img-fluid" alt="custom" />
        </a>
      </Grid>);
    })
    return result;
  }

  const handleStockSelect = (url: string) => {
    setEditorPhotoUrl(url);
    setTabIndex(1);
  }

  return (<>
    <Dialog open={true} onClose={props.onClose}>
      <DialogTitle>Select a Photo</DialogTitle>
      <DialogContent style={{ minWidth: 600 }}>

        <Tabs variant="fullWidth" value={tabIndex} onChange={handleTabChange}>
          <Tab label="Gallery" />
          <Tab label="Upload" />
          <Tab label="Stock Photos" />
        </Tabs>
        <TabPanel value={tabIndex} index={0}>
          {(props.aspectRatio === 0) && (
            <FormControl fullWidth>
              <InputLabel>Aspect Ratio</InputLabel>
              <Select size="small" label="Aspect Ratio" name="aspectRatio" value={aspectRatio} onChange={(e) => setAspectRatio(parseFloat(e.target.value.toString()))}>
                <MenuItem value="0">Free Form</MenuItem>
                <MenuItem value="1">1:1</MenuItem>
                <MenuItem value="2">2:1</MenuItem>
                <MenuItem value="4">4:1</MenuItem>
                <MenuItem value="1.33">4:3</MenuItem>
                <MenuItem value="1.78">16:9</MenuItem>
                <MenuItem value="0.5">1:2</MenuItem>
                <MenuItem value="0.5625">9:16</MenuItem>
              </Select>
            </FormControl>
          )}
          <Grid container spacing={3} alignItems="center">
            {getImages()}
          </Grid>
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <ImageEditor onUpdate={handleImageUpdated} photoUrl={editorPhotoUrl} aspectRatio={aspectRatio} outputWidth={1280} outputHeight={768} hideDelete={true} />
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <StockPhotos aspectRatio={aspectRatio} onSelect={props.onSelect} onStockSelect={handleStockSelect} />
        </TabPanel>
      </DialogContent>
      <DialogActions sx={{ paddingX: "16px", paddingBottom: "12px" }}>
        <Button variant="outlined" onClick={props.onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  </>);
};

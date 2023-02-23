import { Loading, InputBox } from "@/appBase/components";
import { SermonInterface, PlaylistInterface, ApiHelper, UniqueIdHelper, DateHelper } from "@/helpers";
import { Grid, InputLabel, MenuItem, Select, TextField, FormControl, SelectChangeEvent, Button } from "@mui/material";
import React from "react";
import { Duration } from "./Duration";

interface Props {
  currentSermon: SermonInterface,
  updatedFunction?: () => void,
  showPhotoEditor: (photoType: string, url: string) => void,
  updatedPhoto: string
}

export const SermonEdit: React.FC<Props> = (props) => {

  const [currentSermon, setCurrentSermon] = React.useState<SermonInterface>(null);
  const [playlists, setPlaylists] = React.useState<PlaylistInterface[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = () => {
    ApiHelper.get("/playlists", "ContentApi").then(data => {
      setPlaylists(data);
      setIsLoading(false);
    });
  }

  const checkDelete = () => { if (!UniqueIdHelper.isMissing(currentSermon?.id)) return handleDelete; else return null; }
  const handleCancel = () => { props.updatedFunction(); }

  const handlePhotoUpdated = () => {
    if (props.updatedPhoto !== null && props.updatedPhoto !== currentSermon?.thumbnail) {
      const s = { ...currentSermon };
      s.thumbnail = props.updatedPhoto;
      props.showPhotoEditor("", null);
      setCurrentSermon(s);
    }
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you wish to delete this sermon?")) {
      ApiHelper.delete("/sermons/" + currentSermon.id, "ContentApi").then(() => { setCurrentSermon(null); props.updatedFunction(); });
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const val = e.target.value;
    let v = { ...currentSermon };
    switch (e.target.name) {
      case "title": v.title = val; break;
      case "description": v.description = val; break;
      case "publishDate": v.publishDate = DateHelper.toDate(val); break;
      case "videoType": v.videoType = val; break;
      case "playlistId": v.playlistId = val; break;
      case "videoData":
        v.videoData = val;
        if (v.videoType === "youtube") v.videoData = getYouTubeKey(v.videoData);
        else if (v.videoType === "facebook") v.videoData = getFacebookKey(v.videoData);
        else if (v.videoType === "vimeo") v.videoData = getVimeoKey(v.videoData);
        break;
    }
    setCurrentSermon(v);
  }

  //auto fix common bad formats.
  const getVimeoKey = (facebookInput: string) => {
    let result = facebookInput.split("&")[0];
    result = result
      .replace("https://vimeo.com/", "")
      .replace("https://player.vimeo.com/video/", "")
    return result;
  }

  //auto fix common bad formats.
  const getFacebookKey = (facebookInput: string) => {
    let result = facebookInput.split("&")[0];
    result = result
      .replace("https://facebook.com/video.php?v=", "")
    return result;
  }

  //auto fix common bad formats.
  const getYouTubeKey = (youtubeInput: string) => {
    let result = youtubeInput.split("&")[0];
    result = result
      .replace("https://www.youtube.com/watch?v=", "")
      .replace("https://youtube.com/watch?v=", "")
      .replace("https://youtu.be/", "")
      .replace("https://www.youtube.com/embed/", "")
      .replace("https://studio.youtube.com/video/", "")
      .replace("/edit", "");
    return result;
  }

  const handleSave = () => {
    setSermonUrl();
    ApiHelper.post("/sermons", [currentSermon], "ContentApi").then(props.updatedFunction);
  }

  const setSermonUrl = () => {
    let result = currentSermon?.videoData;
    switch (currentSermon?.videoType) {
      case "youtube_channel":
        result = "https://www.youtube.com/embed/live_stream?channel=" + currentSermon?.videoData;
        break;
      case "youtube":
        result = "https://www.youtube.com/embed/" + currentSermon?.videoData + "?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&disablekb=1";
        break;
      case "vimeo":
        result = "https://player.vimeo.com/video/" + currentSermon?.videoData + "?autoplay=1";
        break;
      case "facebook":
        result = "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fvideo.php%3Fv%3D" + currentSermon?.videoData + "&show_text=0&autoplay=1&allowFullScreen=1";
        break;
    }
    return currentSermon.videoUrl = result;
  }

  const fetchYoutube = () => {
    ApiHelper.getAnonymous("/sermons/lookup?videoType=youtube&videoData=" + currentSermon.videoData, "ContentApi").then(d => {
      let v = { ...currentSermon };
      v.title = d.title;
      v.description = d.description;
      v.thumbnail = d.thumbnail;
      v.duration = d.duration;
      console.log(v);
      setCurrentSermon(v);
    });
  }

  const getPlaylists = () => {
    let result: JSX.Element[] = [];
    playlists.forEach(playlist => {
      result.push(<MenuItem value={playlist.id}>{playlist.title}</MenuItem>);
    });
    return result;
  }

  React.useEffect(() => { setCurrentSermon(props.currentSermon); loadData(); }, [props.currentSermon]);
  React.useEffect(handlePhotoUpdated, [props.updatedPhoto, currentSermon]); //eslint-disable-line

  let keyLabel = <>Sermon Embed Url</>;
  let keyPlaceholder = "https://yourprovider.com/yoururl/"
  let endAdornment = <></>

  switch (currentSermon?.videoType) {
    case "youtube_channel":
      keyLabel = <>YouTube Channel ID <span className="description" style={{ float: "right", marginTop: 3, paddingLeft: 5 }}><a target="blank" rel="noreferrer noopener" href="https://support.google.com/youtube/answer/6180214">Get Your Channel Id</a></span></>;
      keyPlaceholder = "UCfiDl90gAfZMkgbeCqX1Wi0 - This is not your channel url";
      break;
    case "youtube":
      keyLabel = <>YouTube ID <span className="description" style={{ float: "right", marginTop: 3, paddingLeft: 5 }}>https://youtube.com/watch?v=<b style={{ color: "#24b8ff" }}>abcd1234</b></span></>;
      keyPlaceholder = "abcd1234";
      endAdornment = <Button variant="contained" onClick={fetchYoutube}>Fetch</Button>
      break;
    case "vimeo":
      keyLabel = <>Vimeo ID <span className="description" style={{ float: "right", marginTop: 3, paddingLeft: 5 }}>https://vimeo.com/<b>123456789</b></span></>;
      keyPlaceholder = "123456789";
      break;
    case "facebook":
      keyLabel = <>Sermon ID <span className="description" style={{ float: "right", marginTop: 3, paddingLeft: 5 }}>https://facebook.com/video.php?v=<b>123456789</b></span></>;
      keyPlaceholder = "123456789";
      break;
  }

  if (isLoading) return <Loading />
  else return (<InputBox headerIcon="calendar_month" headerText={(currentSermon?.permanentUrl) ? "Edit Permanent Live Url" : "Edit Sermon"} saveFunction={handleSave} cancelFunction={handleCancel} deleteFunction={checkDelete()} help="streaminglive/sermons">
    <>
      {!currentSermon?.permanentUrl && (
        <FormControl fullWidth>
          <InputLabel>Playlist</InputLabel>
          <Select label="Playlist" name="playlistId" value={currentSermon?.playlistId || ""} onChange={handleChange}>
            <MenuItem value="">None</MenuItem>
            {getPlaylists()}
          </Select>
        </FormControl>
      )}

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Video Provider</InputLabel>
            <Select label="Video Provider" name="videoType" value={currentSermon?.videoType || ""} onChange={handleChange}>
              {currentSermon?.permanentUrl && (<MenuItem value="youtube_channel">Current YouTube Live Stream</MenuItem>)}
              <MenuItem value="youtube">YouTube</MenuItem>
              <MenuItem value="vimeo">Vimeo</MenuItem>
              <MenuItem value="facebook">Facebook</MenuItem>
              <MenuItem value="custom">Custom Embed Url</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth label={keyLabel} name="videoData" value={currentSermon?.videoData || ""} onChange={handleChange} placeholder={keyPlaceholder}
            InputProps={{ endAdornment: endAdornment }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {!currentSermon?.permanentUrl && (
          <Grid item xs={6}>
            <label style={{ width: "100%" }}>Publish Date</label>
            <TextField fullWidth type="date" name="publishDate" value={(currentSermon?.publishDate) ? DateHelper.formatHtml5Date(DateHelper.toDate(currentSermon?.publishDate)) : ""} onChange={handleChange} placeholder={keyPlaceholder} />
          </Grid>
        )}
        <Grid item xs={6}>
          <label style={{ width: "100%" }}>Total Sermon Duration</label>
          <Duration totalSeconds={currentSermon?.duration || 0} updatedFunction={totalSeconds => { let s = { ...currentSermon }; s.duration = totalSeconds; setCurrentSermon(s); }} />
        </Grid>

      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={3}>
          <a href="about:blank" onClick={(e) => { e.preventDefault(); props.showPhotoEditor("sermon", currentSermon?.thumbnail || ""); }}>
            <img src={currentSermon?.thumbnail || "/images/no-image.png"} className="img-fluid" style={{ marginTop: 20 }} alt="thumbnail"></img>
          </a>
        </Grid>
        <Grid item xs={9}>
          <TextField fullWidth label="Title" name="title" value={currentSermon?.title || ""} onChange={handleChange} />
          <TextField fullWidth multiline label="Description" name="description" value={currentSermon?.description || ""} onChange={handleChange} placeholder={keyPlaceholder} />
        </Grid>
      </Grid>
    </>
  </InputBox>);
}

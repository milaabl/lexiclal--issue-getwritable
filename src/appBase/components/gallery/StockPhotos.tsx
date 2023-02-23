import { Button, Grid, TextField } from "@mui/material";
import React, { useState } from "react";
import { ApiHelper } from "../../helpers";
import { CommonEnvironmentHelper } from "../../helpers/CommonEnvironmentHelper";

interface Props {
  aspectRatio: number,
  onSelect: (img: string) => void,
  onStockSelect: (img: string) => void
}

interface SearchResult { description: string, url: string, photographer: string, photographerUrl: string, large: string, thumbnail: string }

export const StockPhotos: React.FC<Props> = (props: Props) => {
  const [images, setImages] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>(null);

  const loadData = () => { ApiHelper.getAnonymous("/gallery/stock/" + props.aspectRatio.toString(), "ContentApi").then(data => setImages(data.images)); }

  React.useEffect(loadData, [props.aspectRatio]); //eslint-disable-line

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { e.preventDefault(); setSearchText(e.currentTarget.value); }

  const handleSearch = (e: React.MouseEvent) => {
    if (e !== null) e.preventDefault();
    let term = searchText.trim();
    ApiHelper.post("/stock/search", { term: term }, "ContentApi").then((data: SearchResult[]) => { setSearchResults(data) });
  }

  const getImages = () => {
    if (searchResults) return getResults();
    else return getSuggested();
  }

  const getResults = () => {
    let result: JSX.Element[] = [];
    searchResults.forEach(p => {
      result.push(<Grid item md={4} xs={12}>
        <a href="about:blank" onClick={(e) => { e.preventDefault(); props.onStockSelect(p.large) }}>
          <img src={p.thumbnail} className="img-fluid" alt="stock" />
        </a>
        <div>
          <i style={{ fontSize: 12 }}>
            <a href={p.url} target="_blank" rel="noreferrer noopener">Photo</a> by: <a href={p.photographerUrl} target="_blank" rel="noreferrer noopener">{p.photographer}</a></i>
        </div>
      </Grid>);
    })
    return result;
  }

  const getSuggested = () => {
    let result: JSX.Element[] = [];
    images.forEach(img => {
      result.push(<Grid item md={4} xs={12}>
        <a href="about:blank" onClick={(e) => { e.preventDefault(); props.onSelect(CommonEnvironmentHelper.ContentRoot + "/" + img) }}>
          <img src={CommonEnvironmentHelper.ContentRoot + "/" + img} className="img-fluid" alt="stock" />
        </a>
      </Grid>);
    })
    return result;
  }

  return (<>
    <TextField fullWidth name="personAddText" label="Search Term" value={searchText} onChange={handleChange}
      InputProps={{ endAdornment: <Button variant="contained" id="searchButton" data-cy="search-button" onClick={handleSearch}>Search</Button> }}
    />
    {searchResults && <div>Stock photos provided by <a href="https://pexels.com">Pexels</a>.</div>}
    <Grid container spacing={3} alignItems="center">
      {getImages()}
    </Grid>

  </>);
};

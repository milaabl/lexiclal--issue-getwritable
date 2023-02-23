import { Grid, TextField } from "@mui/material";
import React from "react";

interface Props { totalSeconds: number, updatedFunction?: (totalSeconds: number) => void }

export const Duration: React.FC<Props> = (props) => {
  let min = Math.floor(props.totalSeconds / 60);
  let sec = props.totalSeconds - (min * 60);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.currentTarget.value);
    switch (e.currentTarget.name) {
      case "min": min = val; break;
      case "sec": sec = val; break;
    }
    const total = min * 60 + sec;
    props.updatedFunction(total);
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <TextField fullWidth label="Minutes" type="number" InputProps={{ inputProps: { min: 0, step: 1, max: 59 } }} name="min" value={min || ""} onChange={handleChange} />
      </Grid>
      <Grid item xs={6}>
        <TextField fullWidth label="Seconds" type="number" InputProps={{ inputProps: { min: 0, step: 1, max: 59 } }} name="sec" value={sec || ""} onChange={handleChange} />
      </Grid>
    </Grid>
  );
}

import React from "react";
import { Paper, Box, Typography, Stack, styled, Button, Icon, PaperProps } from "@mui/material";
import { HelpIcon } from "./HelpIcon";

interface Props {
  id?: string;
  children?: React.ReactNode;
  headerIcon?: string;
  headerText?: string;
  help?: string;
  saveText?: string;
  headerActionContent?: React.ReactNode;
  cancelFunction?: () => void;
  deleteFunction?: () => void;
  saveFunction: () => void;
  "data-cy"?: string;
  className?: string;
  isSubmitting?: boolean;
  ariaLabelDelete?: string;
  ariaLabelSave?: string;
  saveButtonType?: "submit" | "button";
  mainContainerCssProps?: PaperProps;
}

const CustomContextBox = styled(Box)({
  marginTop: 10,
  overflowX: "hidden",
  "& p": { color: "#666" },
  "& label": { color: "#999" },
  "& ul": { paddingLeft: 0 },
  "& li": {
    listStyleType: "none",
    marginBottom: 10,
    "& i": { marginRight: 5 }
  },
  "& td": {
    "& i": { marginRight: 5 }
  }
})

export function InputBox({ mainContainerCssProps = {}, ...props }: Props) {
  let buttons = [];
  if (props.cancelFunction) buttons.push(<Button key="cancel" onClick={props.cancelFunction} color="warning" sx={{ "&:focus": { outline: "none" } }}>Cancel</Button>);
  if (props.deleteFunction) buttons.push(<Button key="delete" id="delete" variant="outlined" aria-label={props.ariaLabelDelete} onClick={props.deleteFunction} color="error" sx={{ "&:focus": { outline: "none" } }}>Delete</Button>);
  if (props.saveFunction) buttons.push(<Button key="save" type={props.saveButtonType || "button"} variant="contained" disableElevation aria-label={props.ariaLabelSave} onClick={props.saveFunction} disabled={props.isSubmitting} sx={{ "&:focus": { outline: "none" } }}>{props.saveText || "save"}</Button>);

  let classNames = ["inputBox"];
  if (props.className) {
    classNames.push(props.className);
  }

  return (
    <Paper id={props.id} sx={{ padding: 2, marginBottom: 4 }} data-cy={props["data-cy"]} {...mainContainerCssProps}>
      {props.help && <HelpIcon article={props.help} />}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }} data-cy="header">
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {props.headerIcon && <Icon sx={{ color: "#1976d2" }}>{props.headerIcon}</Icon>}
          {props.headerText && (
            <Typography component="h2" sx={{ display: "inline-block", marginLeft: props.headerIcon ? 1 : 0 }} variant="h6" color="primary">
              {props.headerText}
            </Typography>
          )}
        </Box>
        <Box>
          {props.headerActionContent}
        </Box>
      </Box>
      <CustomContextBox>{props.children}</CustomContextBox>
      <Stack direction="row" sx={{ marginTop: 1 }} spacing={1} justifyContent="end">
        {buttons}
      </Stack>
    </Paper>
  );
}

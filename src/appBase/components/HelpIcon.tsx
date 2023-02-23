import React from "react";
import { SmallButton } from "./SmallButton";

interface Props { article: string; }

export const HelpIcon = (props: Props) => (
  <span style={{ float: "right", color: "#1976d2" }}>
    <SmallButton icon="help" aria-label={"help"} onClick={() => window.open("https://support.churchapps.org/" + props.article, "_blank")} />
  </span>
)

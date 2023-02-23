import React from "react";
import { Editor } from "./Editor"

interface Props {
  value: string;
  textAlign?: "left" | "center" | "right"
}

export function MarkdownPreview({ value: markdownString = "", textAlign }: Props) {
  return <Editor mode="preview" value={markdownString} textAlign={textAlign} />;
}

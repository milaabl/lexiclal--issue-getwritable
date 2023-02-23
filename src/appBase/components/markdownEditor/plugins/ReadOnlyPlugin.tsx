import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

interface Props {
  isDisabled?: boolean
}

// When isDisabled true, set active editor in ReadOnly mode preventing changes
export function ReadOnlyPlugin(props: Props): any {
  const [editor] = useLexicalComposerContext();

  useEffect(() => { editor.setEditable(!props.isDisabled); }, [editor, props.isDisabled]);

  return null;
}

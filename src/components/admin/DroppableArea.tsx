import { Icon } from "@mui/material";
import React from "react";
import { useDrop } from 'react-dnd'

type Props = {
  children?: React.ReactNode,
  accept: any,
  onDrop: (data: any) => void
};

export function DroppableArea(props: Props) {

  const [{ isOver, canDrop, item }, drop] = useDrop(
    () => ({
      accept: props.accept,
      drop: (data) => props.onDrop(data),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
        item: monitor.getDropResult()
      }),
    })
  );

  if (canDrop) return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, height: 30, width: "100%", zIndex: 9999, backgroundColor: (isOver) ? "#00FF00" : "#CCCCCC" }}>
        <div style={{ textAlign: "center", color: "#000099", width: "100%" }} ref={drop}>
          {props.children || <Icon>add</Icon>}
        </div>
      </div>
    </div>
  );
  else return <></>
}
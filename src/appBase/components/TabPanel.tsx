import { Box, styled } from "@mui/material";
import React from "react"

interface Props {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const TabPanel: React.FC<Props> = (props: Props) => {

  const { children, value, index } = props;
  const StyledMenuBox = styled(Box)(
    ({ theme }) => ({
      paddingTop: 10,
      "& .MuiListItemButton-root": { paddingLeft: 30 },
      "& .MuiListItemIcon-root": {
        color: theme.palette.primary.main
      },
      "& .MuiListItemText-root": { color: theme.palette.text.primary },
      "& .selected .MuiListItemText-root span": { fontWeight: "bold" }
    })
  );

  return (
    <div role="tabpanel" hidden={value !== index} id={`userMenuPanel-${index}`}>
      {value === index && (
        <StyledMenuBox>
          <Box>{children}</Box>
        </StyledMenuBox>
      )}
    </div>
  );
}

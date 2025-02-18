import PaperContainer from "../PaperContainer";
import {Divider, Grid, IconButton, List, ListItemText} from "@mui/material";
import React from "react";
import {SpacerListMenuItem} from "./SpacerListMenuItem";
import HelpDialog from "../HelpDialog";
import {Help as HelpIcon} from "@mui/icons-material";


export const ListMenu: React.FunctionComponent<{
    primaryHeader: string,
    secondaryHeader: string,
    listItems: Array<JSX.Element>,
    helpText?: string
}> = ({
    primaryHeader,
    secondaryHeader,
    listItems,
    helpText
}): JSX.Element => {
    const [helpDialogOpen, setHelpDialogOpen] = React.useState(false);

    return (
        <PaperContainer>
            <List
                sx={{
                    width: "100%",
                }}
                subheader={
                    <Grid container>
                        <Grid
                            item
                            style={{
                                maxWidth: helpText ? "84%" : undefined //Unfortunately, 85% does not fit next to the help on an iphone 5
                            }}
                        >
                            <ListItemText
                                style={{
                                    paddingBottom: "1rem",
                                    paddingLeft: "1rem",
                                    paddingRight: "1rem",
                                    userSelect: "none"
                                }}
                                primary={primaryHeader}
                                secondary={secondaryHeader}
                            />
                        </Grid>
                        {helpText && (
                            <Grid
                                item
                                style={{marginLeft: "auto", marginRight: "0.5rem"}}
                            >
                                <IconButton
                                    onClick={() => {
                                        return setHelpDialogOpen(true);
                                    }}
                                    title="Help"
                                >
                                    <HelpIcon/>
                                </IconButton>
                            </Grid>
                        )}
                    </Grid>
                }
            >
                {listItems.map((item, idx) => {
                    const divider = (<Divider variant="middle" component="li" key={idx + "_divider"} />);
                    let elem = item;

                    if (elem.type === SpacerListMenuItem) {
                        elem = <br key={idx + "_spacer"}/>;
                    }

                    if (
                        idx > 0 &&
                        item.type !== SpacerListMenuItem &&
                        listItems[idx - 1].type !== SpacerListMenuItem
                    ) {
                        return [divider, elem];
                    } else {
                        return elem;
                    }
                })}
            </List>
            {
                helpText &&
                <HelpDialog
                    dialogOpen={helpDialogOpen}
                    setDialogOpen={(open: boolean) => {
                        setHelpDialogOpen(open);
                    }}
                    helpText={helpText}
                />
            }
        </PaperContainer>
    );
};

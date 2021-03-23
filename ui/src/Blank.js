import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';

const useStyles = makeStyles((theme) => ({}));

export default function Blank(props) {
  const classes = useStyles();

  return (
    <React.Fragment>
        <CssBaseline/>
        {/* Hero unit */}
        <Container maxWidth="sm" component="main" className={classes.heroContent}>
            <Typography variant="h5" align="center" color="textSecondary" component="p">
                Select a run from the menu bar to continue.
            </Typography>
        </Container>
    </React.Fragment>
  )
}

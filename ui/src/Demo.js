import React, { useState, useEffect, useRef } from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import { useParams } from "react-router-dom";
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import PlaylistAddCheck from '@material-ui/icons/PlaylistAddCheck';
import BuildIcon from '@material-ui/icons/Build';
import SpeedIcon from '@material-ui/icons/Speed';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import LayersIcon from '@material-ui/icons/Layers';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import CheckCircle from '@material-ui/icons/CheckCircle';
import OfflineBolt from '@material-ui/icons/OfflineBolt';
import RemoveCircle from '@material-ui/icons/RemoveCircle';
import ImageIcon from '@material-ui/icons/Image';
import WorkIcon from '@material-ui/icons/Work';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import CachedIcon from '@material-ui/icons/Cached';

import { green, yellow, red, teal } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  nested1: {
    paddingLeft: theme.spacing(4),
  },
  nested2: {
    paddingLeft: theme.spacing(8),
  },
  green: {
    color: '#fff',
    backgroundColor: green[500],
  },
  yellow: {
    color: '#fff',
    backgroundColor: yellow[500],
  },
  red: {
    color: '#fff',
    backgroundColor: red[500],
  },
  running: {
    color: '#fff',
    backgroundColor: teal[200],
    animation: `$pulse 2s infinite`
  },
  "@keyframes pulse": {
    "0%": {
        backgroundColor: teal[100]
    },
    "50%": {
        backgroundColor: teal[600]
    },
    "100%": {
      backgroundColor: teal[50]
    }
  },
}));


function NestedListItem(props) {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem button onClick={handleClick} className={props.className}>
        <ListItemIcon>
          <Icon thing={props.icon} kind={props.kind} />
        </ListItemIcon>
        <ListItemText primary={props.primary} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {props.children}
      </Collapse>
    </>
  );
}

function Icon(props) {
  const classes = useStyles();
  const thing = props.thing;

  let color = null;
  let TheIcon = HelpOutlineIcon

  if (thing.passed) {
    if (props.kind === "Test") {
      TheIcon = PlaylistAddCheck;
    } else {
        TheIcon = CheckCircle;
    }
    color = classes.green;
  } else if (thing.skipped) {
    TheIcon = RemoveCircle;
    color = classes.yellow;
  } else if (thing.failed) {
    TheIcon = OfflineBolt;
    color = classes.red;
  } else if (thing.started) {
      TheIcon = CachedIcon
      color = classes.running;
  } else if (thing.timing === "Setup") {
      TheIcon = BuildIcon
  } else if (thing.timing === "Requirement") {
      TheIcon = SpeedIcon
  } else if (thing.timing === "Assert") {
      TheIcon = LayersIcon
  } else if (thing.timing === "Teardown") {
      TheIcon = WhatshotIcon
  }

  return (
    <Avatar className={color}>
      <TheIcon />
    </Avatar>
  );
}

function Tests({ tests }) {
  const classes = useStyles();

  if (!tests ) {
    return null
  }
  return (
    <>
    {tests.map((test) => ( 
      <NestedListItem primary={test.name} icon={test} kind="Test">
        <List component="div" disablePadding>
        <Steps steps={test.steps} />
        </List>
     </NestedListItem>
    ))}
    </>    
  );
}


function Steps({ steps }) {
  const classes = useStyles();

  if (!steps ) {
    return null
  }
  return (
    <>
    {steps.map((step) => (
      <ListItem button primary={step.name} className={classes.nested1}>
        <ListItemIcon>
          <Icon thing={step} />
        </ListItemIcon>
        <ListItemText primary={step.name} />
      </ListItem>
    ))}
    </>    
  );
}

export const useInterval = (callback, delay) => {

  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);


  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function BasicTable(props) {
  const classes = useStyles();
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState({tests :[]});

  const { runId } = useParams();

  const loadNow = () => {
    if (runId === "") {
      setData({tests :[]})
      return
    }  
    console.log("/run/"+runId)
    fetch("/run/"+runId)
        .then(res => res.json())
        .then(
            (result) => {
                setData(result);
                setIsLoaded(true);
            },
            (error) => {
                setError(error);
            }
        )
  };

  useEffect(loadNow, [])

  useInterval(() => {
    loadNow()
  }, 250);

  if (error) {
    return (
        <React.Fragment>
            <CssBaseline/>
            {/* Hero unit */}
            <Container maxWidth="sm" component="main" className={classes.heroContent}>
                <Typography variant="h5" align="center" color="textSecondary" component="p">
                    Error: {error.message}
                </Typography>
            </Container>
        </React.Fragment>
    )
  }
  if (!isLoaded) {
    return (
        <React.Fragment>
            <CssBaseline/>
            {/* Hero unit */}
            <Container maxWidth="sm" component="main" className={classes.heroContent}>
                <Typography variant="h5" align="center" color="textSecondary" component="p">
                    loading...
                </Typography>
            </Container>
        </React.Fragment>
    )
  }

  if (!data || !data.environment) {
    return null
  }

  return (
    <>
      <List className={classes.root}>
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <ImageIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Features" secondary={ data.environment.featureState } />
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <WorkIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Requirement" secondary={ data.environment.requirementLevel } />
      </ListItem>
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <BeachAccessIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Namespace" secondary={ data.environment.namespace } />
      </ListItem>
      <Tests tests={ data.tests } />
    </List>

    </>
  );
}

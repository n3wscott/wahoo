import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import './Json.css';
import Slide from '@material-ui/core/Slide';
import Collapse from '@material-ui/core/Collapse';
import CircularProgressWithLabel from './CircularProgressWithLabel';


import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ListSubheader from '@material-ui/core/ListSubheader';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import WorkIcon from '@material-ui/icons/Work';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import './App.css';

import XMLViewer from 'react-xml-viewer'

import Attributes from './Attributes';

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
}));


const data = {
  run: "knative.dev/reconciler-test/61463fb6-3cf0-4767-b095-2ed2b47ed0c7",
  environment: {
    featureState:"Any",
    namespace:"test-iwpuyldo",
    requirementLevel:"All"
  },
  tests :[{
    name: "TestBrokerConformance",
    progress: "60/99",
    features: [{
      name: "Broker",
      progress: "60/99",
      steps:[{
        level: "MUST",
        name: "Do a thing that is a must.",
      }],
    },{
      name: "Trigger, Given Broker",
      progress: "6/10",
      steps:[{
        level: "SHOULD",
        name: "Conformance Triggers SHOULD include a Ready condition in their status.",
      },{
        level: "MAY",
        name: "To this other thing.",
      }],
    }],
  }],
};



function Step(props) {
  const classes = useStyles();
  
  return (
    <>
    <Grid item xs={12}>
      <Paper className={classes.paper}>
        <Typography>[{props.level}] {props.name}</Typography>
      </Paper>
    </Grid>
    
    </>
  );
}

function Feature(props) {
  const classes = useStyles();
  
  return (
    <>
    <Typography>{props.name}</Typography>
    <Grid container spacing={3}>
      {props.steps.map((s) => (  
          <Step name={s.name} level={s.level} />
      ))}
    </Grid>
    </>
  );
}

function NestedListItem(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem button onClick={handleClick} className={props.className}>
        <ListItemIcon>
          <InboxIcon />
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

export default function BasicTable(props) {
  const classes = useStyles();

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
      {data.tests.map((row) => ( 
        <NestedListItem primary={row.name}>
          <List component="div" disablePadding>
          {row.features.map((f) => (
            <NestedListItem primary={f.name} className={classes.nested1}>
              <List component="div" disablePadding>
              {f.steps.map((s) => (
                <ListItem button className={classes.nested2}>
                  <ListItemIcon>
                    <StarBorder />
                  </ListItemIcon>
                  <ListItemText primary={s.name} />
                </ListItem>
              ))}
              </List>
            </NestedListItem>
            ))}
          </List>
       </NestedListItem>
      ))}     
    </List>

    </>
  );
}

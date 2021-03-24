import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import GitHubIcon from '@material-ui/icons/GitHub';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Demo from './Demo';
import Blank from './Blank';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { HashRouter, Route, Switch, useHistory } from 'react-router-dom';
import TimeAgo from 'react-timeago'

function Source() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      <Link color="inherit" href="https://github.com/n3wscott/wahoo">
        <GitHubIcon/>
      </Link>
    </Typography>
  );
}

const drawerWidth = 400;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  headerInput: {
    color: "#fff",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  wahooLogo: {
    height: 60,
    paddingRight: 80,
  },
  dropdown: {
    paddingRight: 10,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    text: '#fff',
  },
}));


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


function RunsDropdown(props) {
  const classes = useStyles();
  let history = useHistory();

  const runs = props.runs;
  const runId = props.runId;

  function handleClick(event) {
    if (event.target.value === "") {
      history.push("/");
    }
    else {
      history.push("/run/"+event.target.value);
    }
    if (props.onChange) {
      props.onChange(event);
    }
  }

  return (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel id="demo-simple-select-outlined-label" className={classes.headerInput}>Runs</InputLabel>
      <Select
        labelId="demo-simple-select-outlined-label"
        id="demo-simple-select-outlined"
        value={runId}
        onChange={handleClick}
        label="Runs"
        className={classes.headerInput}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {runs.map((run) => ( 
          <MenuItem value={run.id}>
            <Typography variant="body1" className={classes.dropdown}>
              {run.id}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <TimeAgo date={run.added}/>
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function Dashboard(props) {
  const classes = useStyles();
  const [runId, setRunId] = React.useState('');
  const [error, setError] = useState(null);
  const [runs, setRuns] = useState([]);

  const loadNow = () => {
    console.log("/runs")
    fetch("/runs")
        .then(res => res.json())
        .then(
            (result) => {
                result.sort(function(a, b) {
                  let ta = new Date(a.added);
                  let tb = new Date(b.added);
                  return ta.getTime() - tb.getTime();
                });
                setRuns(result);
            },
            (error) => {
                setError(error);
            }
        )
  };

  useEffect(loadNow, [])

  useInterval(() => {
    loadNow()
  }, 2000);

  const handleChange = (event) => {
    setRunId(event.target.value);
  };

  // TODO: use error.

  return (
    <HashRouter basename="/" hashType="slash">
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Wahoo! Rekt Results Viewer
          </Typography>
          <RunsDropdown runs={runs} runId={runId} onChange={handleChange} />
          <IconButton color="inherit">
            <Badge badgeContent={runs.length} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Paper>
            
              <Switch>
                <Route exact path={'/'} component={Blank}></Route>
                <Route path={'/run/:runId'} component={Demo}></Route>
              </Switch>
            
          </Paper>
          <Box pt={4}>
            <Source />
          </Box>
        </Container>
      </main>
    </div>
    </HashRouter>
  );
}

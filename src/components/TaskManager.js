import React, { Component, Fragment } from 'react';
// import { withAuth } from '@okta/okta-react';
import { withRouter, Route, Redirect, Link } from 'react-router-dom';
import {
    withStyles,

    Typography,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CardActions,
    IconButton,
    InputLabel,
    FormControl,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    MenuItem,
    Select,
    Grid
} from '@material-ui/core';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import { find, orderBy } from 'lodash';
import { compose } from 'recompose';

import TaskEditor from '../components/TaskEditor';
import DeleteModal from "./DeleteModal";

const styles = theme => ({
    card: {
        width: 300,
        margin: theme.spacing(2),
        paddingLeft: theme.spacing(2),
    },
    childList: {
        marginLeft: theme.spacing(3),
    },
    tasks: {
        marginTop: theme.spacing(2),
    },
    pagination: {
        textAlign: 'center',
    },
    formControl: {
        margin:theme.spacing(2),
        minWidth: 120,
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing(3),
        right: theme.spacing(3),
        [theme.breakpoints.down('xs')]: {
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
    },
});

const API = process.env.REACT_APP_API || 'http://localhost:8080';

class TasksManager extends Component {
    state = {
        loading: true,
        tasks: []
    };

    componentDidMount() {
        this.getTasks();
    }

    async fetch(method, endpoint, body) {
        try {
            const response = await fetch(`${API}${endpoint}`, {
                method,
                body: body && JSON.stringify(body),
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/json',
                },
            });
            return await response;
        } catch (error) {
            console.error(error);
        }
    };

    async getTasks(endpoint = '') {
        endpoint = endpoint || `/`;
        let response = await this.fetch('get', endpoint);
        this.setState({
            loading: false,
            tasks:  await response.json()
        }
        );
    };

    saveTask = async (task) => {
        if (task.id) {
            await this.fetch('put', `/${task.id}`, task);
        } else {
            await this.fetch('post', '/', task);
        }

        this.props.history.goBack();
        this.getTasks();
    };

    deleteTask = async (task) => {
        await this.fetch('delete', `/${task.id}`);
        this.props.history.goBack();
        this.getTasks();
    };

    renderDeleteModal = ({ match: { params: { id } } }) => {
        const task = find(this.state.tasks, { id: Number(id) });
        return <DeleteModal task={task}  onDelete={this.deleteTask}/>
    };

    renderTaskEditor = ({ match: { params: { id } } }) => {
        if (this.state.loading) return null;
        let task = find(this.state.tasks, { id: Number(id) });

        if (!task && id !== 'new') return <Redirect to="/tasks" />;
        const parent = this.getParent();
        if (!task && parent) {
            task = {parent : parent};
        }
        return <TaskEditor task={task} onSave={this.saveTask} parent={parent}/>;
    };


    getParent = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("parent")) {
            return urlParams.get("parent");
        }
        return null;
    }

        render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <Typography variant="body1">Tasks Manager</Typography>


                
                {this.state.tasks.length > 0 ? (
                    <Grid
                        // justify="space-between" // Add it here :)
                        container 
                        // spacing={24}
                    >
                        
                            {this.state.tasks.map(task => (
                                <Grid item>
                                    <Card key={task.id} className={classes.card}>
                                        <CardContent >
                                            <List>
                                                <ListItem button component={Link} to={`/tasks/edit/${task.id}`}>
                                                    <ListItemText
                                                        primary={task.title}
                                                        secondary={task.description}/>
                                                        <ListItemSecondaryAction>
                                                            <IconButton href={`/tasks/edit/new?parent=${task.id}`} color="inherit">
                                                                <AddIcon />
                                                            </IconButton>
                                                        </ListItemSecondaryAction>
                                                </ListItem>
                                                <List className={classes.childList}>
                                                {task.children.map( child => (
                                                    <ListItem key={child.id} button component={Link} to={`/tasks/edit/${child.id}`}>
                                                        <ListItemText
                                                            primary={child.title}
                                                            secondary={child.description}/>

                                                    </ListItem>
                                                ))}
                                                </List>
                                                
                                            </List>
                                        </CardContent>
                                        <CardActions>
                                            <IconButton href={`/tasks/delete/${task.id}`} color="inherit">
                                                <DeleteIcon />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        
                    </Grid>

                ) : (
                    !this.state.loading && <Typography variant="subheading">No tasks to display</Typography>
                )}



                <Button
                    variant="outlined"
                    color="secondary"
                    aria-label="add"
                    className={classes.fab}
                    component={Link}
                    to="/tasks/edit/new"
                >
                    <AddIcon />
                </Button>
                <Route path="/tasks/edit/:id" render={this.renderTaskEditor} />
                <Route path="/tasks/delete/:id" render={this.renderDeleteModal}/>
            </Fragment>
        );
    }
}

export default compose(
    withRouter,
    withStyles(styles),
)(TasksManager);
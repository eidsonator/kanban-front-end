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
import { Delete as DeleteIcon, Add as AddIcon, MoreHoriz as Ellipsis } from '@material-ui/icons';
import { find, orderBy, flatten, map } from 'lodash';
import { compose } from 'recompose';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import ListMenu from "./ListMenu";
import ListEditor from '../components/ListEditor';
import CardView from "./CardView";
import CardEditor from "./CardEditor";
import DeleteModal from "./DeleteModal";

const styles = theme => ({
    card: {
        width: 300,
        margin: theme.spacing(1),
        paddingLeft: theme.spacing(1),
    },
    childList: {
        marginLeft: theme.spacing(2),
    },
    lists: {
        marginTop: theme.spacing(0),
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

class ListManager extends Component {
    state = {
        loading: true,
        lists: []
    };

    componentDidMount() {
        this.getLists();
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

    async getLists(endpoint = '') {
        endpoint = endpoint || `/`;
        let response = await this.fetch('get', endpoint);
        this.setState({
            loading: false,
            lists:  await response.json()
        }
        );
    };

    saveList = async (list) => {
        if (list.id) {
            await this.fetch('put', `/${list.id}`, list);
        } else {
            await this.fetch('post', '/', list);
        }

        this.props.history.goBack();
        this.getLists();
    };

    deleteList = async (list) => {
        await this.fetch('delete', `/${list.id}`);
        this.props.history.goBack();
        this.getLists();
    };

    renderDeleteModal = ({ match: { params: { id } } }) => {
        const list = this.findList(id);
        return <DeleteModal list={list}  onDelete={this.deleteList}/>
    };

    renderListEditor = ({ match: { params: { id } } }) => {
        if (this.state.loading) return null;
        let list = this.findList(id);

        if (!list && id !== 'new') return <Redirect to="/lists" />;
        const parent = this.getParent();
        if (!list && parent) {
            list = {parent : parent};
        }
        return <ListEditor list={list} onSave={this.saveList} parent={parent}/>;
    };

    renderCardEditor = ({ match: { params: { parent, id } } }) => {
        if (this.state.loading) return null;
        let list = this.findList(parent);

        if (!list && id !== 'new') return <Redirect to="/lists" />;

        const card = find(list.cards, {id: Number(id)});

        return <CardEditor card={card} onSave={this.saveList} parent={parent}/>;
    };


    findList = (id) => {
        let list = find(this.state.lists, { id: Number(id) });
        if (!list) {
            list = find(flatten(map(this.state.lists, "children")), { id: Number(id) })
        }
        return list;
    };


    getParent = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("parent")) {
            return urlParams.get("parent");
        }
        return null;
    };

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <Typography variant="body1">Lists Manager</Typography>


                
                {this.state.lists.length > 0 ? (
                    <Grid
                        // justify="space-between" // Add it here :)
                        container 
                        // spacing={24}
                    >
                        
                            {this.state.lists.map(list => (
                                <Grid item>
                                    <Card key={list.id} className={classes.card}>
                                        <CardContent >
                                            <List>
                                                <ListItem button component={Link} to={`/lists/edit/${list.id}`}>
                                                    <ListItemText primary={list.title} />
                                                        <ListItemSecondaryAction>
                                                           <ListMenu/>
                                                        </ListItemSecondaryAction>
                                                </ListItem>
                                                <List className={classes.childList}>
                                                {list.cards.map( card => (
                                                    <CardView card={card}/>
                                                ))}
                                                </List>
                                                
                                            </List>
                                        </CardContent>
                                        <CardActions>
                                            <IconButton href={`/lists/edit/new?parent=${list.id}`} color="inherit">
                                                <AddIcon /> Add another card
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        
                    </Grid>

                ) : (
                    !this.state.loading && <Typography variant="subheading">No lists to display</Typography>
                )}



                <Button
                    variant="outlined"
                    color="secondary"
                    aria-label="add"
                    className={classes.fab}
                    component={Link}
                    to="/lists/edit/new"
                >
                    <AddIcon />
                </Button>
                <Route path="/lists/edit/:id" render={this.renderListEditor} />
                <Route path="/lists/delete/:id" render={this.renderDeleteModal}/>
                <Route path="/lists/card/edit/:parent/:id" render={this.renderCardEditor} />
            </Fragment>
        );
    }
}

export default compose(
    withRouter,
    withStyles(styles),
)(ListManager);
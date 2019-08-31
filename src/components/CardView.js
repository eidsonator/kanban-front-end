import React from 'react';
import {
    withStyles,
    Card,
    CardContent,
    CardActions,
    Modal,
    Button,
    TextField, ListItemText, ListItem,
} from '@material-ui/core';
import { compose } from 'recompose';
import {Link, withRouter} from 'react-router-dom';
import { Form, Field } from 'react-final-form';

const styles = theme => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCard: {
        width: '90%',
        maxWidth: 500,
    },
    modalCardContent: {
        display: 'flex',
        flexDirection: 'column',
    },
    marginTop: {
        marginTop: theme.spacing(2),
    },
});



const CardView = ({ card }) => (
    <ListItem key={card.id} button component={Link} to={`/lists/card/edit/${card.listId}/${card.id}`}>
        <ListItemText
            primary={card.title}
            secondary={card.description}/>
    </ListItem>
);

export default compose(
    withRouter,
    withStyles(styles),
)(CardView);
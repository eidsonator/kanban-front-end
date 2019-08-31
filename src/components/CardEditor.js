import React from 'react';
import {
    withStyles,
    Card,
    CardContent,
    CardActions,
    Modal,
    Button,
    TextField,
    Chip,
} from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

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
        closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
});

const DialogTitle = withStyles(styles)(props => {
    const { children, classes, onClose } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const CardEditor = ({ card, onSave, parent, history, classes }) => (
    <Form initialValues={card} onSubmit={onSave}>
        {({ handleSubmit }) => (

            <Dialog onClose={() => history.goBack()} aria-labelledby="customized-dialog-title" open>
                <form onSubmit={handleSubmit}>
                    <DialogTitle id="customized-dialog-title" onClose={handleSubmit}>
                        <Field name="title">
                            {({ input }) => <TextField label="Title" autoFocus {...input} />}
                        </Field>
                    </DialogTitle>
                    <MuiDialogContent>
                        <Field name="description">
                            {({ input }) => (
                                <TextField
                                    className={classes.marginTop}
                                    label="Description"
                                    {...input}
                                />
                            )}
                        </Field>
                    </MuiDialogContent>
                </form>
                <MuiDialogContent>
                    {card.labels.map(label => (
                        <Chip label={label.description} />
                    ))}
                </MuiDialogContent>
            </Dialog>
        )}
    </Form>
);

export default compose(
    withRouter,
    withStyles(styles),
)(CardEditor);
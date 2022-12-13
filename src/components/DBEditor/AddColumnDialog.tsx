import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface Props {
  openDlg: boolean,
  setOpen: Function,
  createCallback: Function,
  tableName: string
}

export default function AddColumnDialog({ openDlg, setOpen, createCallback, tableName }: Props) {
  const [show, setShow] = React.useState(openDlg);
  const [setShowDlg] = React.useState(setOpen);
  const [create] = React.useState(createCallback);

  React.useEffect(() => {
    setShow(openDlg);
  }, [openDlg]);

  const handleClose = (request: string) => {
    setShowDlg(false);
    if (request === "add") {
      const name = (document.getElementById("name") as HTMLInputElement).value;
      create(tableName, name);
    }
  };

  return (
    <div>
      <Dialog open={show} onClose={handleClose}>
        <DialogTitle>Create Column</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the name of the column you would like to create.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Column Name"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose("cancel")}>Cancel</Button>
          <Button onClick={() => handleClose("add")}>Create Column</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
import {
  Button,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Stack,
} from "@mui/joy";
import React from "react";

type CameraObject = {
  url: string;
  typeNumber: number;
  driver: number;
};

interface AddCameraDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (cam: CameraObject) => void;
}

const AddCameraDialog: React.FC<AddCameraDialogProps> = ({
  open,
  onAdd,
  onClose,
}) => {
  const [url, setUrl] = React.useState("");
  const [typeNumber, setTypeNumber] = React.useState("");
  const [driver, setDriver] = React.useState("");

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleTypeNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTypeNumber(event.target.value);
  };

  const handleDriverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDriver(event.target.value);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <DialogTitle> Add camera</DialogTitle>
        <DialogContent>
          <form
            onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData: CameraObject = {
                url,
                typeNumber: parseInt(typeNumber),
                driver: parseInt(driver),
              };
              onAdd(formData);
            }}
          >
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Url</FormLabel>
                <Input
                  autoFocus
                  required
                  onChange={(e) => handleUrlChange(e)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Input
                  autoFocus
                  required
                  onChange={(e) => handleTypeNumberChange(e)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Driver</FormLabel>
                <Input
                  autoFocus
                  required
                  onChange={(e) => handleDriverChange(e)}
                />
              </FormControl>
              <Button color="neutral" variant="solid" onClick={() => onClose()}>
                Close
              </Button>
              <Button color="primary" variant="solid" type="submit">
                Submit
              </Button>
            </Stack>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

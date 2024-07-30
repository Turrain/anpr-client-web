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

interface EditCameraDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: (cam: CameraObject) => void;
  camera: CameraObject;
}

const EditCameraDialog: React.FC<EditCameraDialogProps> = ({
  open,
  onEdit,
  onClose,
  camera,
}) => {
  const [url, setUrl] = React.useState(camera.url);
  const [typeNumber, setTypeNumber] = React.useState(
    camera.typeNumber.toString(),
  );
  const [driver, setDriver] = React.useState(camera.driver.toString());

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
        <DialogTitle> Edit camera</DialogTitle>
        <DialogContent>
          <form
            onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData: CameraObject = {
                url,
                typeNumber: parseInt(typeNumber),
                driver: parseInt(driver),
              };
              onEdit(formData);
            }}
          >
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Url</FormLabel>
                <Input
                  autoFocus
                  required
                  value={url}
                  onChange={(e) => handleUrlChange(e)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Input
                  autoFocus
                  required
                  value={typeNumber}
                  onChange={(e) => handleTypeNumberChange(e)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Driver</FormLabel>
                <Input
                  autoFocus
                  required
                  value={driver}
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
export default EditCameraDialog;

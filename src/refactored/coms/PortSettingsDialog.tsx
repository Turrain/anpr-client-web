import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  Modal,
  ModalDialog,
  Select,
  Option,
} from "@mui/joy";
import React from "react";

type PortSettings = {
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: number;
  flowControl: number;
  driver: number;
};

interface PortSettingsDialogProps {
  open: boolean;
  port: string;
  onClose: () => void;
}

const PortSettingsDialog: React.FC<PortSettingsDialogProps> = ({
  open,
  port,
  onClose,
}) => {
  const [settings, setSettings] = React.useState<PortSettings>({
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 0,
    flowControl: 0,
    driver: 0,
  });

  const handleChange =
    (field: keyof PortSettings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSettings({
        ...settings,
        [field]: parseInt(event.target.value, 10),
      });
    };
  const selectHandleChange = (field: keyof PortSettings, value: number) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };
  const handleSave = () => {
    // Save settings logic here
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <DialogTitle>Port Settings for {port}</DialogTitle>
        <DialogContent>
          <Input
            value={settings.baudRate}
            onChange={handleChange("baudRate")}
            fullWidth
            type="number"
          />
          <Input
            value={settings.dataBits}
            onChange={handleChange("dataBits")}
            fullWidth
            type="number"
          />
          <Input
            value={settings.stopBits}
            onChange={handleChange("stopBits")}
            fullWidth
            type="number"
          />
          <Select
            value={settings.parity}
            onChange={(_, v) => selectHandleChange("parity", v!)}
          >
            <Option value={0}>None</Option>
            <Option value={1}>Odd</Option>
            <Option value={2}>Even</Option>
          </Select>
          <Select
            value={settings.flowControl}
            onChange={(_, v) => selectHandleChange("flowControl", v!)}
          >
            <Option value={0}>None</Option>
            <Option value={1}>RTS/CTS</Option>
            <Option value={2}>XON/XOFF</Option>
          </Select>
          <Input
            value={settings.driver}
            onChange={handleChange("driver")}
            fullWidth
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default PortSettingsDialog;

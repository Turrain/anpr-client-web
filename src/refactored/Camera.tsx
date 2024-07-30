import * as React from "react";
import { useCameraStore } from "./stores/CameraStore";
import CameraGrid from "./coms/CameraGrid";
import AddCameraDialog from "./coms/AddCameraDialog";
import EditCameraDialog from "./coms/CameraSettingsDialog";

const CameraPage: React.FC = () => {
  const { cameras, addCamera, editCamera, deleteCamera } = useCameraStore();

  const [openAddDialog, setOpenAddDialog] = React.useState(false);
  const [cameraToEdit, setCameraToEdit] = React.useState(null);

  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => setOpenAddDialog(false);

  const handleAddCamera = (camera) => {
    addCamera(camera);
    handleCloseAddDialog();
  };

  const handleEditCamera = (camera) => {
    editCamera(camera);
    setCameraToEdit(null);
  };

  const handleDeleteCamera = (id) => {
    deleteCamera(id);
  };

  return (
    <>
      <CameraGrid
        cameras={cameras}
        onAddCamera={handleOpenAddDialog}
        onEditCamera={setCameraToEdit}
        onDeleteCamera={handleDeleteCamera}
      />
      <AddCameraDialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onAdd={handleAddCamera}
      />
      {cameraToEdit && (
        <EditCameraDialog
          open={Boolean(cameraToEdit)}
          camera={cameraToEdit}
          onClose={() => setCameraToEdit(null)}
          onEdit={handleEditCamera}
        />
      )}
    </>
  );
};

export default CameraPage;

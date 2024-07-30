import { create } from "zustand";

interface CameraObject {
  url: string;
  typeNumber: number;
  driver: number;
}

interface CameraStore {
  cameras: CameraObject[];
  addCamera: (newCamera: CameraObject | CameraObject[]) => void;
  editCamera: (updatedCamera: CameraObject) => void;
  deleteCamera: (cameraUrl: string) => void;
}

const useCameraStore = create<CameraStore>((set) => ({
  cameras: [], // Initial empty array
  addCamera: (newCamera) =>
    set((state) => ({
      cameras: [
        ...state.cameras,
        ...(Array.isArray(newCamera) ? newCamera : [newCamera]),
      ],
    })),
  editCamera: (updatedCamera) =>
    set((state) => ({
      cameras: state.cameras.map((camera) =>
        camera.url === updatedCamera.url ? updatedCamera : camera,
      ),
    })),
  deleteCamera: (cameraUrl) =>
    set((state) => ({
      cameras: state.cameras.filter((camera) => camera.url !== cameraUrl),
    })),
}));

export { useCameraStore };

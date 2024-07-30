import * as React from "react";

import {
  Grid,
  Sheet,
  Typography,
  Box,
  Button,
  Card,
  CardOverflow,
  AspectRatio,
  CardContent,
  Divider,
} from "@mui/joy";

interface CameraObject {
  url: string;
  typeNumber: number;
  driver: number;
}
interface CameraGridProps {
  cameras: CameraObject[];
  onAddCamera: () => void;
  onEditCamera: (camera: CameraObject) => void;
  onDeleteCamera: (url: string) => void;
}

const CameraGrid: React.FC<CameraGridProps> = ({
  cameras,
  onAddCamera,
  onEditCamera,
  onDeleteCamera,
}) => {
  return (
    <>
      {cameras.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <Typography variant="h5">No cameras found</Typography>
          <Button variant="solid" onClick={onAddCamera}>
            Add Camera
          </Button>
        </Box>
      ) : (
        <Grid spacing={2} sx={{ p: 2, height: "100vh" }}>
          {cameras.map((camera) => (
            <Card key={camera.url} variant="outlined" sx={{ width: 320 }}>
              <CardOverflow>
                <AspectRatio ratio="2">
                  <img src={camera.url} alt={`Camera ${camera.url}`} />
                </AspectRatio>
              </CardOverflow>
              <CardContent>
                <Typography level="body-md">Camera</Typography>
                <Typography level="body-sm">{camera.url}</Typography>
              </CardContent>
              <CardOverflow variant="soft" sx={{ p: 0 }}>
                <CardContent
                  orientation="horizontal"
                  sx={{ p: 0, mb: "1px", gap: "1px" }}
                >
                  <Button
                    fullWidth
                    variant="solid"
                    sx={{ borderRadius: 0 }}
                    onClick={() => onEditCamera(camera)}
                  >
                    Edit
                  </Button>
                  <Button
                    fullWidth
                    variant="solid"
                    sx={{ borderRadius: 0 }}
                    onClick={() => onDeleteCamera(camera.url)}
                  >
                    Delete
                  </Button>
                </CardContent>
              </CardOverflow>
            </Card>
          ))}
        </Grid>
      )}
    </>
  );
};

export default CameraGrid;

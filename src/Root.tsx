import React from "react";
import { Composition } from "remotion";
import { VRTutorial } from "./components/VRTutorial";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VRControllerTutorial"
        component={VRTutorial}
        durationInFrames={185}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{}}
      />
    </>
  );
};

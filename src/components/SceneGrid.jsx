import React from 'react';
import SceneCard from './SceneCard';

function SceneGrid({ scenes, onRegenerateImage, onApproveScene, onEditScene, approvedScenes }) {
  console.log('🎬 SceneGrid rendering:', {
    numberOfScenes: scenes.length,
    sceneIds: scenes.map(s => s.id),
    firstScene: scenes[0] ? {
      id: scenes[0].id,
      status: scenes[0].image_status,
      hasImage: !!scenes[0].image_url
    } : null
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {scenes.map((scene, index) => (
        <SceneCard
          key={scene.id}
          scene={scene}
          index={index}
          onRegenerateImage={onRegenerateImage}
          onApproveScene={onApproveScene}
          onEditScene={onEditScene}
        />
      ))}
    </div>
  );
}

export default SceneGrid;

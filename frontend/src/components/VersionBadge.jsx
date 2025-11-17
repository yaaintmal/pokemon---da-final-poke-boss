import React, { useState } from 'react';
import changelog from '../data/changelog.json';
import ChangelogModal from './ChangelogModal';

export default function VersionBadge() {
  const [showChangelog, setShowChangelog] = useState(false);
  // Read version from package.json at build time via import.meta.env
//   const version = import.meta.env.VITE_APP_VERSION || '1.0.0';

// refactoring using the last version from the changelog.json in ../data/changelog.json
  const version = changelog?.versions?.[0]?.version || '1.0.0';

  return (
    <>
      <div 
        className="version-badge" 
        title={`Game Version ${version} - Click to view changelog`}
        onClick={() => setShowChangelog(true)}
      >
        v{version}
      </div>
      <ChangelogModal 
        isOpen={showChangelog} 
        onClose={() => setShowChangelog(false)}
        changelog={changelog}
      />
    </>
  );
}

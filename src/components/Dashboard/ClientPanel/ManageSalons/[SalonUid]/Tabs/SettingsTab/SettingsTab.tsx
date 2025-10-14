"use client";
import * as React from "react";

const SettingsTab: React.FC<{ title?: string; content?: string }> = ({
  title = "Settings",
  content = "Salon settings and preferences.",
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2">{content}</p>
    </div>
  );
};

export default SettingsTab;

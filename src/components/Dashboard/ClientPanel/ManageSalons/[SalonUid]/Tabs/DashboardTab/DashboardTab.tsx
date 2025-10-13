"use client";
import * as React from "react";

const DashboardTab: React.FC<{ title?: string; content?: string }> = ({
  title = "Overview",
  content = "Summary metrics and quick links.",
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2">{content}</p>
    </div>
  );
};

export default DashboardTab;

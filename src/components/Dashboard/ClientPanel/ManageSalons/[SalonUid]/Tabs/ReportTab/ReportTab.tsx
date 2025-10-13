"use client";
import * as React from "react";

const ReportTab: React.FC<{ title?: string; content?: string }> = ({
  title = "Report",
  content = "Sales and usage reports.",
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2">{content}</p>
    </div>
  );
};

export default ReportTab;

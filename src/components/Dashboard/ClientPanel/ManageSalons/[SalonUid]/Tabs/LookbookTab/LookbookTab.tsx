"use client";

const LookbookTab: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold">LookBook</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {/* Sample lookbook items */}
        <div className="rounded-lg border p-4 shadow-md">
          <h3 className="font-medium">Summer</h3>
          <p className="text-sm text-gray-600">
            A collection of summer styles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LookbookTab;

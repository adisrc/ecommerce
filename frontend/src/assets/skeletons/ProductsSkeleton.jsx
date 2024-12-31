import { Card, CardContent, Skeleton } from "@mui/material";
import React from "react";

const ProductsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className=" transition-transform duration-200 ease-in-out hover:scale-105"
        >
          <Card className="rounded-lg shadow-md overflow-hidden">
            <Skeleton
              variant="rectangular"
              width="100%"
              height={192}
              className="h-42"
            />
            <CardContent className="p-4">
              <Skeleton variant="text" width="80%" className="mb-2" />
              <Skeleton variant="text" width="50%" />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default ProductsSkeleton;

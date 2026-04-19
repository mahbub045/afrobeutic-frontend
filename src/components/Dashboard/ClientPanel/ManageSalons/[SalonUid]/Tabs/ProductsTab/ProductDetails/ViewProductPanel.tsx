import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffectiveRole } from "@/hooks/use-effective-role";
import { formatChoiceFieldValue, getCurrencySymbol, safe } from "@/lib/utils";
import { useGetProductsDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Products/ProductsApi";
import {
  ProductProps,
  ViewProductPanelProps,
} from "@/Types/ClientPanel/ManageSalonTypes/ProductsTypes/ProductsType";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Edit,
  LoaderPinwheel,
  Maximize2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import EditProductBasicInfoDialog from "./Dialogs/EditProductBasicInfoDialog";
import FullScreenImageViewer from "./FullScreenImageViewer";

const ViewProductPanel: React.FC<ViewProductPanelProps> = ({
  selectedProduct,
  onClose,
}) => {
  const { data: session } = useSession();
  const { canManageClientAccount } = useEffectiveRole(session);
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState<boolean>(false);
  const [
    isOpenEditProductBasicInfoDialog,
    setIsOpenEditProductBasicInfoDialog,
  ] = useState(false);
  const [displayedProduct, setDisplayedProduct] =
    useState<ProductProps>(selectedProduct);

  // Re-fetch products data to get updated product
  const { data: productData, refetch } = useGetProductsDataQuery(
    {
      salonUid,
      page: 1,
      page_size: 1000, // Fetch enough to find our product
    },
    { skip: !salonUid },
  );

  // Update displayed product when selectedProduct prop changes
  useEffect(() => {
    setDisplayedProduct(selectedProduct);
  }, [selectedProduct]);

  // Update displayed product when products data refetches (after edit)
  useEffect(() => {
    if (productData?.results && Array.isArray(productData.results)) {
      const updatedProduct = (productData.results as ProductProps[]).find(
        (s) => s.uid === selectedProduct.uid,
      );
      if (updatedProduct) {
        setDisplayedProduct(updatedProduct);
      }
    }
  }, [productData, selectedProduct.uid]);

  const handleEditProductBasicInfo = () => {
    setIsOpenEditProductBasicInfoDialog(true);
  };

  const handleEditSuccess = () => {
    // Refetch products to get the latest data
    refetch();
  };

  const handleOpenFullScreen = useCallback(() => {
    setIsFullScreenOpen(true);
  }, []);

  const imagesToShow: string[] = useMemo(() => {
    const rawImages =
      (displayedProduct as unknown as { images?: unknown[] })?.images ?? [];
    if (!Array.isArray(rawImages)) return [];
    if (rawImages.length === 0) return [];
    // If images are simple strings, return as-is
    if (typeof rawImages[0] === "string") return rawImages as string[];
    // If images are objects, preserve the original order and map to the image string
    type ImageObj = { image?: string };
    const objs = rawImages as ImageObj[];
    return objs.map((i) => i.image ?? "");
  }, [displayedProduct]);

  const mainImage =
    imagesToShow.length > 0
      ? imagesToShow[Math.min(selectedImageIndex, imagesToShow.length - 1)]
      : undefined;

  useEffect(() => {
    setIsImageLoading(imagesToShow.length > 0);
  }, [selectedImageIndex, imagesToShow.length]);

  if (!displayedProduct) return null;

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Product details</h2>
        <TabsList className="shadow-md dark:shadow-gray-600">
          <TabsTrigger value="list" className="px-3">
            List
          </TabsTrigger>
          <TabsTrigger value="details" className="px-3">
            Details
          </TabsTrigger>
        </TabsList>
      </div>

      <Card className="bg-card overflow-hidden rounded-md p-0 shadow-md dark:shadow-gray-600">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-12">
          {/* Left: Image section (on mobile it shows first) */}
          <div className="bg-muted relative col-span-12 flex flex-col md:col-span-4">
            {mainImage ? (
              <div className="group relative h-[300px] w-full cursor-pointer overflow-hidden md:h-[450px]">
                <Image
                  src={mainImage}
                  alt={`${displayedProduct.name}-main`}
                  height={600}
                  width={300}
                  className="h-full w-full object-cover"
                  onLoadingComplete={() => setIsImageLoading(false)}
                  onClick={handleOpenFullScreen}
                />

                {/* Fullscreen hint overlay */}
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/20">
                  <button
                    type="button"
                    aria-label="Open image in fullscreen"
                    onClick={handleOpenFullScreen}
                    className="absolute top-2 right-2 z-20 rounded-full bg-white/30 p-2 text-white opacity-100 hover:bg-white/40 focus:outline-none"
                  >
                    <Maximize2 size={20} />
                  </button>
                </div>

                {/* Loading spinner */}
                {isImageLoading && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10">
                    <LoaderPinwheel className="text-primary h-10 w-10 animate-spin" />
                  </div>
                )}

                {/* Navigation buttons */}
                {imagesToShow.length > 1 && (
                  <>
                    {selectedImageIndex > 0 && (
                      <button
                        type="button"
                        aria-label="Previous image"
                        onClick={() =>
                          setSelectedImageIndex((i) => Math.max(0, i - 1))
                        }
                        className="absolute top-1/2 left-2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/50 focus:outline-none"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}

                    {selectedImageIndex < imagesToShow.length - 1 && (
                      <button
                        type="button"
                        aria-label="Next image"
                        onClick={() => setSelectedImageIndex((i) => i + 1)}
                        className="absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/50 focus:outline-none"
                      >
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground flex min-h-[200px] w-full flex-1 items-center justify-center md:min-h-[450px]">
                No image
              </div>
            )}
          </div>

          {/* Right: Details section (on mobile it comes below image) */}
          <div className="col-span-12 p-4 md:col-span-8 md:p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div></div>
              <div>
                <a className="text-primary text-lg font-medium hover:underline">
                  {displayedProduct.name || "Unnamed Product"}
                </a>
              </div>

              <div className="text-left md:text-right">
                <div className="text-muted-foreground text-sm">Price</div>
                <div className="text-lg font-semibold">
                  {getCurrencySymbol()}
                  {safe(displayedProduct.price)}
                </div>
              </div>
            </div>

            {/* Basic info */}
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-base font-semibold">Basic info</h4>
              <div>
                {canManageClientAccount && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-md dark:shadow-gray-600"
                    onClick={handleEditProductBasicInfo}
                  >
                    <Edit size={16} />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Product name
                </div>
                <div className="text-sm font-medium">
                  {safe(displayedProduct.name)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Category
                </div>
                <div className="text-sm font-medium">
                  {safe(formatChoiceFieldValue(displayedProduct.category))}
                </div>
              </div>

              <div>
                <div className="text-muted-foreground text-xs uppercase">
                  Price {getCurrencySymbol()}
                </div>
                <div className="text-sm font-medium">
                  {safe(displayedProduct.price)}
                </div>
              </div>
            </div>
            <div className="mb-6">
              <div className="text-muted-foreground text-xs uppercase">
                Description
              </div>
              <div className="mt-1 text-sm whitespace-pre-wrap">
                {displayedProduct.description || "No description provided."}
              </div>
            </div>
            <div className="flex justify-end">
              <div className="mt-6">
                {onClose && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onClose}
                    className="flex items-center gap-1 shadow-md dark:shadow-gray-600"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
      {/* Dialogs */}
      <EditProductBasicInfoDialog
        selectedProduct={displayedProduct}
        isOpen={isOpenEditProductBasicInfoDialog}
        onClose={() => setIsOpenEditProductBasicInfoDialog(false)}
        onEditSuccess={handleEditSuccess}
      />

      <FullScreenImageViewer
        isOpen={isFullScreenOpen}
        images={imagesToShow}
        currentImageIndex={selectedImageIndex}
        onClose={() => setIsFullScreenOpen(false)}
        onImageChange={setSelectedImageIndex}
        productName={displayedProduct.name}
      />
    </>
  );
};

export default ViewProductPanel;

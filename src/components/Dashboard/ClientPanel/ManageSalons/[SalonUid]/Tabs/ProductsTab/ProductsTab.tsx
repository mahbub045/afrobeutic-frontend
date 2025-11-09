"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { formatDateTime } from "@/lib/utils";
import { useGetProductsDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Products/ProductsApi";
import { ProductProps } from "@/Types/ClientPanel/ManageSalonTypes/ProductsTypes/ProductsType";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderPinwheel,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddProductDialog from "./Dialogs/AddProductDialog";
import DeleteProductDialog from "./Dialogs/DeleteProductDialog";
import ViewProductPanel from "./SingleProduct/ViewProductPanel";

const ProductsTab: React.FC = () => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isOpenAddProductDialog, setIsOpenAddProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductProps | null>(
    null,
  );
  const [selectedProductToView, setSelectedProductToView] =
    useState<ProductProps | null>(null);
  const [viewTab, setViewTab] = useState<string>("list");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: productData,
    isLoading,
    isFetching,
  } = useGetProductsDataQuery({
    salonUid,
    page: currentPage,
    search: debouncedSearch || undefined,
  });

  const extractedProducts: ProductProps[] = productData?.results ?? [];

  const handlePreviousPage = () => {
    if (productData?.previous) setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    if (productData?.next) setCurrentPage((p) => p + 1);
  };

  const totalPages = productData?.count
    ? Math.ceil(productData.count / (productData.results?.length || 1))
    : 0;

  const handleIsOpenAddProductDialog = () =>
    setIsOpenAddProductDialog((v) => !v);

  const handleIsOpenDeleteDialog = (product?: ProductProps | null) => {
    setSelectedProduct(product ?? null);
  };

  const handleIsOpenSingleProductTab = (product?: ProductProps | null) => {
    if (product) {
      setSelectedProductToView(product);
      setViewTab("details");
    } else {
      setSelectedProductToView(null);
    }
  };

  return (
    <Tabs value={viewTab} onValueChange={(v) => setViewTab(v)}>
      <TabsContent value="list">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
          <div className="relative">
            <Search
              size={18}
              className="text-muted-foreground pointer-events-none absolute top-[10px] left-2"
            />
            <Input
              className="focus:!border-primary pl-7 shadow-md focus:!ring-0 dark:shadow-gray-600"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm((e.target as HTMLInputElement).value)
              }
            />
          </div>

          <Button
            size="sm"
            variant="default"
            onClick={handleIsOpenAddProductDialog}
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </div>

        <Table>
          <TableHeader className="text-xs">
            <TableRow>
              <TableHead className="text-primary">#</TableHead>
              <TableHead className="text-primary">Product Name</TableHead>
              <TableHead className="text-primary">Category</TableHead>
              <TableHead className="text-primary">Price</TableHead>
              <TableHead className="text-primary">Created At</TableHead>
              <TableHead className="text-primary">Updated At</TableHead>
              <TableHead className="text-center text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6">
                  <div className="flex items-center justify-center">
                    <LoaderPinwheel className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : extractedProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-6 text-center text-sm"
                >
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              extractedProducts.map((product: ProductProps, index) => (
                <TableRow key={product.uid}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    {formatDateTime(product?.created_at ?? null)}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(product?.updated_at ?? null)}
                  </TableCell>

                  <TableCell className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary/80 hover:text-primary dark:shadow-gray-600"
                      onClick={() => handleIsOpenSingleProductTab(product)}
                    >
                      <Eye />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger/80 hover:text-danger dark:shadow-gray-600"
                      color="red"
                      onClick={() => handleIsOpenDeleteDialog(product)}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex justify-between px-2 py-4">
          <div>
            {productData && productData.count > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total: {productData.count} product
                {productData.count !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          <div>
            {/* Pagination Controls */}
            {productData &&
              productData.count > (productData.results?.length ?? 0) && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!productData.previous || isFetching}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!productData.next || isFetching}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="details">
        {selectedProductToView ? (
          <ViewProductPanel
            selectedProduct={selectedProductToView}
            onClose={() => setViewTab("list")}
          />
        ) : (
          <div className="text-muted-foreground py-6 text-center text-sm">
            No product selected.
          </div>
        )}
      </TabsContent>

      {/* Dialogs */}
      <AddProductDialog
        isOpen={isOpenAddProductDialog}
        onClose={handleIsOpenAddProductDialog}
      />
      {selectedProduct && (
        <DeleteProductDialog
          selectedProduct={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => handleIsOpenDeleteDialog()}
        />
      )}
    </Tabs>
  );
};

export default ProductsTab;

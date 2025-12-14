import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { baseApi } from "@/Redux/Api/BaseApi";
import { useEditBookingMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/Bookings/BookingsApi";
import { useGetProductsDataQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Products/ProductsApi";
import type {
  Booking,
  Product,
} from "@/Types/ClientPanel/ManageSalonTypes/BookingsTypes/BookingsTypes";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bookingData?: Booking | null;
}

const EditBookingProductsModal: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  bookingData,
}) => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");
  const { resolvedTheme } = useTheme();
  const dispatch = useDispatch();

  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductsDataQuery({ salonUid });

  const [localSelection, setLocalSelection] = useState<string[]>(
    bookingData?.products?.map((p) => p.uid) || [],
  );
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [editBooking, { isLoading }] = useEditBookingMutation();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSave = async () => {
    if (!bookingData) return;
    try {
      await editBooking({
        salonUid,
        bookingUid: bookingData.uid,
        data: { products: localSelection },
      }).unwrap();

      try {
        dispatch(baseApi.util.invalidateTags(["ChairsBooking"]));
      } catch (e) {
        console.warn(e);
      }

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Products updated",
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
      });

      onOpenChange(false);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Failed to update products" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] !max-w-2xl overflow-y-auto shadow-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Products</DialogTitle>
          <DialogDescription>
            Update products attached to this booking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Label className="mb-2">Products</Label>
            <div className="relative">
              <div
                onClick={() => {
                  setShowDropdown(true);
                  inputRef.current?.focus();
                }}
                className="flex min-h-[42px] w-full cursor-text flex-wrap gap-2 rounded-md border px-3 py-2 dark:bg-[#181818]"
              >
                {localSelection.length > 0 ? (
                  <>
                    {localSelection.map((productUid) => {
                      const product = productsData?.results?.find(
                        (p: Product) => p.uid === productUid,
                      );
                      return product ? (
                        <span
                          key={productUid}
                          className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm"
                        >
                          {product.name}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocalSelection((prev) =>
                                prev.filter((p) => p !== productUid),
                              );
                            }}
                            className="hover:bg-primary/20 rounded-full"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ) : null;
                    })}
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                      className="min-w-[120px] flex-1 border-none bg-transparent outline-none"
                    />
                  </>
                ) : (
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search and select products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full border-none bg-transparent outline-none"
                  />
                )}
              </div>

              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded border bg-white shadow-lg dark:bg-[#0b1116]"
                >
                  {isLoadingProducts ? (
                    <div className="p-2 text-sm text-gray-500">
                      Loading products...
                    </div>
                  ) : (
                    (() => {
                      const searchTerm = search.toLowerCase().trim();
                      const filteredProducts = searchTerm
                        ? (productsData?.results || [])
                            .filter((product: Product) =>
                              product.name.toLowerCase().includes(searchTerm),
                            )
                            .sort((a: Product, b: Product) => {
                              const aStarts = a.name
                                .toLowerCase()
                                .startsWith(searchTerm);
                              const bStarts = b.name
                                .toLowerCase()
                                .startsWith(searchTerm);
                              if (aStarts && !bStarts) return -1;
                              if (!aStarts && bStarts) return 1;
                              return 0;
                            })
                        : productsData?.results || [];

                      return filteredProducts.length > 0 ? (
                        <ul className="divide-y p-2">
                          {filteredProducts.map((product: Product) => (
                            <li key={product.uid}>
                              <label className="my-1 flex w-full cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <input
                                  type="checkbox"
                                  checked={localSelection.includes(product.uid)}
                                  onChange={(e) => {
                                    setLocalSelection((prev) =>
                                      e.target.checked
                                        ? [...prev, product.uid]
                                        : prev.filter((p) => p !== product.uid),
                                    );
                                  }}
                                  className="h-4 w-4 cursor-pointer"
                                  style={{
                                    accentColor: "#027f81",
                                  }}
                                />
                                <span className="text-sm">{product.name}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-2 text-sm text-gray-500">
                          No products found
                        </div>
                      );
                    })()
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isLoading} onClick={handleSave}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingProductsModal;

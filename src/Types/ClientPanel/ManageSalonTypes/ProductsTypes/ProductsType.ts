export interface ProductProps {
  uid: string;
  name: string;
  category: string;
  sub_category: string;
  price: string;
  description?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
export interface ProductFormValues {
  name: string;
  category: string;
  sub_category: string;
  price: string;
  description: string;
  uploaded_images?: string;
}

export interface ProductCategory {
  uid: string;
  name: string;
}

export interface EditProductBasicInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: ProductProps;
  onEditSuccess?: () => void;
}

export interface DeleteProductDialogProps {
  selectedProduct: ProductProps;
  isOpen: boolean;
  onClose: () => void;
}

export interface ViewProductPanelProps {
  selectedProduct: ProductProps;
  onClose?: () => void;
}

export interface FullScreenImageViewerProps {
  isOpen: boolean;
  images: string[];
  currentImageIndex: number;
  onClose: () => void;
  onImageChange: (index: number) => void;
  productName?: string;
}

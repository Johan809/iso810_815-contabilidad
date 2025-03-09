
import React, { useState } from 'react';
import { PackagePlus, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';

// Sample data
const initialData = [
  { id: 1, name: "Premium Laptop", sku: "LPT-001", price: "$1299.99", category: "Electronics", stock: "24" },
  { id: 2, name: "Wireless Headphones", sku: "WH-100", price: "$249.99", category: "Audio", stock: "58" },
  { id: 3, name: "Smart Watch", sku: "SW-220", price: "$399.99", category: "Wearables", stock: "31" },
  { id: 4, name: "Ergonomic Keyboard", sku: "KB-450", price: "$129.99", category: "Accessories", stock: "42" },
  { id: 5, name: "4K Monitor", sku: "MON-4K", price: "$599.99", category: "Electronics", stock: "16" },
  { id: 6, name: "Wireless Mouse", sku: "MOU-W20", price: "$79.99", category: "Accessories", stock: "67" },
  { id: 7, name: "External SSD 1TB", sku: "SSD-1T", price: "$179.99", category: "Storage", stock: "23" },
  { id: 8, name: "USB-C Hub", sku: "HUB-C4", price: "$59.99", category: "Accessories", stock: "48" },
  { id: 9, name: "Gaming Console", sku: "GC-X1", price: "$499.99", category: "Gaming", stock: "12" },
  { id: 10, name: "Bluetooth Speaker", sku: "SPK-BT", price: "$129.99", category: "Audio", stock: "35" },
  { id: 11, name: "Smartphone Premium", sku: "SP-PRO", price: "$999.99", category: "Electronics", stock: "19" },
  { id: 12, name: "Tablet 10-inch", sku: "TAB-10", price: "$349.99", category: "Electronics", stock: "27" }
];

const columns = [
  { key: "name", header: "Product Name" },
  { key: "sku", header: "SKU" },
  { key: "price", header: "Price" },
  { key: "category", header: "Category" },
  { key: "stock", header: "Stock" },
];

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: product?.id || 0,
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price ? product.price.replace('$', '') : '',
    category: product?.category || 'Electronics',
    stock: product?.stock || '',
    description: product?.description || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: `$${formData.price}`
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter product name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sku">SKU</Label>
        <Input
          id="sku"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="Product SKU"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="price"
              name="price"
              type="text"
              value={formData.price}
              onChange={handleChange}
              className="pl-8"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Available quantity"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select 
          value={formData.category}
          onValueChange={(value) => handleSelectChange('category', value)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Audio">Audio</SelectItem>
            <SelectItem value="Wearables">Wearables</SelectItem>
            <SelectItem value="Accessories">Accessories</SelectItem>
            <SelectItem value="Storage">Storage</SelectItem>
            <SelectItem value="Gaming">Gaming</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Product description"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

const Products = () => {
  const [products, setProducts] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const { toast } = useToast();

  const handleCreateProduct = () => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitProduct = (productData) => {
    if (productData.id === 0) {
      // Create new product
      const newProduct = {
        ...productData,
        id: Math.max(0, ...products.map(p => p.id)) + 1
      };
      setProducts([newProduct, ...products]);
      toast({
        title: "Product Created",
        description: `${newProduct.name} has been successfully added to inventory.`,
      });
    } else {
      // Update existing product
      setProducts(products.map(product => 
        product.id === productData.id ? productData : product
      ));
      toast({
        title: "Product Updated",
        description: `${productData.name} has been successfully updated.`,
      });
    }
    setIsModalOpen(false);
  };

  const confirmDeleteProduct = () => {
    if (currentProduct) {
      setProducts(products.filter(product => product.id !== currentProduct.id));
      toast({
        title: "Product Deleted",
        description: `${currentProduct.name} has been removed from inventory.`,
        variant: "destructive",
      });
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your product inventory and catalog.</p>
        </div>
        <Button onClick={handleCreateProduct} className="md:self-start animate-fade-in">
          <PackagePlus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Create/Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentProduct ? "Edit Product" : "Create New Product"}
      >
        <ProductForm
          product={currentProduct}
          onSubmit={handleSubmitProduct}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProduct}>
              Delete
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">Are you sure you want to delete this product?</p>
            {currentProduct && (
              <p className="text-muted-foreground mt-1">
                {currentProduct.name} ({currentProduct.sku})
              </p>
            )}
            <p className="text-muted-foreground mt-4 text-sm">
              This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;

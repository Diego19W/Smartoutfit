import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, ChevronUp, ChevronDown, Filter, X, Camera } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { CustomSelect } from "../CustomSelect";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  Product
} from "../../utils/database";

// Re-exporting or using the imported Product interface. 
// We need to make sure SizeStock is compatible or defined.
// database.ts defines sizeStock as an object with optional keys, here we need required keys for the UI logic?
// Let's define SizeStock locally for UI helper if needed, or use the one from Product.
// Product from database.ts has sizeStock?: { XS?: number ... }

interface SizeStock {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
}

const AVAILABLE_COLORS = [
  { name: 'Negro', value: 'black', hex: '#000000' },
  { name: 'Blanco', value: 'white', hex: '#FFFFFF' },
  { name: 'Azul', value: 'blue', hex: '#3B82F6' },
  { name: 'Rojo', value: 'red', hex: '#EF4444' },
  { name: 'Verde', value: 'green', hex: '#10B981' },
  { name: 'Rosa', value: 'pink', hex: '#EC4899' },
  { name: 'Amarillo', value: 'yellow', hex: '#F59E0B' },
  { name: 'Gris', value: 'gray', hex: '#6B7280' },
];

export function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [cut, setCut] = useState("");
  const [materials, setMaterials] = useState("");
  const [brand, setBrand] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sizeStock, setSizeStock] = useState<SizeStock>({ XS: 0, S: 0, M: 0, L: 0, XL: 0 });
  const [price, setPrice] = useState("");
  const [gender, setGender] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      // Ensure sizeStock has all keys for UI
      const processedData = data.map(p => ({
        ...p,
        sizeStock: {
          XS: p.sizeStock?.XS || 0,
          S: p.sizeStock?.S || 0,
          M: p.sizeStock?.M || 0,
          L: p.sizeStock?.L || 0,
          XL: p.sizeStock?.XL || 0,
        }
      }));
      setProducts(processedData);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const updateProductSizeStock = async (productId: number, size: keyof SizeStock, increment: boolean) => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.sizeStock) return;

    const currentValue = product.sizeStock[size as keyof typeof product.sizeStock] || 0;
    const newValue = Math.max(0, currentValue + (increment ? 1 : -1));

    // No update needed if value doesn't change
    if (currentValue === newValue) return;

    const newSizeStock = {
      ...product.sizeStock,
      [size]: newValue
    };

    const totalStock = Object.values(newSizeStock).reduce((a, b) => a + b, 0);
    const newStatus = (totalStock === 0 ? 'out' : totalStock < 10 ? 'low' : 'active') as 'active' | 'low' | 'out';

    const updatedProduct = {
      ...product,
      sizeStock: newSizeStock,
      stock: totalStock,
      status: newStatus
    };

    // Optimistic update
    setProducts(prevProducts =>
      prevProducts.map(p => p.id === productId ? updatedProduct : p)
    );

    try {
      // Send FULL product data to avoid data loss
      await updateProduct(productId, updatedProduct);
    } catch (error) {
      console.error("Failed to update stock", error);
      // Revert on error
      setProducts(prevProducts =>
        prevProducts.map(p => p.id === productId ? product : p)
      );
      alert("Error al actualizar el stock. Por favor intenta de nuevo.");
    }
  };

  const handleColorToggle = (colorValue: string) => {
    if (selectedColors.includes(colorValue)) {
      setSelectedColors(selectedColors.filter(c => c !== colorValue));
    } else {
      setSelectedColors([...selectedColors, colorValue]);
    }
  };

  const updateSizeStock = (size: keyof SizeStock, increment: boolean) => {
    setSizeStock(prev => ({
      ...prev,
      [size]: Math.max(0, prev[size] + (increment ? 1 : -1))
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (uploadedImages.length >= 5) return;

      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setUploadedImages([...uploadedImages, url]);
      } catch (error) {
        console.error("Failed to upload image", error);
        alert("Error uploading image");
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setProductName("");
    setCategory("");
    setDescription("");
    setCut("");
    setMaterials("");
    setBrand("");
    setSelectedColors([]);
    setSizeStock({ XS: 0, S: 0, M: 0, L: 0, XL: 0 });
    setPrice("");
    setGender("");
    setUploadedImages([]);
    setEditingProduct(null);
    setIsEditMode(false);
  };

  const handleAddProduct = () => {
    setIsEditMode(false);
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setIsEditMode(true);
    setEditingProduct(product);
    setProductName(product.name);
    setCategory(product.category);
    setDescription(product.description || "");
    setCut(product.cut || "");
    setMaterials(product.materials || "");
    setBrand(product.brand || "");
    setSelectedColors(product.colors || []);
    // Ensure sizeStock is populated
    setSizeStock({
      XS: product.sizeStock?.XS || 0,
      S: product.sizeStock?.S || 0,
      M: product.sizeStock?.M || 0,
      L: product.sizeStock?.L || 0,
      XL: product.sizeStock?.XL || 0,
    });
    setPrice(product.price.toString());
    setGender(product.gender || "");
    setUploadedImages(product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []));
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Failed to delete product", error);
        alert("Error al eliminar el producto");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalStock = Object.values(sizeStock).reduce((a, b) => a + b, 0);
    const productData = {
      name: productName,
      category,
      description,
      cut,
      materials,
      brand,
      colors: selectedColors,
      sizeStock,
      price: parseFloat(price),
      gender,
      stock: totalStock,
      status: (totalStock === 0 ? 'out' : totalStock < 10 ? 'low' : 'active') as 'active' | 'low' | 'out',
      image: uploadedImages[0] || "",
      images: uploadedImages
    };

    try {
      if (isEditMode && editingProduct) {
        const updated = await updateProduct(editingProduct.id, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...updated, sizeStock } : p));
      } else {
        const created = await createProduct(productData);
        setProducts([...products, { ...created, sizeStock }]);
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save product", error);
      alert("Error al guardar el producto");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="tracking-wider text-2xl mb-1">GESTIÓN DE INVENTARIO</h3>
            <p className="text-sm opacity-60">Administra tus productos</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="bg-black text-white px-6 py-3 tracking-wider hover:bg-black/80 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            AGREGAR PRODUCTO
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border border-black/10 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-12 pr-4 py-3 border border-black/20 bg-white focus:border-black outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40 z-10 pointer-events-none" />
            <CustomSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: "all", label: "Todas las categorías" },
                { value: "Vestidos", label: "Vestidos" },
                { value: "Abrigos", label: "Abrigos" },
                { value: "Accesorios", label: "Accesorios" },
              ]}
              placeholder="Categoría"
              className="pl-8"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40 z-10 pointer-events-none" />
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "Todos los estados" },
                { value: "active", label: "Activo" },
                { value: "low", label: "Stock Bajo" },
                { value: "out", label: "Agotado" },
              ]}
              placeholder="Estado"
              className="pl-8"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-black/10 overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-neutral-50 border-b border-black/10">
            <tr>
              <th className="text-left px-4 py-4 text-sm tracking-wider opacity-70 whitespace-nowrap">ID</th>
              <th className="text-left px-4 py-4 text-sm tracking-wider opacity-70 whitespace-nowrap">PRODUCTO</th>
              <th className="text-left px-4 py-4 text-sm tracking-wider opacity-70 whitespace-nowrap">CATEGORÍA</th>
              <th className="text-left px-4 py-4 text-sm tracking-wider opacity-70 whitespace-nowrap">PRECIO</th>
              <th className="text-center px-2 py-4 text-sm tracking-wider opacity-70 whitespace-nowrap">STOCK POR TALLA</th>
              <th className="text-left px-4 py-4 text-sm tracking-wider opacity-70 whitespace-nowrap">TOTAL</th>
              <th className="text-left px-4 py-4 text-sm tracking-wider opacity-70 whitespace-nowrap">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">Cargando productos...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8">No se encontraron productos</td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const sizes: Array<keyof SizeStock> = ['XS', 'S', 'M', 'L', 'XL'];

                return (
                  <tr key={product.id} className="border-b border-black/5 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-4 text-center">{product.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-100 flex-shrink-0">
                          <ImageWithFallback
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-[200px]">
                          <span className="tracking-wide">{product.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 opacity-70 whitespace-nowrap">{product.category}</td>
                    <td className="px-4 py-4 whitespace-nowrap">${product.price.toLocaleString('es-MX')}</td>
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-2">
                        {sizes.map((size) => (
                          <div key={size} className="flex flex-col items-center min-w-[60px]">
                            <span className="text-xs opacity-60 mb-1">{size}</span>
                            <button
                              onClick={() => updateProductSizeStock(product.id, size, true)}
                              className="w-8 h-6 flex items-center justify-center hover:bg-neutral-200 transition-colors rounded-t border border-black/10"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <div className="w-12 h-8 flex items-center justify-center border-x border-black/10">
                              <span className="text-sm">{product.sizeStock ? product.sizeStock[size] : 0}</span>
                            </div>
                            <button
                              onClick={() => updateProductSizeStock(product.id, size, false)}
                              className="w-8 h-6 flex items-center justify-center hover:bg-neutral-200 transition-colors rounded-b border border-black/10"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">{product.stock} Unidades</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-neutral-100 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-black/10">
          <p className="text-sm opacity-60 mb-2">Total de Productos</p>
          <h4 className="text-2xl tracking-wider">{filteredProducts.length}</h4>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <p className="text-sm opacity-60 mb-2">Stock Total</p>
          <h4 className="text-2xl tracking-wider">
            {filteredProducts.reduce((sum, p) => sum + p.stock, 0)} Unidades
          </h4>
        </div>
        <div className="bg-white p-6 border border-black/10">
          <p className="text-sm opacity-60 mb-2">Alertas de Stock</p>
          <h4 className="text-2xl tracking-wider text-red-600">
            {filteredProducts.filter(p => p.status === 'low' || p.status === 'out').length}
          </h4>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white max-w-7xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6 border-b border-black/10 flex items-center justify-between sticky top-0 bg-white z-10">
              <h4 className="tracking-wider text-xl">
                {isEditMode ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
              </h4>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left Side - Detalles De Ropa */}
                <div className="space-y-6">
                  <h3 className="text-2xl mb-6">Detalles De Ropa</h3>

                  {/* Nombre */}
                  <div>
                    <label className="block text-sm mb-2 opacity-70">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full p-3 border border-black/20 bg-white focus:border-black outline-none"
                      placeholder="Nombre del producto"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm mb-2 opacity-70">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={category}
                      onChange={setCategory}
                      options={[
                        { value: "Vestidos", label: "Vestidos" },
                        { value: "Abrigos", label: "Abrigos" },
                        { value: "Pantalones", label: "Pantalones" },
                        { value: "Camisas", label: "Camisas" },
                        { value: "Accesorios", label: "Accesorios" },
                        { value: "Zapatos", label: "Zapatos" },
                      ]}
                      placeholder="Seleccionar categoría"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm mb-2 opacity-70">Descripción</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full p-3 border border-black/20 bg-white focus:border-black outline-none resize-none"
                      placeholder="Descripción detallada del producto..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Corte de la prenda */}
                    <div>
                      <label className="block text-sm mb-2 opacity-70">
                        Corte de la prenda <span className="text-red-500">*</span>
                      </label>
                      <CustomSelect
                        value={cut}
                        onChange={setCut}
                        options={[
                          { value: "ajustado", label: "Ajustado" },
                          { value: "regular", label: "Regular" },
                          { value: "holgado", label: "Holgado" },
                          { value: "oversize", label: "Oversize" },
                        ]}
                        placeholder="Seleccionar"
                      />
                    </div>

                    {/* Materiales */}
                    <div>
                      <label className="block text-sm mb-2 opacity-70">Materiales</label>
                      <CustomSelect
                        value={materials}
                        onChange={setMaterials}
                        options={[
                          { value: "algodon", label: "100% Algodón" },
                          { value: "poliester", label: "Poliéster" },
                          { value: "lana", label: "Lana" },
                          { value: "seda", label: "Seda" },
                          { value: "mezclilla", label: "Mezclilla" },
                          { value: "mezcla", label: "Mezcla" },
                        ]}
                        placeholder="Seleccionar"
                      />
                    </div>
                  </div>

                  {/* Marca */}
                  <div>
                    <label className="block text-sm mb-2 opacity-70">
                      Marca <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={brand}
                      onChange={setBrand}
                      options={[
                        { value: "MODAIX", label: "MODAIX" },
                        { value: "Otra", label: "Otra" },
                      ]}
                      placeholder="Seleccionar marca"
                    />
                  </div>

                  {/* Género */}
                  <div>
                    <label className="block text-sm mb-2 opacity-70">
                      Género <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={gender}
                      onChange={setGender}
                      options={[
                        { value: "hombre", label: "Masculino" },
                        { value: "mujer", label: "Femenino" },
                        { value: "unisex", label: "Unisex" },
                      ]}
                      placeholder="Seleccionar género"
                    />
                  </div>

                  {/* Colores */}
                  <div>
                    <label className="block text-sm mb-2 opacity-70">Colores</label>
                    <div className="border border-black/20 p-3 bg-white">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedColors.map((color) => {
                          const colorObj = AVAILABLE_COLORS.find(c => c.value === color);
                          return (
                            <div
                              key={color}
                              className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                              style={{ backgroundColor: colorObj?.hex, color: color === 'white' ? '#000' : '#fff' }}
                            >
                              {colorObj?.name}
                              <button
                                type="button"
                                onClick={() => handleColorToggle(color)}
                                className="hover:opacity-70"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <CustomSelect
                        value=""
                        onChange={(value) => {
                          if (value && !selectedColors.includes(value)) {
                            handleColorToggle(value);
                          }
                        }}
                        options={AVAILABLE_COLORS.map(color => ({
                          value: color.value,
                          label: color.name
                        }))}
                        placeholder="Seleccionar color"
                        className="text-sm"
                      />
                      <p className="text-xs opacity-60 mt-2">Selecciona de 1 a 3 colores</p>
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm mb-2 opacity-70">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      {(['XS', 'S', 'M', 'L', 'XL'] as const).map((size) => (
                        <div key={size} className="flex flex-col items-center">
                          <span className="text-xs mb-2 opacity-70">{size}</span>
                          <button
                            type="button"
                            onClick={() => updateSizeStock(size, true)}
                            className="w-8 h-6 flex items-center justify-center border border-black/20 hover:bg-neutral-100 rounded-t"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <div className="w-12 h-10 flex items-center justify-center border-x border-black/20 bg-neutral-50">
                            <span>{sizeStock[size]}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateSizeStock(size, false)}
                            className="w-8 h-6 flex items-center justify-center border border-black/20 hover:bg-neutral-100 rounded-b"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs opacity-60 mt-2">
                      Selecciona el stock de cada talla y presiona el botón titular con el símbolo más o menos para editar el stock
                    </p>
                  </div>

                  {/* Precio */}
                  <div>
                    <label className="block text-sm mb-2 opacity-70">
                      Precio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3 border border-black/20 bg-white focus:border-black outline-none"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Right Side - Fotos Ropa */}
                <div className="space-y-6">
                  <h3 className="text-2xl mb-6">Fotos Ropa</h3>

                  {/* Upload Area - Mostrar cuando hay imágenes o como principal si está vacío */}
                  {uploadedImages.length === 0 ? (
                    <div className="border-2 border-dashed border-black/20 rounded-lg p-12 text-center">
                      <label
                        className="inline-flex flex-col items-center gap-4 hover:opacity-70 transition-opacity cursor-pointer"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                        <Camera className="w-16 h-16 opacity-40" />
                        <div>
                          <p className="mb-1">Arrastra una imagen o</p>
                          <p className="underline">haz click para subir una imagen</p>
                        </div>
                      </label>
                      {uploading && (
                        <div className="mt-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                          <p className="text-sm opacity-60 mt-2">Subiendo imagen...</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Grilla de imágenes subidas */}
                      <div className="grid grid-cols-3 gap-4">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative border-2 border-dashed border-black/20 rounded aspect-square group">
                            <ImageWithFallback
                              src={img}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-full object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {index === 0 && (
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                Principal
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Botón para añadir más imágenes */}
                        {uploadedImages.length < 5 && (
                          <label
                            className="border-2 border-dashed border-black/20 rounded aspect-square flex flex-col items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={uploading}
                            />
                            {uploading ? (
                              <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-2"></div>
                                <span className="text-xs opacity-60">Subiendo...</span>
                              </>
                            ) : (
                              <>
                                <Camera className="w-8 h-8 opacity-40 mb-2" />
                                <span className="text-xs opacity-60">Añadir foto</span>
                              </>
                            )}
                          </label>
                        )}
                      </div>

                      <p className="text-xs opacity-60 text-center">
                        {uploadedImages.length}/5 imágenes • La primera imagen será la principal
                      </p>
                    </>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 transition-colors text-xl tracking-wider"
                    disabled={uploading}
                  >
                    {isEditMode ? 'GUARDAR' : 'AÑADIR'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

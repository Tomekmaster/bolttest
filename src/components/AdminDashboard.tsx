import { useEffect, useState } from 'react';
import { Package, DollarSign, Users, ShoppingCart, Trash2 } from 'lucide-react';
import { supabase, Product, Order } from '../lib/supabase';

interface OrderWithItems extends Order {
  order_items: {
    quantity: number;
    price_at_purchase: number;
    product: Product;
  }[];
  profiles: {
    email: string;
    full_name: string;
  };
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price_at_purchase,
            product:products (*)
          ),
          profiles (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
      setOrders(ordersData as OrderWithItems[] || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.total), 0),
    lowStock: products.filter((p) => p.stock < 10).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-6 text-white">
          <Package className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Total Products</p>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-6 text-white">
          <ShoppingCart className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Total Orders</p>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-6 text-white">
          <DollarSign className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Total Revenue</p>
          <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-xl p-6 text-white">
          <Users className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Low Stock Items</p>
          <p className="text-3xl font-bold">{stats.lowStock}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'products'
                ? 'bg-yellow-400 text-gray-800'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'bg-yellow-400 text-gray-800'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Orders
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'products' ? (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{product.category}</td>
                        <td className="py-3 px-4 font-semibold text-yellow-600">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={product.stock}
                            onChange={(e) =>
                              handleUpdateStock(product.id, parseInt(e.target.value) || 0)
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {order.profiles?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">{order.profiles?.email}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-600">
                        ${Number(order.total).toFixed(2)}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.order_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.product?.name} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          ${(item.price_at_purchase * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

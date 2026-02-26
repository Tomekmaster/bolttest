import { useEffect, useState } from 'react';
import { Package, Calendar, DollarSign } from 'lucide-react';
import { supabase, Order, OrderItem, Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OrderWithItems extends Order {
  order_items: (OrderItem & { product: Product })[];
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as OrderWithItems[] || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-4xl font-bold text-gray-800 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500 mb-2">No orders yet</p>
          <p className="text-gray-400">Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-gray-800 mb-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">Order ID: {order.id.slice(0, 8)}</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-2 mb-2">
                      <DollarSign className="w-6 h-6 text-gray-800" />
                      <span className="text-3xl font-bold text-gray-800">
                        {Number(order.total).toFixed(2)}
                      </span>
                    </div>
                    <span
                      className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
                        order.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : order.status === 'pending'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4"
                    >
                      <img
                        src={item.product?.image_url}
                        alt={item.product?.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />

                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {item.product?.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          Price: ${Number(item.price_at_purchase).toFixed(2)} each
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-yellow-600">
                          ${(Number(item.price_at_purchase) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

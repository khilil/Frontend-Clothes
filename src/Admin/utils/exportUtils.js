/**
 * 📊 Export orders array to a CSV file and trigger download
 */
export const exportOrdersToCSV = (orders) => {
    const headers = [
        'Order ID', 
        'Date', 
        'Customer Name', 
        'Email', 
        'Phone', 
        'Total Amount (INR)', 
        'Payment Method', 
        'Payment Status', 
        'Order Status', 
        'Total Items'
    ];
    
    const csvRows = orders.map(order => {
        return [
            order._id,
            new Date(order.createdAt).toLocaleDateString(),
            order.shippingAddress?.fullName || order.user?.fullName || '',
            order.user?.email || '',
            order.shippingAddress?.phone || '',
            order.totalAmount,
            order.paymentMethod,
            order.paymentStatus,
            order.orderStatus,
            order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
        ].map(val => `"${val}"`).join(',');
    });
  
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Fenrir_Era_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

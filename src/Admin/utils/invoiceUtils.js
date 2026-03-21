/**
 * 📝 Core Invoice Component HTML
 */
const getInvoiceBody = (order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    const items = order.items || [];
    const subtotal = order.totalAmount || 0;
    const grandTotal = subtotal;

    return `
        <div class="invoice-container">
            <div class="header">
                <div>
                    <div class="brand">FENRIR ERA</div>
                    <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Premium Gentleman's Apparel</p>
                </div>
                <div style="text-align: right;">
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800;">INVOICE</h1>
                    <p style="font-size: 12px; color: #64748b; margin: 4px 0;">#${order._id.toString().toUpperCase()}</p>
                    <p style="font-size: 12px; color: #64748b; margin: 0;">Date: ${date}</p>
                </div>
            </div>

            <div class="details">
                <div>
                    <div class="section-title">Billed To</div>
                    <div style="font-weight: 700; font-size: 15px;">${order.shippingAddress?.fullName || 'Customer'}</div>
                    <p style="font-size: 12px; line-height: 1.5; color: #475569; margin-top: 4px;">
                        ${order.shippingAddress?.addressLine}<br>
                        ${order.shippingAddress?.city}, ${order.shippingAddress?.state}<br>
                        ${order.shippingAddress?.pincode}
                    </p>
                    <div style="font-size: 12px; color: #475569; margin-top: 8px;">
                        <span>Email: ${order.user?.email || 'N/A'}</span><br>
                        <span>Phone: ${order.shippingAddress?.phone || 'N/A'}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="section-title">Payment Info</div>
                    <div style="font-size: 13px; font-weight: 600;">Method: ${order.paymentMethod}</div>
                    <div style="font-size: 13px; color: ${order.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b'}; margin-top: 4px;">
                        Status: ${order.paymentStatus.toUpperCase()}
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th>Price</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>
                                <div style="font-weight: 700;">${item.title || item.name}</div>
                                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">SKU: ${item.variantId}</div>
                            </td>
                            <td>₹${(item.priceAtPurchase || 0).toLocaleString()}</td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right; font-weight: 700;">₹${((item.priceAtPurchase || 0) * item.quantity).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total-section">
                <div class="total-row">
                    <span style="color: #64748b;">Subtotal</span>
                    <span style="font-weight: 600;">₹${subtotal.toLocaleString()}</span>
                </div>
                <div class="total-row">
                    <span style="color: #64748b;">Shipping</span>
                    <span style="font-weight: 600; color: #10b981;">FREE</span>
                </div>
                <div class="total-row grand">
                    <span>Grand Total</span>
                    <span>₹${grandTotal.toLocaleString()}</span>
                </div>
            </div>

            <div class="footer">
                <p style="font-weight: 700; margin-bottom: 4px;">Thank you for your business!</p>
                <p>For any queries, contact us at ${import.meta.env.VITE_SUPPORT_EMAIL || 'support@fenrirera.com'}</p>
            </div>
        </div>
    `;
};

/**
 * 👗 Styles for the Invoice
 */
const invoiceStyles = `
    body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 0; margin: 0; }
    .invoice-container { padding: 40px; page-break-after: always; min-height: 100vh; box-sizing: border-box; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { color: #4f46e5; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.1em; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; padding: 12px; border-bottom: 1px solid #f1f5f9; }
    td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    .total-section { margin-left: auto; width: 250px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
    .total-row.grand { border-top: 2px solid #f1f5f9; margin-top: 8px; padding-top: 12px; font-weight: 800; font-size: 18px; color: #4f46e5; }
    .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
    @media print { 
        body { padding: 0; } 
        .no-print { display: none; } 
        .invoice-container { border: none; }
    }
`;

/**
 * 📦 Wrapper for Full HTML
 */
const wrapHTML = (content) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>${invoiceStyles}</style>
    </head>
    <body>
        ${content}
        <script>
            window.onload = () => {
                window.print();
            };
        </script>
    </body>
    </html>
`;

/**
 * 📝 Generate a single invoice
 */
export const generateInvoiceHTML = (order) => {
    return wrapHTML(getInvoiceBody(order));
};

/**
 * 📚 Generate multiple invoices in one document
 */
export const generateBulkInvoiceHTML = (orders) => {
    const content = orders.map(order => getInvoiceBody(order)).join('');
    return wrapHTML(content);
};

/**
 * 🏷 Generate Shipping Label HTML
 */
export const generateShippingLabelHTML = (order) => {
    const address = order.shippingAddress || {};
    const content = `
        <div style="width: 100mm; height: 150mm; padding: 20px; font-family: 'Inter', sans-serif; box-sizing: border-box; border: 1px solid #ccc; margin: 0 auto;">
            <div style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -1px;">FENRIR ERA</h1>
                <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: bold;">ORDER #${order._id.toString().toUpperCase()}</p>
            </div>
            
            <p style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">SHIP TO:</p>
            <h2 style="margin: 0 0 10px 0; font-size: 20px;">${address.fullName}</h2>
            <p style="font-size: 16px; line-height: 1.5; margin: 0;">
                ${address.addressLine}<br/>
                ${address.city}, ${address.state}<br/>
                ${address.pincode}
            </p>
            <p style="font-size: 14px; margin-top: 15px; font-weight: bold;">Phone: ${address.phone}</p>
            
            <div style="margin-top: 30px; border-top: 1px dashed #000; padding-top: 15px;">
                <p style="font-size: 10px; text-align: center; margin: 0;">Return Address:<br/>Fenrir Era Warehouse, Surat, India</p>
            </div>
        </div>
    `;
    return wrapHTML(content);
};

/**
 * 📦 Generate Packing Slip HTML
 */
export const generatePackingSlipHTML = (order) => {
    const items = order.items || [];
    const content = `
        <div class="invoice-container">
            <div class="header" style="border-bottom: 4px solid #000;">
                <div>
                    <div class="brand">FENRIR ERA</div>
                    <h2 style="margin: 5px 0; font-size: 24px;">PACKING SLIP</h2>
                </div>
                <div style="text-align: right;">
                    <p style="font-size: 14px; font-weight: bold; margin: 0;">ORDER #${order._id.toString().toUpperCase()}</p>
                    <p style="font-size: 12px; margin: 5px 0;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div class="details">
                <div>
                    <div class="section-title">Ship To</div>
                    <div style="font-weight: 700; font-size: 16px;">${order.shippingAddress?.fullName || 'Customer'}</div>
                    <p style="font-size: 14px; line-height: 1.5; margin-top: 4px;">
                        ${order.shippingAddress?.addressLine}<br>
                        ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.pincode}
                    </p>
                </div>
            </div>

            <table style="margin-top: 30px;">
                <thead>
                    <tr style="border-bottom: 2px solid #000;">
                        <th>Item Description</th>
                        <th>Variant/SKU</th>
                        <th style="font-size: 14px; text-align: center;">Qty</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td style="font-size: 16px; font-weight: 600;">${item.title || item.name}</td>
                            <td>${item.variantId}</td>
                            <td style="font-size: 18px; font-weight: 900; text-align: center;">${item.quantity}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    return wrapHTML(content);
};

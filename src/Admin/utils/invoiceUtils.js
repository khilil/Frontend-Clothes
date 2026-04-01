/**
 * 📝 Core Invoice Component HTML
 */
const getInvoiceBody = (order) => {
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const items = order.items || [];
    const subtotal = order.totalAmount || 0;
    const grandTotal = subtotal;

    return `
        <div class="invoice-container">
            <div class="luxury-seal">CERTIFIED LUXURY APPAREL</div>
            <div class="header">
                <div>
                    <div class="brand">FENRIR ERA</div>
                    <p style="font-family: 'Bodoni Moda', serif; font-size: 10px; color: #B8860B; margin-top: 4px; letter-spacing: 0.3em; font-weight: 700; text-transform: uppercase;">Premium Gentleman's Archival Collection</p>
                </div>
                <div style="text-align: right;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.05em; color: #1A1A1A;">OFFICIAL INVOICE</h1>
                    <p style="font-size: 11px; color: #888; margin: 4px 0; font-weight: 800;">HUB_OP_ID: ${order._id.toString().toUpperCase()}</p>
                    <p style="font-size: 11px; color: #1A1A1A; margin: 0; font-weight: 700;">ISSUED: ${date}</p>
                </div>
            </div>

            <div class="details">
                <div class="detail-box">
                    <div class="section-title">Recipient Information</div>
                    <div style="font-weight: 800; font-size: 16px; color: #1A1A1A;">${order.shippingAddress?.fullName || 'Customer'}</div>
                    <p style="font-size: 12px; line-height: 1.6; color: #444; margin-top: 6px; font-weight: 500;">
                        ${order.shippingAddress?.addressLine}<br>
                        ${order.shippingAddress?.city}, ${order.shippingAddress?.state}<br>
                        ${order.shippingAddress?.pincode}
                    </p>
                    <div style="font-size: 11px; color: #666; margin-top: 10px; font-weight: 600;">
                        <span style="color: #B8860B;">IDENTIFIER:</span> ${order.user?.email || 'N/A'}<br>
                        <span style="color: #B8860B;">VIRTUAL:</span> ${order.shippingAddress?.phone || 'N/A'}
                    </div>
                </div>
                <div style="text-align: right; display: flex; flex-direction: column; justify-content: flex-end;">
                    <div class="section-title">Transaction Protocol</div>
                    <div style="font-size: 13px; font-weight: 800; color: #1A1A1A;">PROCEDURE: ${order.paymentMethod.toUpperCase()}</div>
                    <div class="payment-status-badge status-${order.paymentStatus.toLowerCase()}">
                        PROTOCOL_${order.paymentStatus.toUpperCase()}
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 50%">Archival Description</th>
                        <th style="text-align: right">Unit Valuation</th>
                        <th style="text-align: center">Qty</th>
                        <th style="text-align: right">Extended Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>
                                <div style="font-weight: 800; color: #1A1A1A; font-size: 14px;">${item.title || item.name}</div>
                                <div style="font-size: 9px; color: #B8860B; margin-top: 3px; font-weight: 800; letter-spacing: 0.1em;">SKU_REF: ${item.variantId}</div>
                            </td>
                            <td style="text-align: right; font-weight: 600;">₹${(item.priceAtPurchase || 0).toLocaleString()}</td>
                            <td style="text-align: center; font-weight: 800;">${item.quantity}</td>
                            <td style="text-align: right; font-weight: 900; color: #1A1A1A;">₹${((item.priceAtPurchase || 0) * item.quantity).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="financial-summary">
                <div class="total-row">
                    <span class="label">Gross Ledger</span>
                    <span class="value">₹${subtotal.toLocaleString()}</span>
                </div>
                <div class="total-row">
                    <span class="label">Priority Logistics</span>
                    <span class="value" style="color: #10b981;">COMPLIMENTARY</span>
                </div>
                <div class="total-row grand">
                    <span class="label">Net Settlement</span>
                    <span class="value">₹${grandTotal.toLocaleString()}</span>
                </div>
            </div>

            <div class="footer">
                <p style="font-weight: 900; font-size: 12px; color: #1A1A1A; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Excellence is not an act, but a habit.</p>
                <p style="font-weight: 500;">Secure transmission via Fenrir Era Protocol 4.1</p>
                <p style="margin-top: 4px;">Inquiries: support@fenrirera.com</p>
            </div>
        </div>
    `;
};

/**
 * 👗 Styles for the Invoice
 */
/**
 * 👗 Luxury Styles for the Invoice
 */
const invoiceStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@200;300;400;500;600;700&display=swap');

    body { font-family: 'Inter', sans-serif; color: #1A1A1A; padding: 0; margin: 0; background: #fff; }
    .invoice-container { padding: 50px; page-break-after: always; min-height: 100vh; box-sizing: border-box; position: relative; border: 20px solid #FBFAF5; }
    
    .luxury-seal {
        position: absolute;
        top: 40px;
        left: 50%;
        transform: translateX(-50%);
        font-family: 'Oswald', sans-serif;
        font-size: 8px;
        font-weight: 900;
        letter-spacing: 0.5em;
        color: rgba(184, 134, 11, 0.2);
        border: 1px solid rgba(184, 134, 11, 0.2);
        padding: 4px 12px;
        border-radius: 4px;
        text-transform: uppercase;
    }

    .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #E5E7EB; padding-bottom: 30px; margin-bottom: 40px; margin-top: 40px; }
    .brand { font-family: 'Oswald', sans-serif; font-size: 32px; font-weight: 900; letter-spacing: -0.05em; line-height: 1; color: #1A1A1A; }
    
    .details { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; margin-bottom: 50px; }
    .section-title { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 900; text-transform: uppercase; color: #B8860B; margin-bottom: 12px; letter-spacing: 0.15em; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 50px; border-top: 2px solid #1A1A1A; }
    th { text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #1A1A1A; padding: 15px 10px; border-bottom: 1px solid #E5E7EB; letter-spacing: 0.1em; }
    td { padding: 20px 10px; font-size: 13px; border-bottom: 1px solid #F3F4F6; }

    .payment-status-badge {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 6px;
        font-size: 9px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-top: 10px;
    }
    .status-paid { background: #10b981; color: #fff; }
    .status-pending { background: #f59e0b; color: #fff; }

    .financial-summary { margin-left: auto; width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 13px; font-weight: 600; }
    .total-row .label { color: #666; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
    .total-row .value { color: #1A1A1A; }
    
    .total-row.grand { border-top: 1px solid #1A1A1A; margin-top: 10px; padding-top: 15px; }
    .total-row.grand .label { color: #B8860B; font-weight: 900; font-size: 12px; }
    .total-row.grand .value { font-weight: 900; font-size: 24px; color: #1A1A1A; font-family: 'Oswald', sans-serif; }
    
    .footer { margin-top: auto; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #E5E7EB; padding-top: 30px; line-height: 1.8; }
    
    @media print { 
        body { padding: 0; } 
        .no-print { display: none; } 
        .invoice-container { border: none; padding: 40px; }
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

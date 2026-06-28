import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (order) => {
  const doc = new jsPDF();

  // Branding Colors
  const primaryColor = [0, 35, 111]; // #00236F Navy
  const secondaryColor = [100, 116, 139]; // #64748B Slate

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("TRAVELKART", 15, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Premium Travel Gear & Luggage", 15, 32);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INVOICE", 195, 26, { align: "right" });

  // Reset text color
  doc.setTextColor(30, 41, 59); 

  // Metadata block (Invoice Info)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Invoice Details:", 15, 55);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice ID: INV-${order.tracking_id}`, 15, 62);
  doc.text(`Order Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}`, 15, 68);
  doc.text(`Payment Status: ${order.payment_status.toUpperCase()}`, 15, 74);
  doc.text(`Payment Method: ${order.payment_method}`, 15, 80);

  // Bill To block
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 120, 55);
  doc.setFont("helvetica", "normal");
  doc.text(order.full_name || "Customer Name", 120, 62);
  doc.text(`Phone: ${order.phone || "N/A"}`, 120, 68);
  
  // Format Address (wrap text nicely)
  const addressLines = doc.splitTextToSize(order.address_line || "", 80);
  let addrY = 74;
  addressLines.forEach((line) => {
    doc.text(line, 120, addrY);
    addrY += 6;
  });
  doc.text(`${order.city}, ${order.state} - ${order.pincode}`, 120, addrY);
  doc.text(order.country || "India", 120, addrY + 6);

  // Line Items Table
  const tableHeaders = [["Product Name", "SKU", "Price", "Quantity", "Total"]];
  const tableData = (order.items || []).map((item) => {
    let productName = item.variant?.product_name || "Product Item";
    if (item.is_cancelled) {
      productName += " (CANCELLED)";
    } else if (item.is_returned) {
      productName += " (RETURNED)";
    }
    const sku = item.variant?.sku || "N/A";
    const unitPrice = parseFloat(item.price || 0);
    const qty = parseInt(item.quantity || 1);
    const total = unitPrice * qty;
    return [
      productName,
      sku,
      `INR ${unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      qty.toString(),
      `INR ${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
    ];
  });

  const tableStartY = Math.max(addrY + 20, 95);

  autoTable(doc, {
    startY: tableStartY,
    head: tableHeaders,
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold"
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 35, halign: "right" }
    }
  });

  // Totals Section
  const finalY = doc.lastAutoTable.finalY + 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const discount = parseFloat(order.discount || 0);
  const shippingFee = parseFloat(order.shipping_fee || 0);
  const totalPrice = parseFloat(order.total_price || 0);

  const originalSubtotal = (order.items || []).reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0
  );
  
  const originalPreDiscountSubtotal = originalSubtotal + discount;
  
  const cancelledTotal = (order.items || []).filter(item => item.is_cancelled).reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0
  );

  const returnedTotal = (order.items || []).filter(item => item.is_returned).reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0
  );

  doc.text("Subtotal:", 135, finalY);
  doc.text(`INR ${originalPreDiscountSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 195, finalY, { align: "right" });

  doc.text("Discount:", 135, finalY + 6);
  doc.text(`- INR ${discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 195, finalY + 6, { align: "right" });

  doc.text("Shipping Fee:", 135, finalY + 12);
  doc.text(`INR ${shippingFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 195, finalY + 12, { align: "right" });

  let offset = 18;
  if (cancelledTotal > 0) {
    doc.text("Cancelled Items:", 135, finalY + offset);
    doc.text(`- INR ${cancelledTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 195, finalY + offset, { align: "right" });
    offset += 6;
  }

  if (returnedTotal > 0) {
    doc.text("Returned Items:", 135, finalY + offset);
    doc.text(`- INR ${returnedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 195, finalY + offset, { align: "right" });
    offset += 6;
  }

  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(130, finalY + offset - 2, 195, finalY + offset - 2);

  const grandTotal = Math.max(0, originalPreDiscountSubtotal - discount + shippingFee - cancelledTotal - returnedTotal);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Grand Total:", 135, finalY + offset + 4);
  doc.text(`INR ${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 195, finalY + offset + 4, { align: "right" });

  // Footer terms & greetings
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.text("Thank you for shopping with TravelKart!", 15, finalY + 35);


  // Save the invoice
  doc.save(`Invoice_${order.tracking_id}.pdf`);
};

import React from "react";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

export default function ProductAccordion({ product, openSection, setOpenSection }) {
  return (
    <section className="detail-description-accordion-block font-inter">
      {/* Section 1: Description */}
      <div className="accordion-item">
        <button 
          onClick={() => setOpenSection(openSection === "description" ? "" : "description")} 
          className="accordion-header"
        >
          <span>The Essentials Details</span>
          <span>{openSection === "description" ? "—" : "+"}</span>
        </button>
        {openSection === "description" && (
          <div className="accordion-content">
            <p className="description-text-para">
              {product.description || product.short_description || "No description loaded for this product."}
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Specifications (Global Attributes) */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <div className="accordion-item">
          <button 
            onClick={() => setOpenSection(openSection === "specs" ? "" : "specs")} 
            className="accordion-header"
          >
            <span>Specifications</span>
            <span>{openSection === "specs" ? "—" : "+"}</span>
          </button>
          {openSection === "specs" && (
            <div className="accordion-content">
              <table className="specs-table-matrix">
                <tbody>
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <tr key={key}>
                      <td className="spec-key uppercase">{key}</td>
                      <td className="spec-value">{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Section 3: Shipping & Delivery */}
      <div className="accordion-item">
        <button 
          onClick={() => setOpenSection(openSection === "shipping" ? "" : "shipping")} 
          className="accordion-header"
        >
          <span>Shipping & Guarantee</span>
          <span>{openSection === "shipping" ? "—" : "+"}</span>
        </button>
        {openSection === "shipping" && (
          <div className="accordion-content shipping-accordion-details">
            <div className="shipping-accent-point">
              <Truck size={16} className="text-orange" />
              <div>
                <strong>Estimated Delivery:</strong>
                <p>{product.est_delivery_time || "3 - 5 Business Days"}</p>
              </div>
            </div>

            <div className="shipping-accent-point">
              <ShieldCheck size={16} className="text-orange" />
              <div>
                <strong>Free & Easy Delivery:</strong>
                <p>{product.free_delivery ? "Free shipping included on this product." : "Standard shipping costs apply."}</p>
              </div>
            </div>

            <div className="shipping-accent-point">
              <RotateCcw size={16} className="text-orange" />
              <div>
                <strong>Refund Guarantee:</strong>
                <p>Return eligible within 30 days of receiving shipment order.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

import React, { useState } from "react";
import { SubPageHeader } from "../../../core/input/heading";
import { Button } from "../../../core/elements";
import { Toggle } from "../../../core/elements";

const SectionCard = ({ title, description, children }) => {
  return (
    <div className="bg-bg-white rounded-lg border border-stroke-soft">
      <div className="px-4 py-3 border-b border-stroke-soft">
        <h3 className="text-sm font-semibold text-text-main flex items-center gap-2">
          {title}
        </h3>
        {description && (
          <p className="text-[11px] text-text-sub mt-1">{description}</p>
        )}
      </div>
      <div className="divide-y divide-stroke-soft">
        {children}
      </div>
    </div>
  );
};

const Row = ({ label, sublabel, control }) => {
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div>
        <div className="text-sm text-text-main">{label}</div>
        {sublabel && (
          <div className="text-[11px] text-text-sub mt-0.5">{sublabel}</div>
        )}
      </div>
      <div className="flex items-center gap-2">{control}</div>
    </div>
  );
};

export default function CheckoutSettings() {
  const [useImage, setUseImage] = useState(false);
  const [groupTickets, setGroupTickets] = useState(false);
  const [enableCoupons, setEnableCoupons] = useState(true);
  const [collectAttendee, setCollectAttendee] = useState(false);
  const [limitOne, setLimitOne] = useState(false);
  const [sendInvoice, setSendInvoice] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);

  return (
    <div className="px-4 py-4 space-y-4">
      <SubPageHeader title="Checkout Settings" description="Customize your checkout experience and configure how customers complete their purchases" />

      {/* Header Appearance */}
      <SectionCard
        title="Header Appearance"
        description="Choose between a solid color or custom image for your checkout header"
      >
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-text-main">
              <input type="radio" checked={!useImage} onChange={() => setUseImage(false)} />
              <span>Use solid color</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-text-main">
              <input type="radio" checked={useImage} onChange={() => setUseImage(true)} />
              <span>Use custom image</span>
            </label>
          </div>
          <div>
            <div className="text-[11px] text-text-sub mb-1">Header Background Color</div>
            <div className="flex items-center gap-2">
              <input type="color" className="w-10 h-6 border border-stroke-soft rounded" defaultValue="#6366f1" />
              <span className="text-[11px] text-text-sub">Select a color that matches your brand</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Ticket & Pricing Options */}
      <SectionCard
        title="Ticket & Pricing Options"
        description="Control how tickets are displayed and enable discount features"
      >
        <Row
          label="Group tickets by type"
          sublabel="Organize similar tickets together for easier selection"
          control={<Toggle isEnabled={groupTickets} onToggle={() => setGroupTickets(!groupTickets)} size="small" />}
        />
        <Row
          label="Enable coupon codes"
          sublabel="Allow customers to apply promotional or discount codes at checkout"
          control={<Toggle isEnabled={enableCoupons} onToggle={() => setEnableCoupons(!enableCoupons)} size="small" />}
        />
      </SectionCard>

      {/* Attendee Information */}
      <SectionCard
        title="Attendee Information"
        description="Manage how attendee data is collected during checkout"
      >
        <Row
          label="Collect individual attendee details"
          sublabel="Request name and contact information for each ticket holder"
          control={<Toggle isEnabled={collectAttendee} onToggle={() => setCollectAttendee(!collectAttendee)} size="small" />}
        />
        <Row
          label="Limit to one ticket per customer"
          sublabel="Restrict each customer to purchasing only one ticket (useful for exclusive events)"
          control={<Toggle isEnabled={limitOne} onToggle={() => setLimitOne(!limitOne)} size="small" />}
        />
      </SectionCard>

      {/* Post-Purchase Notifications */}
      <SectionCard
        title="Post-Purchase Notifications"
        description="Choose how customers receive their tickets and confirmations"
      >
        <Row
          label="Send invoice"
          sublabel="Automatically generate and send a PDF invoice after purchase"
          control={<Toggle isEnabled={sendInvoice} onToggle={() => setSendInvoice(!sendInvoice)} size="small" />}
        />
        <Row
          label="Send email confirmation"
          sublabel="Send tickets and order details via email immediately after purchase"
          control={<Toggle isEnabled={sendEmail} onToggle={() => setSendEmail(!sendEmail)} size="small" />}
        />
        <Row
          label="Send WhatsApp notification"
          sublabel="Deliver instant ticket confirmation via WhatsApp message"
          control={<Toggle isEnabled={sendWhatsapp} onToggle={() => setSendWhatsapp(!sendWhatsapp)} size="small" />}
        />
      </SectionCard>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button value="Cancel" type="secondary" />
        <Button value="Save Changes" type="primary" />
      </div>
    </div>
  );
}



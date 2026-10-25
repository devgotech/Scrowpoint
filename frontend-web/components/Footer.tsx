"use client";

import React from "react";
import {
  MarketingFatFooter,
  MinimalistAuthFooter,
  DashboardUtilityBar,
  type MarketingFatFooterProps,
  type MinimalistAuthFooterProps,
  type DashboardUtilityBarProps,
} from "./footers";

/**
 * Main Footer Export for Scrowpoint.
 *
 * Deploys the Three Distinct Footer Strategies:
 * 1. MarketingFatFooter: For Public Marketing Pages, Marketplace, Pricing, Legal, Trust & Safety.
 * 2. MinimalistAuthFooter: For Auth, Onboarding (KYC), Checkout, Post Gadget Wizard, and Admin Arbitration Room.
 * 3. DashboardUtilityBar: For Dashboards, Wallet & Payouts, Escrow Room, Settings, and Notifications.
 *
 * For backwards compatibility, the default export `Footer` maps to `MarketingFatFooter`.
 */

export { MarketingFatFooter, MinimalistAuthFooter, DashboardUtilityBar };
export type { MarketingFatFooterProps, MinimalistAuthFooterProps, DashboardUtilityBarProps };

export const Footer = MarketingFatFooter;
export default Footer;

"use client";

import { useState } from "react";
import styles from "./PremiumCalculatorCTA.module.css";

export function PremiumCalculatorCTA({
  labelBefore = "Reveal Detailed Analysis",
  labelAfter = "Preparing Your Report…",
  onClickAction,
  price,
  buttonClassName = "calculator-premium-cta",
}) {
  const [clicked, setClicked] = useState(false);

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <button
          type="button"
          className={[styles.button, buttonClassName].filter(Boolean).join(" ")}
          onClick={() => {
            if (!clicked) setClicked(true);
            onClickAction?.({ price });
          }}
        >
          {clicked ? labelAfter : labelBefore}
        </button>

        <div className={styles.lockedCard} aria-hidden="true">
          <div className={styles.lockedInner}>
            <div className={styles.lockedTitle}></div>
            <div className={styles.lockedList}>
              <div>• Personalized Mumbai property exit roadmap</div>
              <div>• Capital gains tax optimization strategy</div>
              <div>• Month-by-month transition plan from property to equity</div>
              <div>• Equity allocation framework based on your risk profile</div>
              <div>• Rental yield reality check (Mumbai-specific)</div>
              <div>• When holding property actually makes sense (rare cases)</div>
              <div>• Family conversation framework to execute the exit</div>
              <div>• Hybrid allocation options if full exit isn’t possible</div>
            </div>
          </div>
        </div>

        <div className={styles.compliance}>
          Educational projection based on stated assumptions.
          <br />
          Not investment advice. AMFI Registered — ARN 90008.
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import FreeBetCalculator from "../all_tabs/FreeBetCalculator.tsx";
import BetInsuranceCalculator from "../all_tabs/BetInsuranceCalculator.tsx";
import MustSpendCalculator from "../all_tabs/MustSpendCalculator.tsx";

const Tabs = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  //  Function to handle Tab Switching
  const handleTabSwitch = (event: React.MouseEvent<HTMLLIElement>): void => {
    const tabName = (event.target as HTMLLIElement).dataset.tab; // access data-tab attribute, instead of name
    setActiveTab(tabName || "tab1"); // tab1 is default if invalid tab selected for some reason
  };

  return (
    <div className="Tabs">
      {/* Tab nav */}
      <ul className="nav">
        <li
          className={activeTab === "tab1" ? "active" : ""}
          data-tab="tab1" // <li> cannot have name attributes, instead use data-tab
          onClick={handleTabSwitch}
        >
          FREE BET
        </li>
        <li
          className={activeTab === "tab2" ? "active" : ""}
          data-tab="tab2"
          onClick={handleTabSwitch}
        >
          BET INSURANCE
        </li>
        <li
          className={activeTab === "tab3" ? "active" : ""}
          data-tab="tab3"
          onClick={handleTabSwitch}
        >
          MUST SPEND
        </li>
      </ul>
      <div className="outlet">
        {(() => {
          /* Immediately Invoked Function Expression
          Example:
          const result = (function (a, b) {
            return a * b;
          })(3, 4);
          More concisely:
          const result = ( (a,b) => a*b )(3,4)
          */
          switch (activeTab) {
            case "tab1":
              return <FreeBetCalculator title="Free Bet Calculator" />;
            case "tab2":
              return (
                <BetInsuranceCalculator title="Bet Insurance Calculator" />
              );
            case "tab3":
              return (
                <MustSpendCalculator title="Must Spend Calculator" />
              );
            default:
              return <FreeBetCalculator title="Free Bet Calculator" />;
          }
        })()}
        {/* {activeTab === "tab1" ? (
          <FreeBetCalculator title="Free Bet Calculator"/>
        ) : (
          <BetInsuranceCalculator title="Bet Insurance Calculator"/>
        )} */}
        {/* Update with switch structure (if that exists in TS?) for more tabs */}
      </div>
    </div>
  );
};

export default Tabs;

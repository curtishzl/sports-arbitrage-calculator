import React, { useState } from "react";
import Calculator from "../all_tabs/FreeBetCalculator.tsx";
import SecondTab from "../all_tabs/SecondTab.tsx";

const Tabs = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  //  Function to handle Tab Switching
  const handleTabSwitch = (event: React.MouseEvent<HTMLLIElement>): void => {
    const tabName = (event.target as HTMLLIElement).dataset.tab;  // access data-tab attribute, instead of name
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
          Free Bet
        </li>
        <li
          className={activeTab === "tab2" ? "active" : ""}
          data-tab="tab2"
          onClick={handleTabSwitch}
        >
          Tab 2
        </li>
        <li
          className={activeTab === "tab3" ? "active" : ""}
          data-tab="tab3"
          onClick={handleTabSwitch}
        >
          Tab 3
        </li>
      </ul>
      <div className="outlet">
        {activeTab === "tab1" ? (
          <Calculator title="Free Bet Calculator"></Calculator>
        ) : (
          <SecondTab />
        )}
        {/* Update with switch structure (if that exists in TS?) for more tabs */}
      </div>
    </div>
  );
};

export default Tabs;

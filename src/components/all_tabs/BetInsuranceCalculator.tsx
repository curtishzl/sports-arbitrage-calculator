import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "../../App.css";

interface Props {
  title: string;
}

/*
We want to keep the rounded values that appear on the screen separate from the actual values which are more precise.
The rounded values will also be formatted with +, -, $ and % and formatted to a constant number of decimal places.
*/

const BetInsuranceCalculator = ({ title }: Props) => {
  const initInsuredBetOdds = -110;
  const initInsuredBetAmount = "$ 10"; // Stored as string because of $ inside editable textfield
  const initHedgeBetOdds = -110;
  const initPercentInsured = "100 %";
  const initPercentConversion = "60 %";
  const initHedgeBetAmount = getHedgeAmount(
    initInsuredBetOdds,
    initInsuredBetAmount,
    initHedgeBetOdds,
    initPercentInsured,
    initPercentConversion
  );
  const initPayout = getPayout(initInsuredBetOdds, initInsuredBetAmount);
  const initProfit = getProfit(
    initPayout,
    initInsuredBetAmount,
    initHedgeBetAmount
  );
  const initPercentGainOnInsuredAmount = getPercentGainOnInsuredAmount(
    initProfit,
    initInsuredBetAmount,
    initPercentInsured
  );
  const [values, setValues] = useState({
    insuredBetOdds: initInsuredBetOdds,
    insuredBetAmount: initInsuredBetAmount,
    percentInsured: initPercentInsured,
    percentConversion: initPercentConversion,
    hedgeBetOdds: initHedgeBetOdds,
    hedgeBetAmount: initHedgeBetAmount,
    percentGainOnInsuredAmount: initPercentGainOnInsuredAmount,
    payout: initPayout,
    profit: initProfit,
  });

  // Selects the whole textfield on click for easier input
  const handleInputClick = useCallback(
    (
        startRange = 0,
        endRange = 0 // selects [startRange : target.value.length + endRange]
      ) =>
      (event: React.MouseEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        if (startRange == 0 && endRange == 0) {
          target.select();
        } else {
          target.setSelectionRange(startRange, target.value.length + endRange);
        }
      },
    []
  );

  // When a text field is active and you press enter, the next text field is selected
  // The order goes free bet odds, hedge bet odds, free bet amount
  const textfield1 = useRef<HTMLInputElement>(null);
  const textfield2 = useRef<HTMLInputElement>(null);
  const textfield3 = useRef<HTMLInputElement>(null);
  const textfield4 = useRef<HTMLInputElement>(null);
  const textfield5 = useRef<HTMLInputElement>(null);
  const handleKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLInputElement>,
      nextInputRef: React.RefObject<HTMLInputElement>
    ) => {
      if (event.key === "Enter" && nextInputRef.current) {
        event.preventDefault();
        nextInputRef.current.focus();
        if (nextInputRef.current.name === "insuredBetAmount") {
          // HARDCODED - FIX FOR REUSABILITY
          nextInputRef.current.setSelectionRange(
            2,
            nextInputRef.current.value.length
          );
        } else if (
          nextInputRef.current.name === "percentInsured" ||
          nextInputRef.current.name === "percentConversion"
        ) {
          // HARDCODED - FIX FOR REUSABILITY
          nextInputRef.current.setSelectionRange(
            0,
            nextInputRef.current.value.length - 2
          );
        } else {
          nextInputRef.current.select();
        }
      }
    },
    []
  );

  // Updates the text field that the user inputs a new number into.
  // Does not recalculate - useEffect does this.
  const handleValueChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    if (name === "insuredBetAmount") {
      const regex = /^\$ (\d*?\.?\d{0,2})$/; // Matches a dollar value
      if (regex.test(value) || value === "") {
        setValues({ ...values, [name]: value });
      }
    } else if (name === "percentInsured" || name === "percentConversion") {
      const regex = /^(\d*\.?\d*) %$/; // Matches a percent value
      if (regex.test(value) || value === "") {
        setValues({ ...values, [name]: value });
      }
    } else {
      setValues({ ...values, [name]: value });
      // [name] is a computed property that takes on the value of name in event.target.
      // If we were to call setValues({ ...values, name: +value });, it would update the value in values that is actually called name, which doesn't exist here.
    }
  };

  // Recalculates hedge bet amount based on new user input
  useEffect(() => {
    let hedge = 0;
    try {
      hedge = getHedgeAmount(
        values.insuredBetOdds,
        values.insuredBetAmount,
        values.hedgeBetOdds,
        values.percentInsured,
        values.percentConversion
      );
    } catch (error) {} // If improper American odds have been entered
    setValues({
      ...values,
      hedgeBetAmount: hedge,
    });
  }, [
    values.insuredBetOdds,
    values.hedgeBetOdds,
    values.insuredBetAmount,
    values.percentInsured,
    values.percentConversion,
  ]); // Listens for a change to any of the values in the dependency array.

  // Recalculates payout and profit when hedge bet amount is updated
  useEffect(() => {
    let payout = 0;
    let profit = 0;
    let percentGainOnInsuredAmount = 0;
    try {
      payout = getPayout(values.insuredBetOdds, values.insuredBetAmount);
      profit = getProfit(
        payout,
        values.insuredBetAmount,
        values.hedgeBetAmount
      );
      percentGainOnInsuredAmount = getPercentGainOnInsuredAmount(
        profit,
        values.insuredBetAmount,
        values.percentInsured
      );
    } catch (error) {} // If improper American odds have been entered
    setValues({
      ...values,
      payout: payout,
      profit: profit,
      percentGainOnInsuredAmount: percentGainOnInsuredAmount,
    });
  }, [values.hedgeBetAmount]);

  // Converts American odds to European odds
  function a2e(american: number): number {
    if (american >= 100) {
      return (Number(american) + 100) / 100; // For some reason, if you don't explicitly convert american to a number, it treats it as a string. So if american===240, american+100===240100.
    } else if (american < -100) {
      return (-american + 100) / -american;
    } else {
      throw new Error(
        "American odds must be greater than or equal to +100, or strictly less than -100."
      );
    }
  }

  function roundCurrency(amt: number, round = true): string {
    const rounded = Number(amt.toFixed(2));
    if (!round) {
      return "$ " + amt;
    } else if (rounded % 1 === 0) {
      return "$ " + rounded;
    } else {
      return "$ " + amt.toFixed(2);
    }
  }

  function getHedgeAmount(
    insuredBetOdds: number,
    insuredBetAmount: string,
    hedgeBetOdds: number,
    percentInsured: string,
    percentConversion: string
  ): number {
    const insuredBetAmountNum = Number(insuredBetAmount.substring(2));
    const fractionInsured = Number(percentInsured.slice(0, -2)) / 100;
    const fractionConversion = Number(percentConversion.slice(0, -2)) / 100;
    return (
      (a2e(insuredBetOdds) * insuredBetAmountNum -
        insuredBetAmountNum * fractionInsured * fractionConversion) /
      a2e(hedgeBetOdds)
    );
  }

  // ' % of insured amount ' is a metric for measuring the quality of odds
  // returns 1 + profit / (insured bet amt * insured %)
  // For example: if 50% of a $40 bet was insured ($20 total insurance) and the guaranteed payout was $44, then the % of insured bet would be 110%.
  function getPercentGainOnInsuredAmount(
    profit: number,
    insuredBetAmount: string,
    percentInsured: string
  ): number {
    return (
      100 *
      (profit /
        ((Number(insuredBetAmount.substring(2)) *
          Number(percentInsured.slice(0, -2))) /
          100))
    );
  }

  function getPayout(insuredBetOdds: number, insuredBetAmount: string): number {
    return a2e(insuredBetOdds) * Number(insuredBetAmount.substring(2));
  }

  function getProfit(
    payout: number,
    insuredBetAmount: string,
    hedgeBetAmount: number
  ): number {
    return payout - Number(insuredBetAmount.substring(2)) - hedgeBetAmount;
  }

  return (
    <>
      <h2>{title}</h2>
      <table className="table">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">Odds</th>
            <th scope="col">Bet Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Insured Bet</th>
            <td>
              <input
                type="number"
                name="insuredBetOdds"
                placeholder="-110"
                value={values.insuredBetOdds || ""}
                ref={textfield1}
                onKeyDown={(event) => handleKeyDown(event, textfield2)}
                onChange={handleValueChange}
                onClick={handleInputClick()}
              ></input>
            </td>
            <td>
              <input
                type="text"
                name="insuredBetAmount"
                placeholder="$ 0"
                value={values.insuredBetAmount}
                ref={textfield3}
                onKeyDown={(event) => handleKeyDown(event, textfield4)}
                onChange={handleValueChange}
                onClick={handleInputClick(2)}
              ></input>
            </td>
          </tr>
          <tr>
            <th scope="row">Hedge Bet</th>
            <td>
              <input
                type="number"
                name="hedgeBetOdds"
                placeholder="-110"
                value={values.hedgeBetOdds || ""}
                ref={textfield2}
                onKeyDown={(event) => handleKeyDown(event, textfield3)}
                onChange={handleValueChange}
                onClick={handleInputClick()}
              ></input>
            </td>
            <td>
              <input
                type="text"
                name="hedgeBetAmount"
                placeholder="$ 0"
                value={roundCurrency(values.hedgeBetAmount) || ""}
                readOnly
              ></input>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">% Insured</th>
            <th scope="col">Assumed % Free Bet Conversion</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
                type="text"
                name="percentInsured"
                placeholder="100 %"
                value={values.percentInsured}
                ref={textfield4}
                onKeyDown={(event) => handleKeyDown(event, textfield5)}
                onChange={handleValueChange}
                onClick={handleInputClick(0, -2)}
              ></input>
            </td>
            <td>
              <input
                type="text"
                name="percentConversion"
                placeholder="100 %"
                value={values.percentConversion}
                ref={textfield5}
                onKeyDown={(event) => handleKeyDown(event, textfield1)}
                onChange={handleValueChange}
                onClick={handleInputClick(0, -2)}
              ></input>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">% Gain on Insured Amount</th>
            <th scope="col">Payout</th>
            <th scope="col">Profit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
                type="text"
                name="percentGainOnInsuredAmount"
                placeholder="0 %"
                value={
                  (values.percentGainOnInsuredAmount.toFixed(2) || "--") + " %"
                }
                onChange={handleValueChange}
                readOnly
              ></input>
            </td>
            <td>
              <input
                type="text"
                name="payout"
                placeholder="$ 0"
                value={roundCurrency(values.payout) || ""}
                onChange={handleValueChange}
                readOnly
              ></input>
            </td>
            <td>
              <input
                type="text"
                name="profit"
                placeholder="$ 0"
                value={roundCurrency(values.profit) || ""}
                onChange={handleValueChange}
                readOnly
              ></input>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default BetInsuranceCalculator;

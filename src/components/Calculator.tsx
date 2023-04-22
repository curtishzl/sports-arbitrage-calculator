import React, {
  ChangeEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "./Calculator.css";

interface Props {
  title: string;
  numRows: number;
  numCols: number;
}

/*
We want to keep the rounded values that appear on the screen separate from the actual values which are more precise.
The rounded values will also be formatted with +, -, $ and % and formatted to a constant number of decimal places.
*/

const Calculator = ({ title, numRows, numCols }: Props) => {
  const initFreeBetOdds = -110;
  const initFreeBetAmount = "$ 10";
  const initHedgeBetOdds = -110;
  const initHedgeBetAmount = getHedgeAmount(
    initFreeBetOdds,
    initFreeBetAmount,
    initHedgeBetOdds
  );
  const initPercentConversion = getPercentConversion(
    initFreeBetOdds,
    initHedgeBetOdds
  );
  const initPayout = getPayout(initHedgeBetOdds, initHedgeBetAmount);
  const initProfit = getProfit(initPayout, initHedgeBetAmount);
  const [values, setValues] = useState({
    freeBetOdds: initFreeBetOdds,
    freeBetAmount: initFreeBetAmount,
    hedgeBetOdds: initHedgeBetOdds,
    hedgeBetAmount: initHedgeBetAmount,
    percentConversion: initPercentConversion,
    payout: initPayout,
    profit: initProfit,
  });

  // Updates the text field that the user inputs a new number into.
  // Does not recalculate - useEffect does this.
  const handleValueChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    if (name === "freeBetAmount") {
      const regex = /^\$ (\d*?\.?\d{0,2})$/; // Matches a dollar value
      if (regex.test(value) || value === "") {
        setValues({ ...values, [name]: value });
      }
    } else {
      setValues({ ...values, [name]: value });
      // [name] is a computed property that takes on the value of name in event.target.
      // If we were to call setValues({ ...values, name: +value });, it would update the value in values that is actually called name, which doesn't exist here.
    }
  };

  // Selects the whole textfield on click for easier input
  const handleInputClick = useCallback(
    (startRange = 0) =>
      (event: React.MouseEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        if (startRange == 0) {
          target.select();
        } else {
          target.setSelectionRange(startRange, target.value.length);
        }
      },
    []
  );

  // When a text field is active and you press enter, the next text field is selected
  // The order goes free bet odds, hedge bet odds, free bet amount
  const textfield1 = useRef<HTMLInputElement>(null);
  const textfield2 = useRef<HTMLInputElement>(null);
  const textfield3 = useRef<HTMLInputElement>(null);
  const handleKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLInputElement>,
      nextInputRef: React.RefObject<HTMLInputElement>
    ) => {
      if (event.key === "Enter" && nextInputRef.current) {
        event.preventDefault();
        nextInputRef.current.focus();
        if (nextInputRef.current.name === "freeBetAmount") {  // HARDCODED - FIX FOR REUSABILITY
          nextInputRef.current.setSelectionRange(2, nextInputRef.current.value.length);
        }
        else {
          nextInputRef.current.select();
        }
      }
    },
    []
  );

  // Recalculates hedge bet amount based on new user input
  useEffect(() => {
    try {
      const hedge = getHedgeAmount(
        values.freeBetOdds,
        values.freeBetAmount,
        values.hedgeBetOdds
      );
      const percent = getPercentConversion(
        values.freeBetOdds,
        values.hedgeBetOdds
      );
      setValues({
        ...values,
        hedgeBetAmount: hedge,
        percentConversion: percent,
      });
    } catch {
      // If improper American odds have been entered
      values.hedgeBetAmount = 0.0;
    }
  }, [values.freeBetOdds, values.hedgeBetOdds, values.freeBetAmount]); // Listens for a change to any of the values in the dependency array.

  // Recalculates percent conversion, payout and profit when hedge bet amount is updated
  useEffect(() => {
    const payout = getPayout(values.hedgeBetOdds, values.hedgeBetAmount);
    const profit = getProfit(payout, values.hedgeBetAmount);
    //const percent = (profit / values.freeBetAmount) * 100;  // Div by 0 when FBA is 0
    setValues({
      ...values,
      payout: payout,
      profit: profit,
    });
  }, [values.hedgeBetAmount]);

  // Converts American odds to European odds
  function a2e(american: number): number {
    if (american >= 100) {
      return (Number(american) + 100) / 100; // For some reason, if you don't explicitly convert american to a number, it treats it as a string. So if american===240, american+100===240100.
    } else if (american < -100) {
      return (-american + 100) / -american;
    } else {
      return 0;
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
    freeBetOdds: number,
    freeBetAmount: string,
    hedgeBetOdds: number
  ): number {
    return (
      ((a2e(freeBetOdds) - 1) * Number(freeBetAmount.substring(2))) /
      a2e(hedgeBetOdds)
    );
  }

  function getPercentConversion(
    freeBetOdds: number,
    hedgeBetOdds: number
  ): number {
    return (a2e(freeBetOdds) - 1) * (1 - 1 / a2e(hedgeBetOdds)) * 100; // Calculates % using only the given odds
  }

  function getPayout(hedgeBetOdds: number, hedgeBetAmount: number): number {
    return a2e(hedgeBetOdds) * hedgeBetAmount;
  }

  function getProfit(payout: number, hedgeBetAmount: number): number {
    return payout - hedgeBetAmount;
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
            <th scope="row">Free Bet</th>
            <td>
              <input
                type="number"
                name="freeBetOdds"
                placeholder="-110"
                value={values.freeBetOdds || ""}
                ref={textfield1}
                onKeyDown={(event) => handleKeyDown(event, textfield2)}
                onChange={handleValueChange}
                onClick={handleInputClick()}
              ></input>
            </td>
            <td>
              <input
                type="text"
                name="freeBetAmount"
                placeholder="$ 0"
                value={values.freeBetAmount}
                ref={textfield3}
                onKeyDown={(event) => handleKeyDown(event, textfield1)}
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
            <th scope="col">% of Free Bet</th>
            <th scope="col">Payout</th>
            <th scope="col">Profit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
                type="text"
                name="percentConversion"
                placeholder="0 %"
                value={(values.percentConversion.toFixed(2) || "--") + " %"}
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

export default Calculator;

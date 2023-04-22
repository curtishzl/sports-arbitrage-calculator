import React, { ChangeEvent, useEffect, useState } from "react";

interface Props {
  title: string;
  numRows: number;
  numCols: number;
}

// function getHedgeAmount() {}

const Calculator = ({ title, numRows, numCols }: Props) => {
  const [values, setValues] = useState({
    freeBetOdds: -110,
    freeBetAmount: 0.0,
    hedgeBetOdds: -110,
    hedgeBetAmount: 0.0,
    percentConversion: 0.0,
    payout: 0.0,
    profit: 0.0,
  });

  // Updates the text field that the user inputs a new number into.
  // Does not recalculate - useEffect does this.
  const handleValueChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
    // setValues(event.target.value ? parseInt(event.target.value) : 0);
  };

  // Recalculates hedge bet amount based on new user input
  // Listens for a change to any of the values in the dependency array.
  // In this case, any change to any of the values in the state object `values` will trigger an update.
  useEffect(() => {
    try {
      const hedge = roundCurrency(
        ((a2e(values.freeBetOdds) - 1) * values.freeBetAmount) /
          a2e(values.hedgeBetOdds)
      );
      setValues({
        ...values,
        hedgeBetAmount: hedge,
      });
    } catch {
      // If improper American odds have been entered
      values.hedgeBetAmount = 0.0;
    }
  }, [values.freeBetOdds, values.hedgeBetOdds, values.freeBetAmount]);

  // Recalculates percent conversion, payout and profit when hedge bet amount is updated
  useEffect(() => {
    const payout = roundCurrency(
      a2e(values.hedgeBetOdds) * values.hedgeBetAmount
    );
    const profit = roundCurrency(payout - values.hedgeBetAmount);
    const percent = Number(((profit / values.freeBetAmount) * 100).toFixed(2));
    setValues({
      ...values,
      percentConversion: percent,
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
      throw new Error(
        "American odds must be greater than or equal to +100, or strictly less than -100."
      );
    }
  }

  function roundCurrency(amt: number): number {
    return Number(amt.toFixed(2));
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
                onChange={handleValueChange}
              ></input>
            </td>
            <td>
              <input
                type="number"
                name="freeBetAmount"
                placeholder="$0.00"
                value={values.freeBetAmount || ""}
                onChange={handleValueChange}
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
                onChange={handleValueChange}
              ></input>
            </td>
            <td>
              <input
                type="number"
                name="hedgeBetAmount"
                placeholder="$0.00"
                value={values.hedgeBetAmount || ""}
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
                type="number"
                name="percentConversion"
                placeholder="0.00%"
                value={values.percentConversion || ""}
                onChange={handleValueChange}
                readOnly
              ></input>
            </td>
            <td>
              <input
                type="number"
                name="payout"
                placeholder="$0.00"
                value={values.payout || ""}
                onChange={handleValueChange}
                readOnly
              ></input>
            </td>
            <td>
              <input
                type="number"
                name="profit"
                placeholder="$0.00"
                value={values.profit || ""}
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

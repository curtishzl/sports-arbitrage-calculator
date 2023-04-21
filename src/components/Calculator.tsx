import React from 'react'

interface Props {
    title: string;
    numRows: number;
    numCols: number;
}

const Calculator = ({title, numRows, numCols}: Props) => {
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
              <input type="text" placeholder="-110"></input>
            </td>
            <td>
              <input type="text" placeholder="$0.00"></input>
            </td>
          </tr>
          <tr>
            <th scope="row">Hedge Bet</th>
            <td>
              <input type="text" placeholder="-110"></input>
            </td>
            <td>
              <input type="text" placeholder="$0.00"></input>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default Calculator
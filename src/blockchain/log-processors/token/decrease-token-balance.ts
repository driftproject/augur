import { Augur } from "augur.js";
import * as Knex from "knex";
import { Address, ErrorCallback } from "../../../types";

interface BalanceResult {
  balance: number;
}

export function decreaseTokenBalance(db: Knex, augur: Augur, trx: Knex.Transaction, token: Address, owner: Address, amount: number, callback: ErrorCallback): void {
  trx.first("balance").from("balances").where({ token, owner }).asCallback((err: Error|null, oldBalance?: BalanceResult): void => {
    if (err) return callback(err);
    if (oldBalance == null) return callback(new Error("Could not find balance for token decrease"));
    const balance = oldBalance.balance - amount;
    db.transacting(trx).update({ balance }).into("balances").where({ token, owner }).asCallback(callback);
  });
}

export default function initTransactionsController(app, pool) {
  const show = (request, response) => {
    const quoteId = request.params.id;
    const { userId } = request.cookies;
    const quoteInfo = {};
    // to do: add link to each quote
    const queryTmp = `SELECT quotes.quote, quotes.id as quote_id, quotes.created_at, dogs.name, dogs.id as user_id FROM quotes INNER JOIN dogs ON quotes.quoter_id = dogs.id WHERE quotes.id = ${quoteId}`;
    console.log("query is: ", queryTmp);
    pool
      .query(queryTmp)
      .then((result) => {
        if (result.rows.length === 0) {
          quoteInfo.validity = false;
          return;
        } else {
          quoteInfo.validity = true;
          quoteInfo.info = result.rows[0];
          console.log("heree", result.rows);
          console.log("#########################");
          quoteInfo.info.payer_id = userId;
          return pool.query(
            `SELECT * FROM transactions WHERE quote_id = ${quoteId}`
          );
        }
      })
      .then((result) => {
        quoteInfo.transactions = result.rows;
        console.log(quoteInfo);
        response.render("quote-single", quoteInfo);
      })
      .catch((error) => console.log(error.stack));
  }

  const create = (request, response) => {
    const newTrxn = request.body;
    console.log(newTrxn);
    const inputData = [
      newTrxn.payer_id,
      newTrxn.payee_id,
      newTrxn.quote_id,
      newTrxn.amount,
    ];
    pool
      .query(
        `INSERT INTO transactions (payer_id, payee_id, quote_id, amount) VALUES ($1, $2, $3, $4)`,
        inputData
      )
      .then(() => {
        return pool.query(
          `UPDATE dogs SET bank= bank-${newTrxn.amount} WHERE id=${newTrxn.payer_id}`
        );
      })
      .then(() => {
        return pool.query(
          `UPDATE dogs SET bank= bank+${newTrxn.amount} WHERE id=${newTrxn.payee_id}`
        );
      })
      .then((result) => {
        response.redirect(`/quote/${newTrxn.quote_id}/tip`);
      })
      .catch((error) => console.log(error.stack));
  }

  return {
    show,
    create
  }
}